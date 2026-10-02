import Link from "next/link";
import { PublicHeader, PublicFooter } from "../public-shell";
import shared from "../home.module.css";
import styles from "./terms.module.css";

export const metadata = { title: "Terms of Use | Bagger McGee" };

export default function TermsPage() {
 return <div className={shared.site}>
  <a className={shared.skip} href="#terms-main">Skip to terms of use</a>
  <PublicHeader />
  <main id="terms-main" className={styles.main}>
   <div className={styles.hero}>
    <p className={styles.eyebrow}>CLEAR TERMS FOR RIDERS &amp; RETAILERS</p>
    <h1>TERMS<br /><span>OF USE.</span></h1>
    <p>The rules of the road for using Bagger McGee.</p>
    <p className={styles.draft}>DRAFT FOR REVIEW · OCTOBER 2, 2026 · NOT YET EFFECTIVE</p>
   </div>
   <nav className={styles.contents} aria-label="Terms sections"><p className={styles.eyebrow}>ON THIS PAGE</p><div>
    <a href="#using-the-site">WHO WE ARE</a>
    <a href="#age-and-accounts">BROWSING &amp; ACCOUNTS</a>
    <a href="#retailer-purchases">PURCHASES &amp; FITMENT</a>
    <a href="#comparisons">RESULTS &amp; SHIPPING SCORES</a>
    <a href="#reviews-and-conduct">RIDER CONTENT &amp; FAIR USE</a>
    <a href="#site-content">CONTENT, LINKS &amp; AVAILABILITY</a>
    <a href="#updates-and-contact">UPDATES &amp; QUESTIONS</a>
    <a href="#demonstration">CURRENT DEMONSTRATION</a>
   </div></nav>
   <div className={styles.content}>
    <section id="using-the-site" className={styles.section} aria-labelledby="using-the-site-title">
     <p className={styles.eyebrow}>01 / WHO WE ARE</p><h2 id="using-the-site-title">A SEARCH ENGINE FOR RIDERS.</h2>
     <p>Bagger McGee is operated by Bagger McGee LLC, a North Carolina limited liability company. These Terms describe the conditions for using our website and any features we make available.</p>
     <p>Our intended market is the United States. Visitors worldwide are welcome to browse. Retailer shipping destinations, product availability, and local requirements may vary. Browsing our site does not mean a retailer can ship to your location.</p>
     
     
    </section>
    <section id="age-and-accounts" className={styles.section} aria-labelledby="age-and-accounts-title">
     <p className={styles.eyebrow}>02 / BROWSING &amp; ACCOUNTS</p><h2 id="age-and-accounts-title">LOOK AROUND. KNOW THE RULES.</h2>
     <p>Anyone may browse Bagger McGee. You must be at least 16 to create a rider account or submit a review. If you are under the age of majority where you live, you must have permission from a parent or legal guardian to use those features.</p>
     <p>When account features become available, provide accurate information, keep your sign-in details private, and use only accounts you are authorized to access. Do not impersonate another person or submit someone else’s private information.</p>
     <p>Use of an account or submission feature is subject to these Terms. The minimum age is a site participation rule; it does not establish eligibility to ride, obtain a license, or purchase a particular product.</p>
     
     
    </section>
    <section id="retailer-purchases" className={styles.section} aria-labelledby="retailer-purchases-title">
     <p className={styles.eyebrow}>03 / PURCHASES &amp; FITMENT</p><h2 id="retailer-purchases-title">YOU BUY FROM THE RETAILER.</h2>
     <p>Bagger McGee helps riders compare Harley-Davidson and Indian motorcycle parts. We do not sell the listed parts or process your purchase. When you follow a retailer link, that retailer handles checkout, payment, fulfillment, returns, warranties, and order support under its own terms.</p>
     <p>Before buying, confirm the current price, condition, stock, coupon requirements, shipping charges, taxes, delivery estimates, return policy, and warranty directly with the retailer. Information on Bagger McGee may change or contain errors.</p>
     <p>Confirm fitment for your exact motorcycle, including year, model, modifications, and required installation work. Search matches and Garage selections are aids, not fitment or safety guarantees. Follow manufacturer instructions and use a qualified professional when needed. Check applicable road-use and emissions requirements before buying or installing a part.</p>
     
     
    </section>
    <section id="comparisons" className={styles.section} aria-labelledby="comparisons-title">
     <p className={styles.eyebrow}>04 / RESULTS &amp; SHIPPING SCORES</p><h2 id="comparisons-title">COMPARE WITH YOUR EYES OPEN.</h2>
     <p>Search returns matching listings in the catalog, with available sorting controlled by the rider. Our catalog is not a promise to include every retailer or every part on the market.</p>
     <p>Shipping Scores are comparison indicators based on the information and method described on our Shipping Score page. They are not guarantees of delivery dates, retailer performance, product quality, or your individual experience. Rider reviews and ratings are separate from Shipping Scores.</p>
     <p>Payment will never influence search placement, rankings, recommendations, Shipping Scores, retailer spotlights, blog mentions, or customer reviews and ratings. Intended retailer participation may involve monthly subscriptions based on catalog SKU count or future affiliate arrangements. See our Affiliate Disclosure for details. Retailer subscriptions require separate agreed terms; browsing this site does not purchase a subscription.</p>
     <p className={styles.links}><Link href="/shipping-score">Shipping Score explained →</Link><Link href="/affiliate-disclosure">Affiliate Disclosure →</Link></p>
     
    </section>
    <section id="reviews-and-conduct" className={styles.section} aria-labelledby="reviews-and-conduct-title">
     <p className={styles.eyebrow}>05 / RIDER CONTENT &amp; FAIR USE</p><h2 id="reviews-and-conduct-title">REAL EXPERIENCES. RESPECTFUL USE.</h2>
     <p>When review submissions become available, share an honest account of your own purchase or direct retailer experience. Disclose any relevant business relationship or incentive. Do not submit fake reviews, threats, harassment, unlawful material, or content that infringes someone else’s rights. Leave out addresses, order numbers, payment details, and other private information.</p>
     <p>You keep ownership of your submissions. By submitting content for publication, you give Bagger McGee a nonexclusive permission to display it and make formatting or privacy edits needed to publish and moderate it. This permission does not transfer ownership of your review.</p>
     <p>Reviews are checked before publication. We may decline or remove content that violates these rules, but will not suppress an honest review because it is negative or because a retailer pays us. Nothing in these Terms limits your right to express an honest opinion.</p>
     <p>Do not disrupt the site, attempt unauthorized access, distribute malicious software, manipulate scores or ratings, or collect other people’s personal information. We may restrict account or submission access for misuse, security concerns, or legal requirements.</p>
     
     
    </section>
    <section id="site-content" className={styles.section} aria-labelledby="site-content-title">
     <p className={styles.eyebrow}>06 / CONTENT, LINKS &amp; AVAILABILITY</p><h2 id="site-content-title">INDEPENDENT. ALWAYS EVOLVING.</h2>
     <p>Bagger McGee’s original site design, branding, and content belong to Bagger McGee LLC or their respective owners. You may browse and share links. Permission to use the site does not grant ownership of our branding or someone else’s product photos, trademarks, or content.</p>
     <p>Harley-Davidson, Indian Motorcycle, retailer names, and other third-party marks belong to their respective owners. Bagger McGee is independent of Harley-Davidson and Indian Motorcycle. Product and business references do not imply sponsorship or endorsement.</p>
     <p>Third-party websites have their own terms and privacy practices. We do not control their content or services. We may update, pause, or discontinue site features and correct information. We do not promise uninterrupted access or error-free information. Nothing in these Terms removes rights or protections that applicable law gives you.</p>
     
     
    </section>
    <section id="updates-and-contact" className={styles.section} aria-labelledby="updates-and-contact-title">
     <p className={styles.eyebrow}>07 / UPDATES &amp; QUESTIONS</p><h2 id="updates-and-contact-title">KEEP THE TERMS IN VIEW.</h2>
     <p>We will show an effective date when these Terms take effect and a revised date when they change. Material changes affecting accounts or submissions will be brought to users’ attention before they apply. Updated terms apply prospectively, subject to applicable law.</p>
     <p>For site questions or to raise a concern about these Terms, see our Contact page. For a purchase, return, delivery, or warranty question, contact the retailer that handled your order.</p>
     
     <p className={styles.links}><Link href="/contact">Contact Bagger McGee →</Link></p>
    </section>
    <section id="demonstration" className={styles.section} aria-labelledby="demonstration-title">
     <p className={styles.eyebrow}>08 / CURRENT DEMONSTRATION</p><h2 id="demonstration-title">SAMPLE OFFERS. NO LIVE TRANSACTIONS.</h2>
     <p>The current demonstration uses fictional listings, offers, prices, coupons, and scores. Some sample retailer names may identify real businesses being considered for future outreach. Their appearance does not imply participation, permission, endorsement, or an offer available to purchase.</p>
     <p>No affiliate arrangements or paid retailer revenue are currently active. Account creation and login are demonstration flows. Garage, saved items, price alerts, and public reviews are proposed features, not promises of currently available services.</p>
     <p>Contact and retailer-interest forms do not currently transmit messages. Listing reports save locally. A link, copied coupon, or interactive preview does not establish an account, process an order, send a message, or confirm that a report reached us.</p>
     
     
    </section>
   </div>
  </main>
  <PublicFooter previewNote="For Sam and Kenny. Terms of Use draft for review, not effective or approved. Bagger McGee LLC will be registered in North Carolina before public launch. Verify registration and final contact details before launch; set the effective date then. No governing law, venue, arbitration, class-action waiver, indemnity, or contractual liability cap has been selected. Parent or guardian permission for minor account/review users and limited submission permission are proposed draft provisions. Final account, review, notice, and privacy practices must match implemented features before activation. The Privacy page remains to be completed. This draft does not establish live services." />
 </div>;
}
