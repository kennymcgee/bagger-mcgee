"use client";
import { useState } from "react";
import type { ReviewCard } from "@/ingestion/review-display";

export function ReviewList({ cards, sample }: { cards: ReviewCard[]; sample: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const visible = cards.filter(card => (filter !== "blocked" || card.blocked) &&
    `${card.title} ${card.sku} ${card.vendorId} ${card.reasons.join(" ")}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <>
    <div className="review-tools">
      <div><label htmlFor="review-search">Find an item</label><input id="review-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Product, SKU, vendor ID, or issue" /></div>
      <div><label htmlFor="review-filter">Show</label><select id="review-filter" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All new items</option><option value="blocked">Blocked batches</option></select></div>
    </div>
    <p className="admin-note" role="status">{visible.length} of {cards.length} {sample ? "sample " : ""}items shown</p>
    {visible.length === 0 && <section className="review-empty"><h2>{cards.length ? "No matching items" : "Your queue is clear"}</h2><p>{cards.length ? "Try another search or choose All new items." : "Prepared vendor review packets will appear here. No vendor items have been loaded yet."}</p></section>}
    <div className="review-items">{visible.map(card => <details className="review-item" key={card.id}>
      <summary><span><strong>{card.title}</strong><span className="review-subtitle">{card.sku} · {card.row === 0 ? "File-level issue" : `Row ${card.row}`}</span></span><span className="review-tags"><span className="badge">New</span>{card.blocked && <span className="badge blocked">Batch blocked</span>}</span></summary>
      <div className="review-detail"><h3>Needs attention</h3><ul>{card.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
        <p className="admin-note">{sample ? "Synthetic sample vendor" : `Vendor record: ${card.vendorId}`}<br />Prepared {card.createdAt.replace("T", " ").replace(".000Z", " UTC")}</p>
        <div className="review-table" role="region" aria-label={`Original and proposed values for ${card.sku}`} tabIndex={0}><table><caption>Original and proposed information</caption><thead><tr><th scope="col">Field</th><th scope="col">Original vendor data</th><th scope="col">Proposed values</th></tr></thead><tbody>{card.fields.map(field => <tr key={field.label}><th scope="row">{field.label}</th><td>{field.original}</td><td>{field.proposed}</td></tr>)}</tbody></table></div>
        <div className="review-context"><section><h3>Catalog comparison</h3><p>Not looked up yet. A matching catalog record has not been verified.</p></section><section><h3>Supporting evidence</h3><p>No verified evidence attached yet.</p></section></div>
        <h3>History</h3><p>Prepared for review by the local import checker. Status: New.</p>
        <p className="admin-note">Review only. Approval, corrections, and publishing are not available yet.</p>
      </div>
    </details>)}</div>
  </>;
}
