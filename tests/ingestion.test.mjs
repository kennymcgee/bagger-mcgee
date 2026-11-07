import assert from "node:assert/strict";
import { test } from "node:test";
import { validateFeed } from "../src/ingestion/validate.ts";

const item = (changes = {}) => ({
  vendorSku: "DEMO-01", name: "Synthetic test part", brandName: "Example brand",
  manufacturerPartNumber: "EX-01", variantAttributes: { finish: "black" },
  destinationUrl: "https://example.com/parts/ex-01", itemPrice: "19.9",
  currency: "USD", quantity: 1, origin: "aftermarket", condition: "new", ...changes,
});
const feed = (...rows) => ({ formatVersion: 1, rows });

test("valid feed produces pending review candidates without mutating source", () => {
  const input = feed(item());
  const before = structuredClone(input);
  const result = validateFeed(input);
  assert.equal(result.status, "review_required");
  assert.equal(result.candidates[0].itemPrice, "19.90");
  assert.equal(result.candidates[0].reviewStatus, "pending");
  assert.deepEqual(input, before);
});
test("unknown origin and condition remain unknown and pending", () => {
  const result = validateFeed(feed(item({ origin: null, condition: undefined })));
  assert.equal(result.candidates[0].origin, null);
  assert.equal(result.candidates[0].condition, null);
  assert.equal(result.candidates[0].reviewStatus, "pending");
});
test("reject prices that round, overflow, use currency symbols or are not decimal strings", () => {
  for (const itemPrice of [-1, 19.9, "-1", "NaN", "Infinity", "1e3", "1.234", "$19.90", "01", "10000000000.00"]) {
    assert.equal(validateFeed(feed(item({ itemPrice }))).status, "blocked", String(itemPrice));
  }
  for (const itemPrice of ["0", "0.01", "9999999999.99"]) {
    assert.equal(validateFeed(feed(item({ itemPrice }))).status, "review_required");
  }
});
test("reject non-USD, refurbished, invalid quantity and attempts to approve", () => {
  for (const changes of [{ currency: "EUR" }, { condition: "refurbished" }, { quantity: 0 },
    { quantity: 1.5 }, { quantity: 2_147_483_648 }, { reviewStatus: "approved" }, { origin: "unknown" }]) {
    assert.equal(validateFeed(feed(item(changes))).status, "blocked");
  }
});
test("duplicate SKUs hold both rows even when one has other errors", () => {
  const result = validateFeed(feed(item(), item({ vendorSku: " DEMO-01 ", itemPrice: "-5" })));
  assert.equal(result.rejectedRows, 2);
  assert.equal(result.candidates.length, 0);
  assert.equal(result.issues.filter(issue => issue.code === "duplicate_sku").length, 2);
});
test("variants and separate vendor SKUs are not merged by matching part number", () => {
  const result = validateFeed(feed(item(), item({ vendorSku: "DEMO-02", variantAttributes: { finish: "chrome" } })));
  assert.equal(result.candidates.length, 2);
  assert.equal(result.candidates[1].variantAttributes.finish, "chrome");
});
test("reject malformed, insecure and credential-bearing item URLs", () => {
  for (const destinationUrl of ["http://example.com/x", "https://user:secret@example.com/x", "https:example.com/x", "https:example.com\\x", "https://example.com/a b", "javascript:alert(1)", "https://"]) {
    assert.equal(validateFeed(feed(item({ destinationUrl }))).status, "blocked");
  }
});
test("missing identity and explicit variants are not guessed", () => {
  for (const changes of [{ name: " " }, { brandName: null }, { manufacturerPartNumber: "" },
    { variantAttributes: undefined }, { variantAttributes: { finish: 2 } }]) {
    assert.equal(validateFeed(feed(item(changes))).status, "blocked");
  }
});
test("bad feeds fail closed and a mixed feed cannot pass", () => {
  for (const input of [null, [], {}, { formatVersion: 2, rows: [item()] }, feed(), feed(null),
    feed(...Array(10001).fill(null))]) assert.equal(validateFeed(input).status, "blocked");
  const result = validateFeed(feed(item(), item({ vendorSku: "OTHER", currency: "CAD" })));
  assert.equal(result.status, "blocked");
  assert.equal(result.validRows, 1);
  assert.equal(result.rejectedRows, 1);
});
test("issue details do not echo arbitrary input or secret-like field names", () => {
  const result = validateFeed(feed(item({ "accidental-secret-value": "sensitive", destinationUrl: "private-value" })));
  const report = JSON.stringify(result.issues);
  assert.ok(!report.includes("sensitive"));
  assert.ok(!report.includes("accidental-secret-value"));
  assert.ok(!report.includes("private-value"));
});
