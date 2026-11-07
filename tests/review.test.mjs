import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareReview, reviewStatuses } from "../src/ingestion/review.ts";

const vendor = "00000000-0000-4000-8000-000000000001";
const at = "2026-09-24T18:00:00Z";
const row = {
  vendorSku: "TEST-1", name: "  Synthetic part  ", brandName: "Example",
  manufacturerPartNumber: "EX-1", variantAttributes: { finish: "black" },
  destinationUrl: "https://example.com/part", itemPrice: "20", currency: "USD", quantity: 1,
};
const feed = (...rows) => JSON.stringify({ formatVersion: 1, rows });

test("packet preserves original alongside normalized proposal and requires evidence", () => {
  const packet = prepareReview(feed(row), vendor, at);
  const item = packet.items[0];
  assert.equal(item.original.name, "  Synthetic part  ");
  assert.equal(item.proposed.name, "Synthetic part");
  assert.equal(item.proposed.itemPrice, "20.00");
  assert.equal(item.status, "New");
  assert.equal(item.currentCatalog, null);
  assert.equal(item.catalogLookupPerformed, false);
  assert.deepEqual(item.evidence, []);
  assert.ok(item.reasons.includes("product_origin_unknown"));
  assert.ok(item.reasons.includes("offer_condition_unknown"));
  assert.equal(packet.publishable, false);
  assert.equal(packet.databaseChanged, false);
  assert.equal(item.history[0].at, "2026-09-24T18:00:00.000Z");
});
test("mixed batch stays blocked and rejected row never receives a proposal", () => {
  const packet = prepareReview(feed(row, { ...row, vendorSku: "TEST-2", currency: "CAD" }), vendor, at);
  assert.equal(packet.blockedBatch, true);
  assert.equal(packet.items.length, 2);
  assert.equal(packet.items[1].proposed, null);
  assert.ok(packet.items[1].reasons.includes("currency:usd_required"));
  assert.equal(packet.items[0].status, "New");
});
test("file-level validation failure becomes a file-level queue item", () => {
  const packet = prepareReview('{"formatVersion":2,"rows":[]}', vendor, at);
  assert.equal(packet.items.length, 1);
  assert.equal(packet.items[0].row, 0);
  assert.equal(packet.items[0].proposed, null);
  assert.equal(packet.blockedBatch, true);
});
test("same source and vendor are idempotent; different vendor or content remain separate", () => {
  const first = prepareReview(feed(row), vendor, at);
  assert.equal(prepareReview(feed(row), vendor, "2026-09-25").packetId, first.packetId);
  assert.notEqual(prepareReview(feed(row), "00000000-0000-4000-8000-000000000002", at).packetId, first.packetId);
  assert.notEqual(prepareReview(feed({ ...row, itemPrice: "21" }), vendor, at).packetId, first.packetId);
});
test("untrusted feeds cannot nominate the trusted vendor or approve items", () => {
  const packet = prepareReview(feed({ ...row, vendorId: vendor, reviewStatus: "approved" }), vendor, at);
  assert.equal(packet.blockedBatch, true);
  assert.equal(packet.items[0].proposed, null);
  assert.throws(() => prepareReview(feed(row), "not-a-vendor-id", at));
  assert.throws(() => prepareReview(feed(row), vendor, "not-a-date"));
  assert.throws(() => prepareReview("bad json", vendor, at));
});
test("queue statuses remain distinct from catalog publishing status", () => {
  assert.deepEqual(reviewStatuses, ["New", "In Review", "Waiting on VENDOR", "Resolved", "Dismissed"]);
  const packet = prepareReview(feed(row), vendor, at);
  assert.equal(packet.items[0].proposed.reviewStatus, "pending");
});
