import { notFound, redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/auth/admin";
import { signOut } from "./actions";
import Link from "next/link";
import { sampleReviews } from "@/lib/reviews";
import { ReviewList } from "./review-list";

import { loadDatabaseReviews, readDatabaseDecisions } from "@/lib/database-reviews";
import { emptyDecision, type DecisionState } from "@/ingestion/decision-policy";
export const dynamic = "force-dynamic";
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const access = await getAdminAccess();
  if (access.state === "denied") notFound();
  if (access.state === "signed_out") redirect("/admin/login");
  if (access.state === "mfa_required") redirect("/admin/verify");
  const sample = (await searchParams).sample === "1";
  const result = sample ? { cards: sampleReviews(), unavailable: 0, limited: false } : await loadDatabaseReviews();
  const decisions: Record<string, DecisionState> = {};
  for (const card of result.cards) {
    try { decisions[card.id] = sample ? emptyDecision() : await readDatabaseDecisions(card.id); }
    catch { decisions[card.id] = { ...emptyDecision(), error: true }; }
  }
  return <main className="admin-shell review-shell"><header className="review-header"><div><p className="eyebrow">BAGGER McGEE · PRIVATE ADMIN</p><p className="admin-note">{access.role === "owner" ? "Owner" : "Reviewer"} · Two-factor verified</p></div><form action={signOut}><button className="secondary">Sign out</button></form></header>
    <h1>Review queue</h1><p>Inspect incoming vendor items before they enter the catalog.</p>
    <nav className="review-nav" aria-label="Review views"><Link aria-current={!sample ? "page" : undefined} href="/admin">Your queue</Link><Link aria-current={sample ? "page" : undefined} href="/admin?sample=1">Explore sample items</Link>{access.role === "owner" && <Link href="/admin/upload">Upload vendor CSV</Link>}</nav>
    {sample && <aside className="sample-notice"><strong>Sample view — fictional data</strong><p>These items demonstrate the review screen. They are not saved to your queue or database.</p></aside>}
    {result.unavailable > 0 && <p role="alert">{result.unavailable} database review source(s) could not be read safely. The queue may be unavailable or incomplete; no local fallback is used.</p>}
    {result.limited && <p role="alert">This review view has reached its display limit. Some items are not shown.</p>}
    <ReviewList cards={result.cards} sample={sample} decisions={decisions} role={access.role} />
  </main>;
}




