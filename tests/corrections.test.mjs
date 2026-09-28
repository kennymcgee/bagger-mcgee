import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateCorrection } from '../src/ingestion/corrections.ts';
import { appendDecision, readDecisions } from '../src/ingestion/decisions.ts';
const correction={field:'name',value:'Corrected product',source:'https://example.com/product',evidence:'Manufacturer lists this name.'};
test('corrections reject unsupported fields, credentials, token URLs and invalid values',()=>{
 for(const change of [{field:'approved'},{field:'__proto__'},{source:'https://user:secret@example.com'},{source:'https://example.com?token=secret'},{source:'javascript:alert(1)'},{field:'itemPrice',value:'-2'},{field:'quantity',value:'1.5'},{field:'condition',value:'refurbished'},{evidence:''}]) assert.throws(()=>validateCorrection({...correction,...change}));
 assert.equal(validateCorrection(correction).value,'Corrected product');
});
test('correction history persists across ordinary decisions and records previous correction',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'bagger-correction-')); const id='b'.repeat(64)+':1', actor='00000000-0000-4000-8000-000000000001';
 try {
 await appendDecision(root,id,{status:'In Review',note:'Fix name',revision:0,correction},actor,'owner');
 await appendDecision(root,id,{status:'Waiting on VENDOR',note:'Need confirmation',revision:1},actor,'reviewer');
 await appendDecision(root,id,{status:'In Review',note:'Refined name',revision:2,correction:{...correction,value:'Second proposal'}},actor,'owner');
 const state=await readDecisions(root,id); assert.equal(state.history.length,3); assert.equal(state.history[0].previousCorrection,null); assert.equal(state.history[2].previousCorrection,'Corrected product'); assert.equal(state.history[0].correction.source,correction.source);
 await assert.rejects(appendDecision(root,id,{status:'New',note:'Stale',revision:1,correction},actor,'owner'),/another tab/);
 } finally {await rm(root,{recursive:true,force:true});}
});
