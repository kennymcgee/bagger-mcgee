"use client";
import { useState } from "react";
import { statuses, validateDecision, type DecisionState, type ReviewStatus } from "@/ingestion/decision-policy";
import { saveDecision } from "./decision-actions";

export function DecisionForm({id, initial, sample, onSaved}: {id: string; initial: DecisionState; sample: boolean; onSaved: (state: DecisionState) => void}) {
  const [state, setState] = useState(initial);
  const [status, setStatus] = useState<ReviewStatus>(initial.status);
  const [note, setNote] = useState(""); const [message, setMessage] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setMessage("");
    try {
      const valid = validateDecision(status, note, state.revision);
      const result = sample ? {decision: { status, revision: state.revision + 1, history: [...state.history, {revision: state.revision + 1, from: state.status, status, note: valid.note, actor: "Sample reviewer", role: "owner" as const, at: new Date().toISOString()}] }} : await saveDecision(id, status, note, state.revision);
      if (result.error) { setMessage(result.error); return; }
      if (result.decision) { setState(result.decision); onSaved(result.decision); setNote(""); setMessage(sample ? "Practice decision applied. Refreshing clears sample changes." : "Decision saved locally with its history."); }
    } catch { setMessage("Could not save. Check your connection and refresh before trying again."); }
    finally { setPending(false); }
  }
  return <section><h3>Review decision</h3><p className="admin-note">Resolved and Dismissed do not approve or publish an item. {sample ? "Practice changes disappear on refresh." : "Decisions are saved on this computer."}</p>
    {state.error ? <p role="alert">History could not be read safely. Saving is disabled for this item.</p> : <form onSubmit={submit}>
      <label htmlFor={`${id}-status`}>Status</label><select id={`${id}-status`} value={status} onChange={e => setStatus(e.target.value as ReviewStatus)} disabled={pending}>{statuses.map(value => <option key={value}>{value}</option>)}</select>
      <label htmlFor={`${id}-note`}>Review note (required)</label><textarea id={`${id}-note`} value={note} onChange={e => setNote(e.target.value)} maxLength={2000} required rows={3} disabled={pending} />
      <button disabled={pending || !note.trim()}>{pending ? "Saving…" : sample ? "Try sample decision" : "Save decision"}</button>
    </form>}
    <p role="status">{message}</p><h3>History</h3><p>Prepared for review by the local import checker. Status: New.</p>
    <ol>{state.history.map(entry => <li key={entry.revision}><strong>{entry.from} → {entry.status}</strong><p style={{whiteSpace:"pre-wrap"}}>{entry.note}</p><p className="admin-note">{entry.at} · {entry.role} · {entry.actor}</p></li>)}</ol>
  </section>;
}
