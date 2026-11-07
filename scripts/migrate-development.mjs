import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rootCertificates } from 'node:tls';
import { parse } from 'dotenv';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expectedRef = 'selvtumjitqxtwpmgcgb';
const tableNames = ['vendors', 'products', 'offers', 'import_batches'];
let client;
let stage = 'configuration';
let report;

try {
  if (!process.argv.includes('--apply')) throw new Error('Use --apply for the development migration.');
  const env = parse(fs.readFileSync(path.join(root, '.env.local')));
  const url = new URL(env.DATABASE_URL);
  if (env.APP_ENV !== 'development' || process.env.VERCEL_ENV || env.VERCEL_ENV || url.protocol !== 'postgresql:' || url.hostname !== 'aws-0-us-west-2.pooler.supabase.com' || url.port !== '5432' || url.pathname !== '/postgres' || decodeURIComponent(url.username) !== `postgres.${expectedRef}` || url.search || !url.password || env.NEXT_PUBLIC_SUPABASE_URL !== `https://${expectedRef}.supabase.co`) {
    throw new Error('Development database guard refused this configuration.');
  }
  const ca = fs.readFileSync(path.join(root, 'certs', 'supabase-ca.crt'), 'utf8');
  client = postgres(env.DATABASE_URL, { ssl: { rejectUnauthorized: true, ca: [...rootCertificates, ca] }, prepare: false, max: 1, connect_timeout: 15, idle_timeout: 5, onnotice: () => {} });
  stage = 'preflight';
  const existing = await client`select tablename from pg_tables where schemaname = 'public' and tablename in ${client(tableNames)}`;
  const [journal] = await client`select to_regclass('drizzle.__drizzle_migrations') as name`;
  if (existing.length && !journal.name) throw new Error('Existing catalog tables require review before migration.');
  stage = 'migration';
  await migrate(drizzle(client), { migrationsFolder: path.join(root, 'drizzle') });
  stage = 'verification';
  const tables = await client`select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename in ${client(tableNames)}`;
  if (tables.length !== 4 || tables.some(table => !table.rowsecurity)) throw new Error('Private table verification failed.');
  const grants = await client`select table_name from information_schema.role_table_grants where table_schema = 'public' and table_name in ${client(tableNames)} and grantee in ('anon', 'authenticated', 'PUBLIC')`;
  if (grants.length) throw new Error('Unexpected public grants.');
  const rollback = new Error('Rollback validation rows');
  const passed = [];
  try {
    await client.begin(async tx => {
      const [vendor] = await tx`insert into vendors (name, slug, website_url) values ('BUILD-01 test', ${'build-01-test-' + Date.now()}, 'https://example.com') returning id`;
      const [product] = await tx`insert into products (name, brand_name, manufacturer_part_number, canonical_key) values ('Test part', 'Test brand', 'TEST-01', ${'build-01-test-' + Date.now()}) returning id`;
      async function expectConstraint(name, expectedCode, operation) {
        try { await tx.savepoint(operation); } catch (error) {
          if (error.code === expectedCode) { passed.push(name); return; }
          throw error;
        }
        throw new Error('Constraint did not reject invalid test row.');
      }
      await expectConstraint('negative price rejected', '23514', sp => sp`insert into offers (vendor_id, product_id, vendor_sku, destination_url, item_price) values (${vendor.id}, ${product.id}, 'negative', 'https://example.com/part', -1)`);
      await expectConstraint('non-USD rejected', '23514', sp => sp`insert into offers (vendor_id, product_id, vendor_sku, destination_url, item_price, currency) values (${vendor.id}, ${product.id}, 'currency', 'https://example.com/part', 10, 'EUR')`);
      await expectConstraint('unverified approved offer rejected', '23514', sp => sp`insert into offers (vendor_id, product_id, vendor_sku, destination_url, item_price, review_status) values (${vendor.id}, ${product.id}, 'unverified', 'https://example.com/part', 10, 'approved')`);
      await tx`insert into offers (vendor_id, product_id, vendor_sku, destination_url, item_price) values (${vendor.id}, ${product.id}, 'unique-sku', 'https://example.com/part', 10)`;
      await expectConstraint('duplicate vendor SKU rejected', '23505', sp => sp`insert into offers (vendor_id, product_id, vendor_sku, destination_url, item_price) values (${vendor.id}, ${product.id}, 'unique-sku', 'https://example.com/other', 12)`);
      throw rollback;
    });
  } catch (error) { if (error !== rollback) throw error; }
  report = { status: 'passed', stage, tables: tableNames, rowSecurity: true, publicGrants: false, checks: passed, testRowsRolledBack: true };
  console.log('DATABASE READY: Four private tables created and checks passed. No test rows were kept.');
} catch (error) {
  const safeCodes = ['CONNECT_TIMEOUT', 'SELF_SIGNED_CERT_IN_CHAIN', 'EACCES', 'EPERM'];
  const safeCode = /^[0-9A-Z]{5}$/.test(error?.code ?? '') || safeCodes.includes(error?.code);
  report = { status: 'failed', stage, code: safeCode ? error.code : 'CHECK_FAILED' };
  console.log(`Database setup stopped at ${stage}. Tell Sam: database setup stopped. No credentials were printed.`);
  process.exitCode = 1;
} finally {
  if (client) await client.end({ timeout: 5 }).catch(() => {});
  fs.writeFileSync(path.join(root, '.database-migration-result.json'), JSON.stringify({ ...report, checkedAt: new Date().toISOString() }, null, 2));
}
