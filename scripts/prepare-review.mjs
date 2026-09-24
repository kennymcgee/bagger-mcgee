import { readFile, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareReview } from "../src/ingestion/review.ts";

const [inputPath, vendorId] = process.argv.slice(2);
if (!inputPath || !vendorId || process.argv.length !== 4) {
  console.error("Usage: pnpm import:review <local-json-file> <vendor-record-uuid>");
  process.exitCode = 2;
} else {
  try {
    const metadata = await stat(inputPath);
    if (!metadata.isFile() || metadata.size > 5 * 1024 * 1024) throw new Error();
    const bytes = await readFile(inputPath);
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error();
    // Reject invalid UTF-8 rather than silently replacing the vendor's original text.
    const source = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
    const packet = prepareReview(source, vendorId, new Date().toISOString());
    const directory = fileURLToPath(new URL("../local-imports/reviews/", import.meta.url));
    await mkdir(directory, { recursive: true });
    const destination = path.join(directory, `${packet.packetId}.json`);
    try {
      await writeFile(destination, JSON.stringify(packet, null, 2) + "\n", { flag: "wx", mode: 0o600 });
      console.log("Review packet saved in local-imports/reviews. All items are New; nothing was published.");
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      console.log("A packet for this exact vendor and file already exists. It was preserved without changes.");
    }
    console.log(JSON.stringify({ items: packet.items.length, blockedBatch: packet.blockedBatch, databaseChanged: false }));
    process.exitCode = packet.blockedBatch ? 1 : 0;
  } catch {
    console.error("Could not prepare review. Check the JSON file (UTF-8, at most 5 MiB) and vendor record ID. No database changes were made.");
    process.exitCode = 2;
  }
}
