import Link from "next/link";
import { PublicHeader, PublicFooter } from "../public-shell";
import shared from "../home.module.css";
import styles from "./tutorial.module.css";

export default function QuickTutorialPage() {
  return <div className={shared.site}>
    <a className={shared.skip} href="#tutorial-main">Skip to quick tutorial</a>
    <PublicHeader />
    <main id="tutorial-main" className={styles.main}>
      <div className={styles.hero}>
        <p className={styles.eyebrow}>LESS GUESSWORK. MORE RIDING.</p>
        <h1>QUICK TUTORIAL</h1>
        <p className={styles.intro}>Your bike. Your part. Your best next move.<br />Here’s how to find your way around Bagger McGee.</p>
        <div className={styles.route} aria-label="Three steps"><span>01 SELECT</span><b aria-hidden="true">→</b><span>02 COMPARE</span><b aria-hidden="true">→</b><span>03 CHECK IT OUT</span></div>
      </div>

      <section className={styles.step} aria-labelledby="select-title">
        <div className={styles.copy}><span className={styles.number}>01</span><div><h2 id="select-title">START WITH YOUR BIKE.</h2><p>Choose your make, year, and model, then hit FIND PARTS. Use the filters to narrow the list by category, retailer, condition, price, or shipping score.</p><p className={styles.tip}>Just looking? You can browse the opening list before choosing a bike.</p></div></div>
        <div className={styles.visual} role="group" aria-label="Example bike selection: Harley-Davidson, 2024, Street Glide. Find Parts.">
          <p className={styles.caption}>YOUR RIDE COMES FIRST</p>
          <div className={styles.bike}><div><small>MAKE</small><strong>Harley-Davidson</strong></div><div><small>YEAR</small><strong>2024</strong></div><div><small>MODEL</small><strong>Street Glide</strong></div></div>
          <Link className={styles.exampleButton} href="/search-results?make=Harley-Davidson&year=2024&model=Street+Glide">FIND PARTS <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className={styles.step} aria-labelledby="compare-title">
        <div className={styles.copy}><span className={styles.number}>02</span><div><h2 id="compare-title">READ THE WHOLE OFFER.</h2><p>Match the part number and details. Check NEW or USED, and OEM or AFTERMARKET. Sort by CONDITION, PRICE, or SHIP SCORE using the column headings.</p><p className={styles.tip}>The lowest item price may not mean the lowest total. Shipping and handling matter, too.</p></div></div>
        <div className={styles.visual}>
          <p className={styles.caption}>KNOW WHAT YOU’RE COMPARING</p>
          <div className={styles.comparison}><div><small>CONDITION</small><strong>NEW</strong><span>AFTERMARKET</span></div><div><small>PRICE</small><strong className={styles.price}>$149.00</strong><span>Item price</span></div><div><small>SHIP SCORE</small><strong className={styles.grade}>B</strong><span>Cost guide</span></div></div>
          <p className={styles.visualNote}>A = lowest shipping cost · E = highest · ? = not scored</p>
          <Link className={styles.textLink} href="/shipping-score">UNDERSTAND SHIPPING SCORES <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className={styles.step} aria-labelledby="retailer-title">
        <div className={styles.copy}><span className={styles.number}>03</span><div><h2 id="retailer-title">TAKE IT TO THE RETAILER.</h2><p>Select the retailer’s name to explore the offer. Before buying, confirm fitment, availability, shipping charges, and the return policy with the retailer.</p><p className={styles.tip}>Bagger McGee helps you compare. Your purchase and fulfillment are handled by the retailer.</p></div></div>
        <div className={`${styles.visual} ${styles.checklist}`}>
          <p className={styles.caption}>BEFORE YOU BUY</p>
          <ul><li><span aria-hidden="true">✓</span> Right part. Right bike.</li><li><span aria-hidden="true">✓</span> Item price + shipping + tax.</li><li><span aria-hidden="true">✓</span> Stock and return policy checked.</li></ul>
        </div>
      </section>

      <section className={styles.tools} aria-labelledby="tools-title"><h2 id="tools-title">A FEW HANDY EXTRAS.</h2><div className={styles.toolGrid}>
        <article><span className={styles.symbol} aria-hidden="true">▣</span><h3>COPY A COUPON</h3><p>Use the copy icon beside a code. Check the retailer’s terms and apply it at checkout.</p></article>
        <article><span className={styles.symbol} aria-hidden="true">↥</span><h3>SHARE A FIND</h3><p>Use the share arrow to copy a listing link and pass it along.</p></article>
        <article><span className={styles.symbol} aria-hidden="true">⚑</span><h3>SPOT A PROBLEM?</h3><p>The skull-and-crossbones flag opens a form to report a listing issue.</p></article>
      </div></section>
      <section className={styles.finish}><div><h2>GOT IT? LET’S FIND YOUR PART.</h2><p>Start with your bike and work your way down to the details.</p></div><Link href="/" className={shared.primary}>FIND PARTS <span aria-hidden="true">→</span></Link></section>
    </main>
    <PublicFooter previewNote="For Sam and Kenny. Tutorial design concept. Example prices and scores are fictional; catalog search and fitment remain simulated. Retailer links currently open demo listing pages, coupons are fictional, and issue reports save locally only. Live shopping and retailer participation are not established. Remove design disclosures before launch." />
  </div>;
}
