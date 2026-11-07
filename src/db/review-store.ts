import type { Sql, TransactionSql } from "postgres";
import { createDecision, replayHistory, type DecisionInput } from "../ingestion/decision-history.ts";
import { packetCards } from "../ingestion/review-display.ts";
import type { Decision } from "../ingestion/decision-policy.ts";
type Client = Sql | TransactionSql;

export async function databaseHistory(client: Client, id: string) {
  const rows = await client`select event from public.review_events where item_id = ${id} order by revision`;
  return replayHistory(rows.map(row => row.event as Decision));
}
export async function saveDatabaseDecision(client: Sql, id: string, input: DecisionInput, actor: string, role: "owner" | "reviewer") {
  return client.begin(async tx => {
    const rows = await tx`select id from public.review_items where id = ${id} for update`;
    if (rows.length !== 1) throw new Error("Review: item is unavailable.");
    const state = await databaseHistory(tx, id);
    const event = createDecision(state, input, actor, role);
    await tx`insert into public.review_events (item_id, revision, event) values (${id}, ${event.revision}, ${tx.json(event)})`;
    return replayHistory([...state.history, event]);
  });
}
export async function transferPacket(tx: TransactionSql, packet: unknown, expectedId: string, histories: Record<string, Decision[]>) {
  const cards = packetCards(packet, expectedId);
  if (!cards) throw new Error("Invalid packet.");
  // Serialize repeated transfers of this packet across processes.
  await tx`select pg_advisory_xact_lock(hashtextextended(${expectedId}, 0))`;
  const existing = await tx`select packet = ${tx.json(packet as never)}::jsonb as same from public.review_packets where id = ${expectedId}`;
  if (existing.length && !existing[0].same) throw new Error("Conflicting packet.");
  if (!existing.length) await tx`insert into public.review_packets(id, packet) values (${expectedId}, ${tx.json(packet as never)})`;
  for (const card of cards) {
    await tx`insert into public.review_items(id, packet_id, card) values (${card.id}, ${expectedId}, ${tx.json(card)}) on conflict (id) do nothing`;
    await tx`select id from public.review_items where id = ${card.id} for update`;
    const local = replayHistory(histories[card.id] ?? []);
    const remote = await databaseHistory(tx, card.id);
    for (const event of local.history) {
      if (event.revision <= remote.revision) {
        const [match] = await tx`select event = ${tx.json(event)}::jsonb as same from public.review_events where item_id = ${card.id} and revision = ${event.revision}`;
        if (!match?.same) throw new Error("Conflicting review history.");
      } else {
        await tx`insert into public.review_events(item_id, revision, event) values (${card.id}, ${event.revision}, ${tx.json(event)})`;
      }
    }
    await databaseHistory(tx, card.id);
  }
  return cards.length;
}
