import type { Correction } from "./corrections.ts";
export const statuses = ["New", "In Review", "Waiting on VENDOR", "Resolved", "Dismissed"] as const;
export type ReviewStatus = typeof statuses[number];
export type Decision = { correction?: Correction; previousCorrection?: string | null; revision: number; from: ReviewStatus; status: ReviewStatus; note: string; actor: string; role: "owner" | "reviewer"; at: string };
export type DecisionState = { status: ReviewStatus; revision: number; history: Decision[]; error?: boolean };
export const emptyDecision = (): DecisionState => ({ status: "New", revision: 0, history: [] });
export function validateDecision(status: unknown, note: unknown, revision: unknown) {
  if (!statuses.includes(status as ReviewStatus) || typeof note !== "string" || !note.trim() || note.length > 2000 || /[\u0000-\u0008\u000b-\u001f\u007f]/.test(note) || !Number.isSafeInteger(revision) || Number(revision) < 0) throw new Error("Choose a status and enter a note of 1–2,000 characters.");
  return { status: status as ReviewStatus, note: note.trim(), revision: revision as number };
}


