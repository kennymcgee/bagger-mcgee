import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {appendDecision,readDecisions} from '../src/ingestion/decisions.ts';
import {correctionReviews} from '../src/ingestion/approvals.ts';
const id='c'.repeat(64)+':1', actor='00000000-0000-4000-8000-000000000001';
const correction={field:'name',value:'Proposed name',source:'https://example.com/item',evidence:'Test source description'};
test('approval requires verified current evidence and Owner; rejection invalidates approval',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'bagger-approval-'));
 try {
 await appendDecision(root,id,{status:'New',note:'Correction',revision:0,correction},actor,'owner');
 const action=(revision,action,role='owner',target=1)=>appendDecision(root,id,{status:'New',note:'Reason',revision,reviewAction:{target,action}},actor,role);
 await assert.rejects(action(1,'approve'),/verify/);
 await action(1,'verify','reviewer');
 await assert.rejects(action(2,'approve','reviewer'),/only the Owner/);
 await action(2,'approve');
 assert.equal(correctionReviews(await readDecisions(root,id))[0].approved,true);
 await action(3,'reject','reviewer');
 assert.equal(correctionReviews(await readDecisions(root,id))[0].approved,false);
 await action(4,'verify');
 assert.equal(correctionReviews(await readDecisions(root,id))[0].approved,false);
 await action(5,'approve'); await action(6,'revoke');
 assert.equal(correctionReviews(await readDecisions(root,id))[0].approved,false);
 } finally {await rm(root,{recursive:true,force:true});}
});
test('replacement corrections need new verification and stale approval cannot commit',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'bagger-approval-'));
 try {
 await appendDecision(root,id,{status:'New',note:'Correction',revision:0,correction},actor,'owner');
 await appendDecision(root,id,{status:'New',note:'Verified',revision:1,reviewAction:{target:1,action:'verify'}},actor,'owner');
 await appendDecision(root,id,{status:'New',note:'Replacement',revision:2,correction:{...correction,value:'Changed'}},actor,'owner');
 await assert.rejects(appendDecision(root,id,{status:'New',note:'Stale',revision:2,reviewAction:{target:1,action:'approve'}},actor,'owner'),/another tab/);
 await assert.rejects(appendDecision(root,id,{status:'New',note:'Old',revision:3,reviewAction:{target:1,action:'approve'}},actor,'owner'),/replaced/);
 const current=correctionReviews(await readDecisions(root,id))[0]; assert.equal(current.entry.revision,3); assert.equal(current.verified,false); assert.equal(current.approved,false);
 } finally {await rm(root,{recursive:true,force:true});}
});
