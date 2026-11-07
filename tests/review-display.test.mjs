import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareReview } from "../src/ingestion/review.ts";
import { packetCards } from "../src/ingestion/review-display.ts";
const make = () => prepareReview(JSON.stringify({formatVersion:1, rows:[{
  vendorSku:"TEST-1",name:"Test item",brandName:"Example",manufacturerPartNumber:"T-1",
  variantAttributes:{finish:"black"},destinationUrl:"https://example.com/item?token=SECRET",
  itemPrice:"12",currency:"USD",quantity:1,
}]}),"00000000-0000-4000-8000-000000000001","2026-09-28");
test("display strips unknown fields and URL parameters from browser data",()=>{
  const p=make(); p.items[0].original.apiKey="PRIVATE";
  const cards=packetCards(p,p.packetId);
  assert.equal(cards.length,1);
  assert.ok(!JSON.stringify(cards).includes("SECRET"));
  assert.ok(!JSON.stringify(cards).includes("PRIVATE"));
  assert.ok(cards[0].reasons.includes("Confirm new or used condition"));
});
test("bad packet identity, statuses, and duplicate rows are rejected",()=>{
  const p=make();
  assert.equal(packetCards(p,"../other"),null);
  assert.equal(packetCards({...p,items:[...p.items,...p.items]},p.packetId),null);
  assert.equal(packetCards({...p,publishable:true},p.packetId),null);
  assert.equal(packetCards({...p,items:[{...p.items[0],status:"approved"}]},p.packetId),null);
});
test("invalid links do not become clickable or expose credentials",()=>{
  const p=make(); p.items[0].original.destinationUrl="https://user:PRIVATE@example.com/";
  assert.ok(!JSON.stringify(packetCards(p,p.packetId)).includes("PRIVATE"));
});
test("file-level failures have a useful title and do not expose raw files",()=>{
  const p=prepareReview('{"secret":"PRIVATE"}',"00000000-0000-4000-8000-000000000001","2026-09-28");
  const cards=packetCards(p,p.packetId);
  assert.equal(cards[0].title,"File needs review");
  assert.ok(!JSON.stringify(cards).includes("PRIVATE"));
});
