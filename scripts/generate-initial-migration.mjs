import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as schema from '../src/db/schema.ts';

// Native TypeScript support in Node 22.18+ avoids a Windows CLI user-info lookup.
const require = createRequire(import.meta.url);
const { generateDrizzleJson, generateMigration } = require('drizzle-kit/api');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'drizzle');
if (fs.existsSync(path.join(out, 'meta', '_journal.json'))) throw new Error('Initial migration already exists. Use drizzle-kit generate for subsequent migrations.');
const empty = generateDrizzleJson({});
const snapshot = generateDrizzleJson(schema, '00000000-0000-0000-0000-000000000000');
const statements = await generateMigration(empty, snapshot);
statements.push('REVOKE ALL ON TABLE public.vendors, public.products, public.offers, public.import_batches FROM PUBLIC, anon, authenticated;');
fs.mkdirSync(path.join(out, 'meta'), { recursive: true });
fs.writeFileSync(path.join(out, '0000_initial_catalog.sql'), statements.join('\n--> statement-breakpoint\n') + '\n');
fs.writeFileSync(path.join(out, 'meta', '0000_snapshot.json'), JSON.stringify(snapshot, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'meta', '_journal.json'), JSON.stringify({ version: '7', dialect: 'postgresql', entries: [{ idx: 0, version: '7', when: Date.now(), tag: '0000_initial_catalog', breakpoints: true }] }, null, 2) + '\n');
console.log(`Generated initial catalog migration (${statements.length} statements).`);
