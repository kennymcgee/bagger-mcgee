import { PublicHeader, PublicFooter } from "../public-shell";
import shared from "../home.module.css";
import styles from "./disclosure.module.css";

export const metadata = { title: "Affiliate Disclosure | Bagger McGee" };

export default function AffiliateDisclosurePage() {
  return <div className={shared.site}>
    <a className={shared.skip} href="#disclosure-main">Skip to affiliate disclosure</a>
    <PublicHeader />
    <main id="disclosure-main" className={styles.main}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>TRANSPARENCY FOR RIDERS &amp; RETAILERS</p>
        <h1>AFFILIATE<br /><span>DISCLOSURE.</span></h1>
        <p>How Bagger McGee makes money, and why payment never buys influence.</p>
      </div>
      <div className={styles.content}>
        <section className={styles.section} aria-labelledby="commissions-title">
          <p className={styles.eyebrow}>01 / OUR BUSINESS MODEL</p>
          <h2 id="commissions-title">NO SPONSORED LISTINGS.</h2>
          <p>Retailers cannot pay for sponsored listings or preferential placement on Bagger McGee. Payment never determines which matching listings appear or how they rank.</p>
          <p>When you follow a retailer link, you shop directly with that retailer. The retailer handles checkout, payment, fulfillment, returns, and order support.</p>
          <p>We do not earn revenue from retailer subscriptions, purchases, clicks, leads, paid listings, or sponsorships.</p>
        </section>
        <section className={styles.section} aria-labelledby="subscriptions-title">
          <p className={styles.eyebrow}>02 / HOW RETAILERS PARTICIPATE</p>
          <h2 id="subscriptions-title">SUBSCRIPTIONS &amp; AFFILIATE ARRANGEMENTS.</h2>
          <p>Our retailer subscription model uses a monthly fee based on the number of SKUs in a retailer’s catalog. This fee covers participation in Bagger McGee and never buys preferential placement, favorable coverage, or influence over search results.</p>
          <p>We may also work with some retailers through affiliate arrangements, where Bagger McGee earns a commission on purchases made through retailer links. The same commitment to impartial results and coverage applies to every retailer, regardless of how they participate.</p>
        </section>
        <section className={styles.commitment} aria-labelledby="influence-title">
          <p className={styles.eyebrow}>03 / OUR COMMITMENT</p>
          <h2 id="influence-title">PAYMENT NEVER<br /><span>BUYS INFLUENCE.</span></h2>
          <p>Payment will never influence search placement, rankings, recommendations, Shipping Scores, retailer spotlight articles, blog mentions, or customer reviews and ratings.</p>
          <p>Our search is designed to return all matching listings in the catalog—not a selection based on who pays more. Riders choose how to sort their results using available options such as price and Shipping Score.</p>
        </section>
        <section className={styles.section} aria-labelledby="demo-title">
          <p className={styles.eyebrow}>04 / DEMONSTRATION LISTINGS</p>
          <h2 id="demo-title">FICTIONAL LISTINGS. REAL CLARITY.</h2>
          <p>The current site uses fictional retailers and listings to demonstrate how Bagger McGee works. These examples do not represent actual retailer participation or offers available to purchase.</p>
        </section>
      </div>
    </main>
    <PublicFooter previewNote="For Sam and Kenny. Affiliate Disclosure page design preview. Subscriptions and potential affiliate arrangements describe intended participation options; no retailer revenue is currently earned. Disclosure placement and any program-specific wording must reflect actual arrangements before affiliate links go live. Demonstration retailers and listings are fictional. This page does not establish live services. Page design and wording approved by Kenny on October 2, 2026." />
  </div>;
}
