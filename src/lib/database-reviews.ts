import "server-only";
import { createReviewConnection } from "@/db/connection";
import { databaseHistory, saveDatabaseDecision } from "@/db/review-store";
import { packetCards, type ReviewCard } from "@/ingestion/review-display";
import type { DecisionInput } from "@/ingestion/decision-history";
let client: ReturnType<typeof createReviewConnection> | undefined;
export const reviewConnection = () => client ??= createReviewConnection();
export async function loadDatabaseReviews() {
  const cards: ReviewCard[] = [];
  try {
    const rows = await reviewConnection()`select id, packet from public.review_packets order by created_at desc, id limit 101`;
    let unavailable = 0; let limited = rows.length > 100;
    for (const row of rows.slice(0,100)) {
      const parsed = packetCards(row.packet, row.id);
      if (!parsed) { unavailable++; continue; }
      if (cards.length + parsed.length > 1000) limited = true;
      cards.push(...parsed.slice(0,1000 - cards.length));
    }
    return {cards, unavailable, limited};
  } catch { return {cards: [], unavailable: 1, limited: false}; }
}
export const readDatabaseDecisions = (id: string) => databaseHistory(reviewConnection(), id);
export const appendDatabaseDecision = (id: string, input: DecisionInput, actor: string, role: "owner" | "reviewer") => saveDatabaseDecision(reviewConnection(), id, input, actor, role);

