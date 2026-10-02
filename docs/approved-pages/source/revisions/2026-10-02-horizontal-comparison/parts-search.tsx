"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "./public-shell";
import styles from "./home.module.css";

import { matchesShippingScore, shippingFilterLabel } from "./shipping-score";
import { parts, stores, demoOffers } from "./demo-catalog";
import { ShareControl, CouponControl, FlagControl } from "./listing-controls";
const initialBike = { make: "Harley-Davidson", year: "2023", model: "Road Glide" };
export default function PartsSearch({ resultsPage = false, selectedBike = null }: { resultsPage?: boolean; selectedBike?: typeof initialBike | null }) {
  const [bike, setBike] = useState(selectedBike ?? initialBike);
  const appliedBike = selectedBike;
  const [category, setCategory] = useState("All categories");
  const [retailer, setRetailer] = useState("All retailers");
  const [price, setPrice] = useState("Any price");
  const [condition, setCondition] = useState("All conditions");
  const [shippingScore, setShippingScore] = useState("Any score");
  const [sort, setSort] = useState("popular");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [message, setMessage] = useState("");
  const active = [category !== "All categories" && category, retailer !== "All retailers" && retailer, price !== "Any price" && price, condition !== "All conditions" && condition, shippingScore !== "Any score" && `Shipping: ${shippingFilterLabel(shippingScore)}`].filter(Boolean);
  function clearFilters() { setCategory("All categories"); setRetailer("All retailers"); setPrice("Any price"); setCondition("All conditions"); setShippingScore("Any score"); setMessage(""); }
  const offers = demoOffers
    .filter(o => matchesShippingScore(o.shippingScore, shippingScore) && (category === "All categories" || o.category === category) && (retailer === "All retailers" || o.retailer === retailer) && (condition === "All conditions" || o.condition === condition) && (price === "Any price" || (price === "Under $200" ? o.price < 200 : price === "$200–$400" ? o.price >= 200 && o.price <= 400 : o.price > 400)))
    .sort((a,b) => {
      const direction = sort.endsWith("-desc") ? -1 : 1;
      const field = sort.replace("-desc", "");
      const comparison = field === "popular" ? a.demoPopularityRank-b.demoPopularityRank : field === "price" ? a.price-b.price : field === "condition" ? a.condition.localeCompare(b.condition) : field === "shipping" ? a.shippingScore.localeCompare(b.shippingScore) : a.retailer.localeCompare(b.retailer);
      return comparison * direction || a.price-b.price || a.key.localeCompare(b.key);
    });
  function toggleSort(field: string) { setSort(current => current === field ? field + "-desc" : field); }
  function sortArrow(field: string) {
    const ascending = sort === field;
    const descending = sort === field + "-desc";
    return <svg className={styles.sortIcon} viewBox="0 0 16 20" aria-hidden="true" focusable="false"><path d="M8 1 15 8H1Z" className={ascending ? styles.sortActive : styles.sortInactive}/><path d="m8 19 7-7H1Z" className={descending ? styles.sortActive : styles.sortInactive}/></svg>;
  }
  function sortLabel(field: string, label: string) {
    return `Sort by ${label}, ${sort === field ? "descending" : "ascending"}${sort === field ? "; currently ascending" : sort === field + "-desc" ? "; currently descending" : ""}`;
  }
  const bikeName = appliedBike ? `${appliedBike.year} ${appliedBike.make} ${appliedBike.model}` : "Sample parts";
  return <div className={styles.site}>
    <a className={styles.skip} href="#main">Skip to content</a><PublicHeader/>
    <main id="main" className={styles.main}>
      <section className={`${styles.hero} ${resultsPage ? styles.searchResultsHero : ""}`} aria-labelledby="intro-title"><h1 id="intro-title">{resultsPage ? <><span>SEARCH</span><em>RESULTS</em></> : <><span>SEARCH LESS,</span><em>RIDE MORE.</em></>}</h1>
        <form className={styles.finder} aria-label="Choose your motorcycle" action="/search-results" method="get">
          <label>MAKE<select name="make" value={bike.make} onChange={e=>setBike({...bike,make:e.target.value,model:e.target.value === "Indian" ? "Challenger" : "Road Glide"})}><option>Harley-Davidson</option><option>Indian</option></select></label>
          <label>YEAR<select name="year" value={bike.year} onChange={e=>setBike({...bike,year:e.target.value})}>{["2023","2022","2021"].map(y=><option key={y}>{y}</option>)}</select></label>
          <label>MODEL<select name="model" value={bike.model} onChange={e=>setBike({...bike,model:e.target.value})}>{(bike.make === "Indian" ? ["Challenger","Chieftain"] : ["Road Glide","Street Glide"]).map(m=><option key={m}>{m}</option>)}</select></label>
          <button className={styles.primary} type="submit">Show parts for my bike <span>↗</span></button>
        </form>
      </section>
      <section className={styles.results} aria-label="Parts search results">
        <div className={styles.resultsWithSidebar}>
        <aside className={styles.filterPanel} aria-label="Filter results">
        <div className={styles.filterHeading}><strong>Filter results</strong><span>Filter by category, retailer, condition, price, or shipping score.</span><button className={styles.mobileFilter} aria-expanded={filtersOpen} aria-controls="filters" onClick={()=>setFiltersOpen(!filtersOpen)}>Filter results {active.length ? `(${active.length})` : ""} {filtersOpen ? "−" : "+"}</button></div>
        <div id="filters" className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}>
          <label>Category<select value={category} onChange={e=>{setCategory(e.target.value);setMessage("");}}><option>All categories</option>{parts.map(p=><option key={p.category}>{p.category}</option>)}</select></label>
          <label>RETAILER<select value={retailer} onChange={e=>{setRetailer(e.target.value);setMessage("");}}><option>All retailers</option>{stores.map(s=><option key={s}>{s}</option>)}</select></label>
          <label>Condition<select value={condition} onChange={e=>{setCondition(e.target.value);setMessage("");}}><option>All conditions</option><option>New OEM</option><option>Used OEM</option><option>New Aftermarket</option><option>Used Aftermarket</option></select></label>
          <label>Item price<select value={price} onChange={e=>{setPrice(e.target.value);setMessage("");}}><option>Any price</option><option>Under $200</option><option>$200–$400</option><option>Over $400</option></select></label>
          <label>Shipping score<select aria-describedby="shipping-score-help" value={shippingScore} onChange={e=>{setShippingScore(e.target.value);setMessage("");}}><option>Any score</option>{["A","B","C","D","E","?"].map(score=><option key={score} value={score}>{shippingFilterLabel(score)}</option>)}</select><span id="shipping-score-help" className={styles.filterHint}>A is best · E is lowest.<br/>“Or better” includes all higher scores.</span></label>
        </div>
        <button className={styles.sidebarClear} onClick={clearFilters}>Clear filters</button>
        </aside>
        <div className={styles.resultsContent}>
        {active.length > 0 && <div className={styles.activeFilters}><span>Filters: {active.join(" · ")}</span><button className={styles.textButton} onClick={clearFilters}>Clear filters ×</button></div>}
        <div className={styles.mobileSort} aria-label="Sort results">{[["condition","CONDITION"],["price","PRICE"],["shipping","SHIP SCORE"]].map(([field,label])=><button key={field} onClick={()=>toggleSort(field)} aria-label={sortLabel(field,label)}>{label}{sortArrow(field)}</button>)}</div>
        {offers.length === 0 ? <div className={styles.empty}><h3>No demo offers match these filters.</h3><p>Try another category or price range. This sample catalog contains new aftermarket parts only.</p><button className={styles.primary} onClick={clearFilters}>Clear filters</button></div> : <div className={styles.offers} tabIndex={0} role="region" aria-label="Parts comparison table; scroll horizontally to see all columns">
          <div className={styles.listHeader}><span>RETAILER</span><span>PART / DETAILS</span><button onClick={()=>toggleSort("condition")} aria-label={sortLabel("condition", "condition")}><span>CONDITION</span>{sortArrow("condition")}</button><button onClick={()=>toggleSort("price")} aria-label={sortLabel("price", "price")}><span>PRICE</span>{sortArrow("price")}</button><button onClick={()=>toggleSort("shipping")} aria-label={sortLabel("shipping", "ship score")}><span className={styles.stackedHeader}>SHIP<br/>SCORE</span>{sortArrow("shipping")}</button><span>COUPON CODE</span><span>SHARE</span><span>FLAG</span></div>
          {offers.map(o=><article className={styles.offer} key={o.key} aria-label={`${o.name} from ${o.retailer}`}>
            <div className={styles.retailer}><Link className={styles.retailerLink} aria-label={`Preview ${o.name} at ${o.retailer}`} href={`/share/${encodeURIComponent(o.key)}`}>{o.retailer} ↗</Link><small>Demo offer</small></div>
            <div className={styles.part}><h3>{o.name}</h3><p>{o.variant}</p><code>{o.code}</code><small>Brand: Demo Touring · fictional</small></div>
            <div className={styles.conditionCell}><span className={styles.cellLabel}>Condition</span><span className={styles.conditionText} aria-label={`Condition: ${o.condition}`}><strong>{o.condition.split(" ")[0].toUpperCase()}</strong><span>{o.condition.split(" ").slice(1).join(" ").toUpperCase()}</span></span></div>
            <div className={styles.price}><span className={styles.cellLabel}>Item price</span>${o.price.toFixed(2)}</div>
            <div className={styles.shippingCell}><span className={styles.cellLabel}>Shipping score</span><Link href="/shipping-score" className={`${styles.shippingBadge} ${styles[`score${o.shippingScore}`]}`} title={`Fictional shipping score ${o.shippingScore}`} aria-label={`Fictional shipping score: ${o.shippingScore}`}>{o.shippingScore}</Link></div>
            <div className={styles.couponCell}><span className={styles.cellLabel}>Coupon code</span><CouponControl code={o.coupon}/></div><div className={styles.shareCell}><span className={styles.cellLabel}>Share</span><ShareControl id={o.key} name={o.name} retailer={o.retailer} bike={appliedBike ? bikeName : ""}/></div><div className={styles.flagCell}><span className={styles.cellLabel}>Flag</span><FlagControl id={o.key} name={o.name}/></div>
          </article>)}
        </div>}

        {message && <div className={styles.message} role="status">{message}<button aria-label="Dismiss retailer preview" onClick={()=>setMessage("")}>×</button></div>}
        </div>
        </div>
      </section>
      {!resultsPage && <section className={styles.howItWorks} aria-labelledby="how-title"><h2 id="how-title">HOW IT WORKS</h2><div className={styles.howSteps}>{[["01","PICK YOUR BIKE","Choose the make, year, and model of your Harley-Davidson or Indian. This preview simulates fitment; live listings will require verified fitment data."],["02","COMPARE RETAILERS","Compare the exact part, condition, price, shipping score, and available coupon codes. Narrow the list with filters and sort from the column headings."],["03","BUY FROM THE RETAILER","When live, listing links will take you to the retailer’s product page. Confirm fitment and the final total, then check out with them, not us."]].map(([n,title,body])=><div key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></div>)}</div></section>}
    </main><PublicFooter/>
  </div>;
}



