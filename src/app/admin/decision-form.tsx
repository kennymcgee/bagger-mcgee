"use client";
import { useState } from "react";
import { statuses, validateDecision, type DecisionState, type ReviewStatus } from "@/ingestion/decision-policy";
import { correctionFields, validateCorrection, type CorrectionField } from "@/ingestion/corrections";
import { ApprovalPanel } from "./approval-panel";
import { saveDecision } from "./decision-actions";

export function DecisionForm({id, initial, sample, role, onSaved}: {id: string; initial: DecisionState; sample: boolean; role: "owner" | "reviewer"; onSaved: (state: DecisionState) => void}) {
  const [editing, setEditing] = useState(false);
  const [field, setField] = useState<CorrectionField>("name");
  const [value, setValue] = useState(""); const [source, setSource] = useState(""); const [evidence, setEvidence] = useState("");
  const [state, setState] = useState(initial);
  const [status, setStatus] = useState<ReviewStatus>(initial.status);
  const [note, setNote] = useState(""); const [message, setMessage] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    try {
      const valid = validateDecision(status, note, state.revision);
      const correction = editing ? validateCorrection({field, value, source, evidence}) : undefined;
      const previousCorrection = correction ? state.history.findLast(entry => entry.correction?.field === field)?.correction?.value ?? null : undefined;
      const result = sample ? {decision: { status, revision: state.revision + 1, history: [...state.history, {correction, previousCorrection, revision: state.revision + 1, from: state.status, status, note: valid.note, actor: "Sample reviewer", role: "owner" as const, at: new Date().toISOString()}] }} : await saveDecision(id, status, note, state.revision, correction);
      if (result.error) { setMessage(result.error); return; }
      if (result.decision) { setState(result.decision); onSaved(result.decision); setNote(""); setEditing(false); setValue(""); setSource(""); setEvidence(""); setMessage(sample ? "Practice decision applied. Refreshing clears sample changes." : "Decision saved to the development database with its history."); }
    } catch (error) { setMessage(error instanceof Error && /^(Correction:|Choose a status)/.test(error.message) ? error.message : "Could not save. Check your connection and refresh before trying again."); }
    finally { setPending(false); }
  }
  return <section><h3>Review decision</h3><p className="admin-note">Resolved and Dismissed do not approve or publish an item. {sample ? "Practice changes disappear on refresh." : "Decisions are saved in your private development database."}</p>
    {state.error ? <p role="alert">History could not be read safely. Saving is disabled for this item.</p> : <form onSubmit={submit}>
      <label htmlFor={`${id}-status`}>Status</label><select id={`${id}-status`} value={status} onChange={e => setStatus(e.target.value as ReviewStatus)} disabled={pending}>{statuses.map(value => <option key={value}>{value}</option>)}</select>
      <label htmlFor={`${id}-note`}>Review note (required)</label><textarea id={`${id}-note`} value={note} onChange={e => setNote(e.target.value)} maxLength={2000} required rows={3} disabled={pending} />
      <label><input type="checkbox" checked={editing} onChange={e => setEditing(e.target.checked)} disabled={pending} /> Include a product correction</label>
      {editing && <fieldset disabled={pending}><legend>Correction and supporting evidence</legend>
        <p>These are proposed corrections for review, not verified catalog changes. Add one field per save.</p>
        <label htmlFor={`${id}-field`}>Field to correct</label><select id={`${id}-field`} value={field} onChange={e => {setField(e.target.value as CorrectionField); setValue("");}}>{Object.entries(correctionFields).map(([key,label]) => <option value={key} key={key}>{label}</option>)}</select>
        <label htmlFor={`${id}-value`}>Corrected value</label>{field === "origin" || field === "condition" ? <select id={`${id}-value`} required value={value} onChange={e => setValue(e.target.value)}><option value="">Choose a value</option>{(field === "origin" ? ["oem","aftermarket","unknown"] : ["new","used","unknown"]).map(v => <option key={v}>{v}</option>)}</select> : <input id={`${id}-value`} required maxLength={500} value={value} onChange={e => setValue(e.target.value)} />}
        <label htmlFor={`${id}-source`}>Evidence link</label><input id={`${id}-source`} type="url" required maxLength={500} value={source} onChange={e => setSource(e.target.value)} placeholder="https://manufacturer.example/product" />
        <p className="admin-note">Use a public HTTPS source without login details, query parameters, or a fragment. Links are recorded as text and are not fetched automatically.</p>
        <label htmlFor={`${id}-evidence`}>What does this evidence support?</label><textarea id={`${id}-evidence`} required maxLength={2000} rows={3} value={evidence} onChange={e => setEvidence(e.target.value)} />
      </fieldset>}
      <button disabled={pending || !note.trim()}>{pending ? "Saving…" : sample ? "Try sample decision" : "Save decision"}</button>
    </form>}
    <p role="status">{message}</p><ApprovalPanel id={id} state={state} sample={sample} role={role} onSaved={next => { setState(next); onSaved(next); }} /><h3>History</h3><p>Prepared for review by the local import checker. Status: New.</p>
    <ol>{state.history.map(entry => <li key={entry.revision}><strong>{entry.reviewAction ? `${entry.reviewAction.action}: correction #${entry.reviewAction.target}` : `${entry.from} → ${entry.status}`}</strong><p style={{whiteSpace:"pre-wrap"}}>{entry.note}</p>{entry.correction && <div><p><strong>{correctionFields[entry.correction.field]}</strong>: {entry.previousCorrection ?? "Initial proposal (see comparison above)"} → {entry.correction.value}</p><p>Evidence source: {entry.correction.source}</p><p>Reviewer evidence summary: {entry.correction.evidence}</p></div>}<p className="admin-note">{entry.at} · {entry.role} · {entry.actor}</p></li>)}</ol>
  </section>;
}



