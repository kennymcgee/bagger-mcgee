import { validateReviewAction } from "./approvals.ts";
import { validateCorrection } from "./corrections.ts";
import { emptyDecision, validateDecision, type Decision, type DecisionState } from "./decision-policy.ts";
export type DecisionInput = { status: unknown; note: unknown; revision: unknown; correction?: unknown; reviewAction?: unknown };
export function replayHistory(history: Decision[]): DecisionState {
  if (!Array.isArray(history) || history.length > 1000) throw new Error("Invalid review history.");
  const state = emptyDecision();
  for (const event of history) {
    if (!event || typeof event !== "object") throw new Error("Invalid review history.");
    validateDecision(event.status, event.note, event.revision);
    if (event.revision !== state.revision + 1 || event.from !== state.status || !/^[a-f0-9-]{36}$/i.test(event.actor) || !["owner", "reviewer"].includes(event.role) || !Number.isFinite(Date.parse(event.at))) throw new Error("Invalid review history.");
    if (event.correction) {
      event.correction = validateCorrection(event.correction);
      const previous = state.history.findLast(e => e.correction?.field === event.correction!.field)?.correction?.value ?? null;
      if (event.previousCorrection !== previous) throw new Error("Invalid correction history.");
    }
    if (event.reviewAction) {
      if (event.correction || event.status !== state.status) throw new Error("Invalid approval history.");
      event.reviewAction = validateReviewAction(state, event.reviewAction, event.role);
    }
    state.history.push(event); state.status = event.status; state.revision = event.revision;
  }
  return state;
}
export function createDecision(state: DecisionState, input: DecisionInput, actor: string, role: "owner" | "reviewer"): Decision {
  const valid = validateDecision(input.status, input.note, input.revision);
  if (!/^[a-f0-9-]{36}$/i.test(actor) || !["owner", "reviewer"].includes(role)) throw new Error("Invalid reviewer.");
  const correction = input.correction === undefined ? undefined : validateCorrection(input.correction);

  if (state.revision !== valid.revision) throw new Error("This item changed in another tab. Refresh before saving again.");
  if (state.revision >= 1000) throw new Error("History limit reached.");
  const event: Decision = { revision: state.revision + 1, from: state.status, status: valid.status, note: valid.note, actor, role, at: new Date().toISOString() };
  if (correction) {
    event.correction = correction;
    event.previousCorrection = state.history.findLast(e => e.correction?.field === correction.field)?.correction?.value ?? null;
  }
  if (input.reviewAction !== undefined) {
    if (correction || valid.status !== state.status) throw new Error("Review: save corrections and status changes separately.");
    event.reviewAction = validateReviewAction(state, input.reviewAction, role);
  }
  return event;
}
