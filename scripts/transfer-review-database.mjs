import { readFile, writeFile, readdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { createReviewConnection } from '../src/db/connection.ts';
import { transferPacket, databaseHistory } from '../src/db/review-store.ts';
import { readDecisions } from '../src/ingestion/decisions.ts';
import { createDecision } from '../src/ingestion/decision-history.ts';
import { emptyDecision } from '../src/ingestion/decision-policy.ts';
import { packetCards } from '../src/ingestion/review-display.ts';
import { prepareReview } from '../src/ingestion/review.ts';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(root);
let client; let stage = 'configuration'; let report;
try {
  if (!process.argv.includes('--apply')) throw new Error('Explicit apply required');
  const env = parse(await readFile('.env.local'));
  if (process.env.VERCEL_ENV || env.VERCEL_ENV || env.NEXT_PUBLIC_SUPABASE_URL !== 'https://selvtumjitqxtwpmgcgb.supabase.co') throw new Error('Wrong environment');
  process.env.APP_ENV = env.APP_ENV; process.env.DATABASE_URL = env.DATABASE_URL;
  client = createReviewConnection();
  stage = 'local validation';
  async function entries(folder) {
    try { const info = await lstat(folder); if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Unsafe directory'); return await readdir(folder); }
    catch (e) { if(e.code === 'ENOENT') return []; throw e; }
  }
  await entries("local-imports");
  const sources = []; const itemIds = new Set();
  const files = await entries('local-imports/reviews');
  if(files.length > 100) throw new Error('Transfer limit exceeded');
  for(const name of files) {
    if(!/^[a-f0-9]{64}\.json$/.test(name)) throw new Error('Unexpected packet file');
    const filename = path.join('local-imports/reviews',name); const stat = await lstat(filename);
    if(!stat.isFile() || stat.isSymbolicLink() || stat.size > 20*1024*1024) throw new Error('Unsafe packet');
    const packet = JSON.parse(await readFile(filename,'utf8')); const id = name.slice(0,-5);
    const cards = packetCards(packet,id); if(!cards) throw new Error('Invalid packet');
    const histories = {};
    for(const card of cards) {itemIds.add(card.id.replace(':','-')); histories[card.id] = (await readDecisions(root,card.id)).history;}
    sources.push({packet,id,histories});
  }
  for(const folder of await entries('local-imports/decisions')) if(!itemIds.has(folder)) throw new Error('Orphan local history needs review');
  stage = 'schema';
  await client.begin(async tx => {await tx.unsafe(await readFile('migrations/001-review-storage.sql','utf8'));});
  stage = 'privacy checks';
  const names = ['review_packets','review_items','review_events'];
  const tables = await client`select tablename,rowsecurity from pg_tables where schemaname='public' and tablename in ${client(names)}`;
  if(tables.length!==3 || tables.some(t=>!t.rowsecurity)) throw new Error('RLS check failed');
  const grants = await client`select table_name from information_schema.role_table_grants where table_schema='public' and table_name in ${client(names)} and grantee in ('PUBLIC','anon','authenticated')`;
  if(grants.length) throw new Error('Public grants found');
  stage = 'transaction checks';
  const rollback = new Error('rollback');
  try {await client.begin(async tx=>{
    const packet=prepareReview(JSON.stringify({formatVersion:1,rows:[{vendorSku:'ROLLBACK-'+Date.now(),name:'Rollback test',brandName:'Test',manufacturerPartNumber:'QA',variantAttributes:{},destinationUrl:'https://example.com',itemPrice:'1',currency:'USD',quantity:1}]}),'00000000-0000-4000-8000-000000000099',new Date().toISOString());
    await transferPacket(tx,packet,packet.packetId,{}); const id=packet.packetId+':1';
    const event=createDecision(emptyDecision(),{status:'In Review',note:'Rollback test',revision:0},'00000000-0000-4000-8000-000000000099','owner');
    await tx`insert into public.review_events(item_id,revision,event) values (${id},1,${tx.json(event)})`;
    if((await databaseHistory(tx,id)).revision!==1) throw new Error('History read failed');
    let rejected=false; try {await tx.savepoint(sp=>sp`update public.review_events set event=event where item_id=${id}`);} catch(e) {if(e.code==='P0001') rejected=true; else throw e;}
    if(!rejected) throw new Error('Immutability failed');
    let duplicate=false; try {await tx.savepoint(sp=>sp`insert into public.review_events(item_id,revision,event) values (${id},1,${sp.json(event)})`);} catch(e) {if(e.code==='23505') duplicate=true; else throw e;}
    if(!duplicate) throw new Error('Revision uniqueness failed');
    await transferPacket(tx,packet,packet.packetId,{[id]:[event]});
    let conflict=false;
    try {await tx.savepoint(sp=>transferPacket(sp,packet,packet.packetId,{[id]:[{...event,note:'Conflict'}]}));} catch(e) {if(e.message==='Conflicting review history.') conflict=true; else throw e;}
    if(!conflict) throw new Error('Conflict detection failed');
    const corrections = [
      {correction:{field:'name',value:'Corrected test',source:'https://example.com/test',evidence:'Synthetic verification'}},
      {reviewAction:{target:2,action:'verify'}},
      {reviewAction:{target:2,action:'approve'}},
      {reviewAction:{target:2,action:'revoke'}},
    ];
    for(const extra of corrections) {
      const state=await databaseHistory(tx,id);
      const next=createDecision(state,{status:state.status,note:'Rollback workflow test',revision:state.revision,...extra},'00000000-0000-4000-8000-000000000099','owner');
      await tx`insert into public.review_events(item_id,revision,event) values (${id},${next.revision},${tx.json(next)})`;
    }
    if((await databaseHistory(tx,id)).history.length!==5) throw new Error('Workflow persistence failed');
    throw rollback;
  });} catch(e) {if(e!==rollback) throw e;}
  stage = 'transfer';
  let items=0;
  await client.begin(async tx=>{for(const source of sources) items+=await transferPacket(tx,source.packet,source.id,source.histories);});
  report={status:'passed',packets:sources.length,items,localFilesPreserved:true,privacyChecks:true,transactionChecks:true,testRowsRolledBack:true};
  console.log(`REVIEW DATABASE READY: ${sources.length} packet(s), ${items} item(s) checked/transferred. Local originals kept. Test rows rolled back.`);
} catch(e) {
  report={status:'failed',stage,code:/^[A-Z0-9_]{5,30}$/.test(e?.code??'')?e.code:'CHECK_FAILED'};
  console.log(`Review database setup stopped at ${stage}. Tell Sam: review database setup stopped. No credentials were printed.`); process.exitCode=1;
} finally {
  if(client) await client.end({timeout:5}).catch(()=>{});
  await writeFile('.review-database-result.json',JSON.stringify({...report,checkedAt:new Date().toISOString()},null,2));
}

