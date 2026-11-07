import { createHash } from "node:crypto";
import { validateFeed } from "./validate.ts";

export const reviewStatuses = ["New", "In Review", "Waiting on VENDOR", "Resolved", "Dismissed"] as const;

/** Local preparation only. This is not an authorization or publishing boundary. */
export function prepareReview(source: string, vendorId: string, preparedAt: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(vendorId)) {
    throw new Error("A vendor record ID is required.");
  }
  if (!Number.isFinite(Date.parse(preparedAt))) throw new Error("A preparation date is required.");
  const original: unknown = JSON.parse(source);
  const preflight = validateFeed(original);
  const sourceHash = createHash("sha256").update(source, "utf8").digest("hex");
  const packetId = createHash("sha256").update(`${vendorId.toLowerCase()}:${sourceHash}`).digest("hex");
  const createdAt = new Date(preparedAt).toISOString();
  const candidates = new Map(preflight.candidates.map(candidate => [candidate.row, candidate]));
  const issuesByRow = new Map<number, typeof preflight.issues>();
  for (const issue of preflight.issues) {
    const issues = issuesByRow.get(issue.row) ?? [];
    issues.push(issue);
    issuesByRow.set(issue.row, issues);
  }
  const originalRows = original && typeof original === "object" && "rows" in original &&
    Array.isArray(original.rows) ? original.rows : [];
  // An invalid envelope or oversized batch is reviewed as one file-level issue.
  const fileIssue = preflight.issues.some(issue => issue.row === 0);
  const rows = fileIssue ? [0] : Array.from({ length: preflight.totalRows }, (_, index) => index + 1);
  const items = rows.map(row => {
    const proposed = candidates.get(row) ?? null;
    const issues = issuesByRow.get(row) ?? [];
    const reasons: string[] = issues.map(issue => `${issue.field}:${issue.code}`);
    if (proposed) {
      reasons.push("canonical_product_mapping_required", "vendor_claims_and_item_link_unverified");
      if (proposed.origin === null) reasons.push("product_origin_unknown");
      if (proposed.condition === null) reasons.push("offer_condition_unknown");
    }
    return {
      id: `${packetId}:${row}`, row, status: "New" as const,
      reasons, original: row === 0 ? original : structuredClone(originalRows[row - 1]),
      proposed, currentCatalog: null,
      catalogLookupPerformed: false,
      evidence: [],
      history: [{ at: createdAt, actor: "local-preflight", action: "prepared_for_review" }],
    };
  });
  return {
    formatVersion: 1, packetId, vendorId: vendorId.toLowerCase(), createdAt,
    sourceHash, sourceHashAlgorithm: "sha256",
    sourceHashMeaning: "Exact input bytes decoded as UTF-8; provenance only, not verification of vendor claims.",
    preflightStatus: preflight.status,
    totalRows: preflight.totalRows, validRows: preflight.validRows, rejectedRows: preflight.rejectedRows,
    blockedBatch: preflight.status === "blocked",
    publishable: false, databaseChanged: false,
    items,
  };
}
