"use client";
import { useState } from "react";
import type { ReviewCard } from "@/ingestion/review-display";

import { correctionFields } from "@/ingestion/corrections";
import { DecisionForm } from "./decision-form";
import { statuses, type DecisionState } from "@/ingestion/decision-policy";
export function ReviewList({ cards, sample, decisions, role }: { cards: ReviewCard[]; sample: boolean; decisions: Record<string, DecisionState>; role: "owner" | "reviewer" }) {
  const [current, setCurrent] = useState(decisions);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const visible = cards.filter(card => (filter === "all" || (filter === "blocked" ? card.blocked : current[card.id].status === filter)) &&
    `${card.title} ${card.sku} ${card.vendorId} ${card.reasons.join(" ")}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <>
    <div className="review-tools">
      <div><label htmlFor="review-search">Find an item</label><input id="review-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Product, SKU, vendor ID, or issue" /></div>
      <div><label htmlFor="review-filter">Show</label><select id="review-filter" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All items</option><option value="blocked">Blocked batches</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></div>
    </div>
    <p className="admin-note" role="status">{visible.length} of {cards.length} {sample ? "sample " : ""}items shown</p>
    {visible.length === 0 && <section className="review-empty"><h2>{cards.length ? "No matching items" : "Your queue is clear"}</h2><p>{cards.length ? "Try another search or choose All items." : "Prepared vendor review packets will appear here. No vendor items have been loaded yet."}</p></section>}
    <div className="review-items">{visible.map(card => <details className="review-item" key={card.id}>
      <summary><span><strong>{card.title}</strong><span className="review-subtitle">{card.sku} · {card.row === 0 ? "File-level issue" : `Row ${card.row}`}</span></span><span className="review-tags"><span className="badge">{current[card.id].error ? "History unavailable" : current[card.id].status}</span>{card.blocked && <span className="badge blocked">Batch blocked</span>}</span></summary>
      <div className="review-detail"><h3>Needs attention</h3><ul>{card.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
        <p className="admin-note">{sample ? "Synthetic sample vendor" : `Vendor record: ${card.vendorId}`}<br />Prepared {card.createdAt.replace("T", " ").replace(".000Z", " UTC")}</p>
        <div className="review-table" role="region" aria-label={`Original and proposed values for ${card.sku}`} tabIndex={0}><table><caption>Original and proposed information</caption><thead><tr><th scope="col">Field</th><th scope="col">Original vendor data</th><th scope="col">Initial proposed values</th><th scope="col">Reviewer correction</th></tr></thead><tbody>{card.fields.map(field => <tr key={field.label}><th scope="row">{field.label}</th><td>{field.original}</td><td>{field.proposed}</td><td>{current[card.id].history.findLast(entry => entry.correction && correctionFields[entry.correction.field] === field.label)?.correction?.value ?? "No correction"}</td></tr>)}</tbody></table></div>
        <div className="review-context"><section><h3>Catalog comparison</h3><p>Not looked up yet. A matching catalog record has not been verified.</p></section><section><h3>Supporting evidence</h3><p>Evidence supplied with corrections is recorded in History below. It requires human verification.</p></section></div>
        <DecisionForm id={card.id} initial={current[card.id]} sample={sample} role={role} onSaved={state => setCurrent(previous => ({...previous, [card.id]: state}))} />
        <p className="admin-note">Corrections are proposals only. Correction approvals are recorded below. Catalog updates and publishing are not available yet.</p>
      </div>
    </details>)}</div>
  </>;
}



