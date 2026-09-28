"use server";
import { getAdminAccess } from "@/lib/auth/admin";
import { loadReviews } from "@/lib/reviews";
import { appendDecision } from "@/ingestion/decisions";

export async function saveDecision(id: string, status: string, note: string, revision: number) {
  const access = await getAdminAccess();
  if (access.state !== "allowed") return { error: "Your administrator session needs verification. Sign in again before saving." };
  const reviews = await loadReviews();
  if (!reviews.cards.some(card => card.id === id)) return { error: "This real review item is unavailable. Sample items cannot be saved here." };
  try { return { decision: await appendDecision(process.cwd(), id, {status, note, revision}, access.userId, access.role) }; }
  catch (e) {
    const message = e instanceof Error ? e.message : "";
    return { error: /^(This item changed|Choose a status|History limit)/.test(message) ? message : "The decision could not be saved safely. Refresh and try again; existing history is unchanged." };
  }
}
