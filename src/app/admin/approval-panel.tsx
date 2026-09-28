"use client";
import { useState } from "react";
import { correctionReviews, validateReviewAction, type ReviewAction } from "@/ingestion/approvals";
import { correctionFields } from "@/ingestion/corrections";
import { validateDecision, type DecisionState } from "@/ingestion/decision-policy";
import { saveDecision } from "./decision-actions";

export function ApprovalPanel({id, state, sample, role, onSaved}: {id:string; state:DecisionState; sample:boolean; role:"owner"|"reviewer"; onSaved:(state:DecisionState)=>void}) {
  const [note,setNote]=useState(""); const [message,setMessage]=useState(""); const [pending,setPending]=useState(false);
  const items=correctionReviews(state);
  async function act(target:number, action:ReviewAction["action"]) {
    setPending(true); setMessage("");
    try {
      const valid=validateDecision(state.status,note,state.revision);
      const reviewAction=validateReviewAction(state,{target,action},role);
      const result=sample ? {decision:{...state,revision:state.revision+1,history:[...state.history,{revision:state.revision+1,from:state.status,status:state.status,note:valid.note,actor:"Sample reviewer",role,at:new Date().toISOString(),reviewAction}]}} : await saveDecision(id,state.status,note,state.revision,undefined,reviewAction);
      if(result.error) {setMessage(result.error); return;}
      if(result.decision) {onSaved(result.decision); setNote(""); setMessage(sample ? "Practice review recorded. Refresh clears it." : "Review recorded locally. No catalog changes were made.");}
    } catch(error) {setMessage(error instanceof Error && /^(Review:|Choose a status)/.test(error.message) ? error.message : "Could not record review. Refresh before retrying.");}
    finally {setPending(false);}
  }
  if(!items.length) return <section><h3>Evidence verification and approval</h3><p>Save a correction with supporting evidence to begin its review.</p></section>;
  return <section><h3>Evidence verification and approval</h3><p>Read the recorded source yourself before verifying. Approval covers only this correction and its evidence; it does not approve the whole product or publish anything.</p>
    <label htmlFor={`${id}-review-reason`}>Verification or approval reason (required)</label><textarea id={`${id}-review-reason`} rows={3} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)} disabled={pending||state.error} />
    {items.map(({entry,verified,approved,rejected})=><fieldset key={entry.revision} disabled={pending||state.error}><legend>{correctionFields[entry.correction!.field]} — correction #{entry.revision}</legend>
      <p><strong>Proposed value:</strong> {entry.correction!.value}</p><p><strong>Source:</strong> {entry.correction!.source}</p><p><strong>Evidence summary:</strong> {entry.correction!.evidence}</p>
      <p><strong>{approved ? "Approved correction" : verified ? "Evidence verified — awaiting Owner approval" : rejected ? "Evidence rejected — not approved" : "Evidence not verified — not approved"}</strong></p>
      <button type="button" disabled={!note.trim()} onClick={()=>act(entry.revision,"verify")}>Verify evidence</button>{" "}
      <button type="button" disabled={!note.trim()} onClick={()=>act(entry.revision,"reject")}>Reject evidence</button>{" "}
      {role==="owner" && <><button type="button" disabled={!note.trim()||!verified||approved} onClick={()=>act(entry.revision,"approve")}>Approve correction</button>{" "}<button type="button" disabled={!note.trim()||!approved} onClick={()=>act(entry.revision,"revoke")}>Revoke approval</button></>}
      {role!=="owner" && <p>Owner approval is required after evidence verification.</p>}
    </fieldset>)}<p role="status">{message}</p>
  </section>;
}
