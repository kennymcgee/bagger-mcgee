import ContactButton from "./contact-button";
import { PublicHeader, PublicFooter } from "../public-shell";
import shared from "../home.module.css";
import styles from "./shipping.module.css";

const grades = [
  ["A", "81-100", "Cheapest to ship from. Free or near-free on most orders."],
  ["B", "61-80", "Below-average charges. Usually easy on the total."],
  ["C", "41-60", "Average. Typical flat or calculated rates for the part."],
  ["D", "21-40", "Above-average charges, or high handling fees on small orders."],
  ["E", "0-20", "Most expensive to ship from. Shipping can rival the part price."],
  ["?", "Not scored", "Not enough verified information to assign a grade. This does not mean free or expensive shipping. Confirm the total with the retailer."],
];
const steps = [
  "Compare common parts: small hardware, boxed parts, and bulky items.",
  "Quote across ZIP codes so one cheap region does not carry the score.",
  "Give higher-demand parts more weight.",
  "Factor in handling fees, order minimums, and free-shipping restrictions.",
];

export default function ShippingScorePage() {
  return <div className={shared.site}>
    <a className={shared.skip} href="#shipping-main">Skip to shipping score</a>
    <PublicHeader />
    <main id="shipping-main" className={styles.main}>
      <div className={styles.hero}>
        <h1>SHIPPING SCORE</h1>
        <ul className={styles.key} aria-label="Shipping score at a glance">
          <li>A = lowest cost</li><li>E = highest cost</li><li>Shipping + handling only</li>
        </ul>
        <p className={styles.intro}>One letter. A clearer picture of shipping costs. Compare a retailer&apos;s shipping and handling charges from A to E. This is a guide, not a quote: your final cost depends on your cart, location, and retailer.</p>
      </div>

      <section className={styles.scale} aria-labelledby="scale-title">
        <h2 id="scale-title">THE SCALE</h2>
        <table className={styles.table}>
          <caption className={styles.srOnly}>Proposed shipping score scale</caption>
          <colgroup><col className={styles.gradeColumn}/><col className={styles.internalColumn}/><col/></colgroup>
          <thead><tr><th scope="col">SCORE</th><th scope="col">INTERNAL</th><th scope="col">WHAT IT MEANS</th></tr></thead>
          <tbody>{grades.map(([grade, range, meaning]) => <tr key={grade}><th scope="row">{grade}</th><td>{range}</td><td>{meaning}</td></tr>)}</tbody>
        </table>
      </section>

      <section className={styles.flagSection} aria-labelledby="flags-title">
        <h2 id="flags-title">FREE SHIPPING FLAGS</h2>
        <div className={styles.flags}>
          <article><h3><span>FREE</span> Ships free</h3><p>No conditions and no minimum.</p></article>
          <article><h3><span>COND</span> Conditionally free</h3><p>Requires a minimum, promo code, or membership.</p></article>
        </div>
      </section>

      <section className={styles.method} aria-labelledby="method-title">
        <h2 id="method-title">HOW WE SET IT</h2>
        <ol className={styles.steps}>{steps.map((step, i) => <li key={step}><span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><p>{step}</p></li>)}</ol>
        <p className={styles.note}>Cost only: transit time, customer service, and damaged-part handling are outside this score.</p>
      </section>

      <section className={styles.retailers} aria-labelledby="retailers-title">
        <h2 id="retailers-title">FOR RETAILERS</h2>
        <p>Planned regular reviews and reassessment when shipping policies change. Scores may change after a rider report, a data correction, or a consistent update to the scoring method. Review timing is still being finalized.</p>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <h2 id="contact-title">THINK A SCORE IS WRONG?</h2>
        <p>Request a review with the retailer, part, and quoted shipping charge. Contact opens at launch.</p>
        <ContactButton />
      </section>
    </main>
    <PublicFooter previewNote="For Sam and Kenny. Scores in search results are fictional. The scale and evaluation approach on this page are proposed for the live site." />
  </div>;
}

