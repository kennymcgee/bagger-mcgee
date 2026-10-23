import type { DecisionState } from "./decision-policy.ts";
export type ReviewAction = { target: number; action: "verify" | "reject" | "approve" | "revoke" };
export function correctionReviews(state: DecisionState) {
  return state.history.filter(entry => entry.correction && !state.history.some(later => later.revision > entry.revision && later.correction?.field === entry.correction!.field)).map(entry => {
    const actions = state.history.filter(e => e.reviewAction?.target === entry.revision);
    const verification = actions.findLast(e => ["verify", "reject"].includes(e.reviewAction!.action));
    const approval = actions.findLast(e => ["approve", "revoke"].includes(e.reviewAction!.action));
    const verified = verification?.reviewAction?.action === "verify";
    const approved = verified && approval?.reviewAction?.action === "approve" && approval.revision > verification!.revision;
    return { entry, verified, approved, rejected: verification?.reviewAction?.action === "reject" };
  });
}
export function validateReviewAction(state: DecisionState, input: unknown, role: "owner" | "reviewer"): ReviewAction {
  const fail = (reason: string): never => { throw new Error(`Review: ${reason}`); };
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail("choose a valid review action.");
  const data = input as Record<string, unknown>;
  if (Object.keys(data).some(k => !["target", "action"].includes(k)) || !Number.isSafeInteger(data.target) || !["verify", "reject", "approve", "revoke"].includes(String(data.action))) return fail("choose a valid review action.");
  const current = correctionReviews(state).find(item => item.entry.revision === data.target);
  if (!current) return fail("this correction has been replaced or is unavailable. Refresh before reviewing.");
  if ((data.action === "approve" || data.action === "revoke") && role !== "owner") return fail("only the Owner may approve or revoke approval.");
  if (data.action === "approve" && (!current.verified || current.approved)) return fail("verify the current evidence before approving an unapproved correction.");
  if (data.action === "revoke" && !current.approved) return fail("this correction has no active approval.");
  return { target: data.target as number, action: data.action as ReviewAction["action"] };
}
