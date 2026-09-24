import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = fileURLToPath(new URL("../scripts/preview-import.mjs", import.meta.url));
const validFeed = JSON.stringify({ formatVersion: 1, rows: [{
  vendorSku: "PRIVATE-SKU", name: "Private sample", brandName: "Example",
  manufacturerPartNumber: "EX-1", variantAttributes: {},
  itemPrice: "10.00", currency: "USD", quantity: 1,
  destinationUrl: "https://example.com/item?token=PRIVATE-TOKEN",
}] });

for (const [name, content, status] of [
  ["valid input", validFeed, 0],
  ["invalid JSON", '{"secret":"PRIVATE-TOKEN"', 2],
  ["rejected row", validFeed.replace('"USD"', '"CAD"'), 1],
  ["oversized file", " ".repeat(5 * 1024 * 1024 + 1), 2],
]) {
  test(`CLI: ${name} reports safely without changing input`, async () => {
    const folder = await mkdtemp(path.join(tmpdir(), "bagger-import-test-"));
    try {
      const input = path.join(folder, "feed.json");
      await writeFile(input, content);
      const run = spawnSync(process.execPath, [cli, input], { encoding: "utf8" });
      assert.equal(run.status, status, run.stderr);
      assert.ok(!`${run.stdout}${run.stderr}`.includes("PRIVATE-TOKEN"));
      assert.ok(!run.stdout.includes("PRIVATE-SKU"));
      assert.equal(await readFile(input, "utf8"), content);
      if (status !== 2) {
        const report = JSON.parse(run.stdout);
        assert.equal(report.databaseChanged, false);
        assert.equal(report.published, false);
        assert.equal("candidates" in report, false);
      }
    } finally {
      await rm(folder, { recursive: true, force: true });
    }
  });
}
