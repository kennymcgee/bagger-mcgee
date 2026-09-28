import "server-only";
import { readdir, lstat, readFile } from "node:fs/promises";
import path from "node:path";
import { packetCards, type ReviewCard } from "@/ingestion/review-display";
import { prepareReview } from "@/ingestion/review";

// Called only after the page has verified administrator role and MFA.
export async function loadReviews() {
  const directory = path.join(process.cwd(), "local-imports/reviews");
  const cards: ReviewCard[] = [];
  let unavailable = 0;
  let limited = false;
  try {
    const folder = await lstat(directory);
    if (!folder.isDirectory() || folder.isSymbolicLink()) return { cards, unavailable: 1, limited };
    const entries = (await readdir(directory)).filter(name => /^[a-f0-9]{64}\.json$/.test(name)).sort();
    limited = entries.length > 100;
    for (const name of entries.slice(0, 100)) {
      try {
        const filename = path.join(directory, name);
        const info = await lstat(filename);
        if (!info.isFile() || info.isSymbolicLink() || info.size > 20 * 1024 * 1024) { unavailable++; continue; }
        const content = await readFile(filename, "utf8");
        const parsed = packetCards(JSON.parse(content), name.slice(0, -5));
        if (!parsed) { unavailable++; continue; }
        if (cards.length + parsed.length > 1000) limited = true;
        cards.push(...parsed.slice(0, Math.max(0, 1000 - cards.length)));
        if (cards.length >= 1000) { limited = true; break; }
      } catch { unavailable++; }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") unavailable++;
  }
  cards.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  return { cards, unavailable, limited };
}

export function sampleReviews() {
  const row = { vendorSku: "SAMPLE-01", name: "Sample touring seat", brandName: "Example brand",
    manufacturerPartNumber: "DEMO-1", variantAttributes: { finish: "black" },
    destinationUrl: "https://example.com/parts/demo-1", itemPrice: "199.00", currency: "USD", quantity: 1 };
  const packet = prepareReview(JSON.stringify({ formatVersion: 1, rows: [row,
    { ...row, vendorSku: "SAMPLE-02", name: "Sample chrome trim", itemPrice: "-15" },
  ] }), "00000000-0000-4000-8000-000000000001", "2026-09-28T12:00:00Z");
  return packetCards(packet, packet.packetId)!;
}
