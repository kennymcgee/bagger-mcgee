import { open } from "node:fs/promises";
import { validateFeed } from "../src/ingestion/validate.ts";

// Reports contain only row numbers and fixed issue codes, never vendor values.
const inputPath = process.argv[2];
if (!inputPath || process.argv.length !== 3) {
  console.error("Usage: pnpm import:preview <local-json-file>");
  process.exitCode = 2;
} else {
  let file;
  try {
    file = await open(inputPath, "r");
    const stat = await file.stat();
    if (!stat.isFile() || stat.size > 5 * 1024 * 1024) throw new Error();
    const content = await file.readFile({ encoding: "utf8" });
    if (Buffer.byteLength(content) > 5 * 1024 * 1024) throw new Error();
    const result = validateFeed(JSON.parse(content));
    const report = {
      formatVersion: result.formatVersion, status: result.status,
      totalRows: result.totalRows, validRows: result.validRows,
      rejectedRows: result.rejectedRows, issues: result.issues,
      databaseChanged: false, published: false,
    };
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = result.status === "blocked" ? 1 : 0;
  } catch {
    console.error("Import preview failed. Use a readable JSON file no larger than 5 MiB. No database changes were made.");
    process.exitCode = 2;
  } finally {
    await file?.close();
  }
}
