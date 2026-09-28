import { validateReviewAction } from "./approvals.ts";
import { validateCorrection } from "./corrections.ts";
import { mkdir, lstat, readdir, readFile, open, link, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { emptyDecision, validateDecision, type Decision, type DecisionState } from "./decision-policy.ts";
async function directory(root: string, id: string) {
  if (!/^[a-f0-9]{64}:\d{1,5}$/.test(id)) throw new Error("Invalid review item.");
  // Check each controlled path component before following it.
  let current = root;
  for (const part of ["local-imports", "decisions", id.replace(":", "-")]) {
    current = path.join(/* turbopackIgnore: true */ current, part);
    try { await mkdir(current); } catch (e) { if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e; }
    const info = await lstat(current);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error("Unsafe review storage.");
  }
  return current;
}
export async function readDecisions(root: string, id: string): Promise<DecisionState> {
  const dir = await directory(root, id);
  const names = (await readdir(/* turbopackIgnore: true */ dir)).filter(n => /^\d{6}\.json$/.test(n)).sort();
  if (names.length > 1000) throw new Error("History limit reached.");
  const state = emptyDecision();
  for (const name of names) {
    if (name !== `${String(state.revision + 1).padStart(6, "0")}.json`) throw new Error("Incomplete review history.");
    const file = path.join(dir, name); const stat = await lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 20000) throw new Error("Invalid history file.");
    const event: Decision = JSON.parse(await readFile(file, "utf8"));
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
export async function appendDecision(root: string, id: string, input: { status: unknown; note: unknown; revision: unknown; correction?: unknown; reviewAction?: unknown }, actor: string, role: "owner" | "reviewer") {
  const valid = validateDecision(input.status, input.note, input.revision);
  if (!/^[a-f0-9-]{36}$/i.test(actor) || !["owner", "reviewer"].includes(role)) throw new Error("Invalid reviewer.");
  const correction = input.correction === undefined ? undefined : validateCorrection(input.correction);
  const state = await readDecisions(root, id);
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
  const dir = await directory(root, id); const temporary = path.join(dir, `${randomUUID()}.tmp`);
  const handle = await open(temporary, "wx", 0o600);
  try { await handle.writeFile(JSON.stringify(event)); await handle.sync(); } finally { await handle.close(); }
  try {
    // A hard link publishes the complete file atomically and never replaces a revision.
    await link(temporary, path.join(dir, `${String(event.revision).padStart(6, "0")}.json`));
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "EEXIST") throw new Error("This item changed in another tab. Refresh before saving again.");
    throw e;
  } finally { await unlink(temporary); }
  return { status: event.status, revision: event.revision, history: [...state.history, event] } satisfies DecisionState;
}




