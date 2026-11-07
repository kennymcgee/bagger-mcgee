import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { appendDecision, readDecisions } from '../src/ingestion/decisions.ts';
import { validateDecision } from '../src/ingestion/decision-policy.ts';
const id='a'.repeat(64)+':1', actor='00000000-0000-4000-8000-000000000001';
test('decisions persist history, retain notes and permit reopening',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'bagger-decisions-'));
 try {
  await appendDecision(root,id,{status:'Resolved',note:'Checked source',revision:0},actor,'owner');
  await appendDecision(root,id,{status:'In Review',note:'New evidence',revision:1},actor,'reviewer');
  const state=await readDecisions(root,id); assert.equal(state.status,'In Review'); assert.equal(state.history.length,2); assert.equal(state.history[0].note,'Checked source'); assert.equal(state.history[1].from,'Resolved'); assert.equal(state.history[1].actor,actor);
 } finally {await rm(root,{recursive:true,force:true});}
});
test('concurrent saves cannot overwrite the same revision',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'bagger-decisions-'));
 try { const results=await Promise.allSettled(['In Review','Dismissed'].map(status=>appendDecision(root,id,{status,note:'Reason',revision:0},actor,'owner'))); assert.equal(results.filter(r=>r.status==='fulfilled').length,1); assert.equal((await readDecisions(root,id)).revision,1);
 await assert.rejects(appendDecision(root,id,{status:'New',note:'Stale',revision:0},actor,'owner'),/another tab/);
 } finally {await rm(root,{recursive:true,force:true});}
});
test('invalid inputs and corrupt history fail closed',async()=>{
 for(const values of [['approved','reason',0],['New',' ',0],['New','x'.repeat(2001),0],['New','ok',-1]]) assert.throws(()=>validateDecision(...values));
 const root=await mkdtemp(path.join(tmpdir(),'bagger-decisions-'));
 try {await assert.rejects(readDecisions(root,'../escape')); await appendDecision(root,id,{status:'New',note:'Keep',revision:0},actor,'owner'); await writeFile(path.join(root,'local-imports','decisions',id.replace(':','-'),'000001.json'),'{}'); await assert.rejects(appendDecision(root,id,{status:'Resolved',note:'No',revision:1},actor,'owner'));}
 finally {await rm(root,{recursive:true,force:true});}
});
