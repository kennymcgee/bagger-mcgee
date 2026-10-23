"use server";
import { getAdminAccess } from "@/lib/auth/admin";
import { loadDatabaseReviews, appendDatabaseDecision } from "@/lib/database-reviews";


export async function saveDecision(id: string, status: string, note: string, revision: number, correction?: unknown, reviewAction?: unknown) {
  const access = await getAdminAccess();
  if (access.state !== "allowed") return { error: "Your administrator session needs verification. Sign in again before saving." };
  const reviews = await loadDatabaseReviews();
  if (!reviews.cards.some(card => card.id === id)) return { error: "This real review item is unavailable. Sample items cannot be saved here." };
  try { return { decision: await appendDatabaseDecision(id, {status, note, revision, correction, reviewAction}, access.userId, access.role) }; }
  catch (e) {
    const message = e instanceof Error ? e.message : "";
    return { error: /^(This item changed|Choose a status|Correction:|Review:|History limit)/.test(message) ? message : "The decision could not be saved safely. Refresh and try again; existing history is unchanged." };
  }
}



