import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, copyFile, writeFile, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";

test("review CLI preserves existing packets and rejects malformed input without printing raw values", async () => {
  const folder = await mkdtemp(path.join(tmpdir(), "bagger-review-test-"));
  try {
    for (const relative of ["scripts/prepare-review.mjs", "src/ingestion/review.ts", "src/ingestion/validate.ts"]) {
      const destination = path.join(folder, relative);
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(new URL(`../${relative}`, import.meta.url), destination);
    }
    const input = path.join(folder, "input.json");
    await writeFile(input, JSON.stringify({ formatVersion: 1, rows: [{ secret: "DO-NOT-PRINT" }] }));
    const args = [path.join(folder, "scripts/prepare-review.mjs"), input, "00000000-0000-4000-8000-000000000001"];
    const run = () => spawnSync(process.execPath, args, { encoding: "utf8" });
    const first = run();
    assert.equal(first.status, 1, first.stderr);
    assert.ok(!first.stdout.includes("DO-NOT-PRINT"));
    const directory = path.join(folder, "local-imports/reviews");
    const names = await readdir(directory);
    assert.equal(names.length, 1);
    const filename = path.join(directory, names[0]);
    const contents = await readFile(filename, "utf8");
    assert.equal(JSON.parse(contents).items[0].original.secret, "DO-NOT-PRINT");
    const second = run();
    assert.equal(second.status, 1, second.stderr);
    assert.match(second.stdout, /already exists/);
    assert.equal(await readFile(filename, "utf8"), contents);
    await writeFile(input, "malformed DO-NOT-PRINT");
    const third = run();
    assert.equal(third.status, 2);
    assert.ok(!`${third.stdout}${third.stderr}`.includes("DO-NOT-PRINT"));
    assert.equal((await readdir(directory)).length, 1);
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
});
