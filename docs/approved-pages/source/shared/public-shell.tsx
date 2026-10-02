"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import styles from "./home.module.css";

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return <div className={styles.headerDock}>
    <div className={styles.preview}>HARLEY + INDIAN PARTS ONLY • OEM + AFTERMARKET • NEW + USED • INDEPENDENT OF BOTH BRANDS</div>
    <header className={styles.header} onKeyDown={e=>{if(e.key === "Escape"){setMenuOpen(false);menuButton.current?.focus();}}}>
      <div className={styles.brandGroup}><Link href="/" aria-label="Bagger McGee home" onClick={()=>setMenuOpen(false)}><Image className={styles.logo} src="/brand/bagger-horizontal-v2.png" alt="Bagger McGee — bearded rider skull logo" width={2172} height={724} priority /></Link><p className={styles.brandTagline}>SEARCH ENGINE FOR<br/>HARLEY &amp; INDIAN PARTS</p></div>
      <button ref={menuButton} type="button" className={styles.menuToggle} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} aria-controls="main-navigation" onClick={()=>setMenuOpen(!menuOpen)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d={menuOpen ? "m6 6 12 12M6 18 18 6" : "M3 6h18M3 12h18M3 18h18"}/></svg></button>
      <nav id="main-navigation" className={menuOpen ? styles.navOpen : ""} aria-label="Main navigation" onKeyDown={e=>{if(e.key === "Escape")setMenuOpen(false);}}>
        <Link href="/help" onClick={()=>setMenuOpen(false)}>FAQ</Link>
        <Link href="/for-retailers" onClick={()=>setMenuOpen(false)}>GET LISTED</Link>
        <Link href="/contact" onClick={()=>setMenuOpen(false)}>CONTACT</Link>
        <Link href="/quick-tutorial" onClick={()=>setMenuOpen(false)}>QUICK TUTORIAL</Link>
        <Link className={styles.loginLink} href="/log-in" onClick={()=>setMenuOpen(false)}>LOG IN</Link>
        <Link className={styles.signupLink} href="/sign-up" onClick={()=>setMenuOpen(false)}>SIGN UP</Link>
      </nav>
    </header>
  </div>;
}
const footerInfo: Record<string, string> = {
  "About": "Bagger McGee helps Harley-Davidson and Indian riders compare parts across retailers. Purchases and fulfillment stay with the retailer.",
  "Contact": "Contact details will be available when the site launches.",
  "Terms of Use": "Terms of Use are being prepared for launch.",
  "Privacy": "The Privacy policy is being prepared for launch.",
  "Affiliate Disclosure": "The Affiliate Disclosure is being prepared for launch.",
};

export function PublicFooter({ previewNote = "Design preview for Sam and Kenny. Sample offers, prices, coupons, and shipping scores are fictional; retailer participation is not implied. Live services are still in development." }: { previewNote?: string }) {
  const [panel, setPanel] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  function showInfo(title: string) { setPanel(title); dialog.current?.showModal(); }
  return <footer className={styles.siteFooter}>
    <div className={styles.footerGrid}>
      <nav aria-label="Search"><h2>SEARCH</h2><Link href="/search-results">Find Parts</Link><Link href="/shipping-score">Shipping Score</Link><Link href="/quick-tutorial">Quick Tutorial</Link></nav>
      <nav aria-label="Company"><h2>COMPANY</h2><button onClick={()=>showInfo("About")}>About</button><Link href="/help">FAQ</Link><Link href="/contact">Contact</Link></nav>
      <nav aria-label="Legal"><h2>LEGAL</h2>{["Terms of Use", "Privacy"].map(title=><button key={title} onClick={()=>showInfo(title)}>{title}</button>)}<Link href="/affiliate-disclosure">Affiliate Disclosure</Link></nav>
      <div className={styles.footerRetailers}><h2>FOR RETAILERS</h2><h3>LIST YOUR CATALOG</h3><p>Connect your parts catalog with riders looking for their next part.</p><Link href="/for-retailers">GET LISTED <span aria-hidden="true">→</span></Link></div>
    </div>
    <div className={styles.footerBase}><p>© 2026 Bagger McGee · Independent of Harley-Davidson and Indian Motorcycle.</p><Link href="/admin">Owner sign-in</Link></div>
    {/* Launch checklist: remove this private design disclosure before publishing the live site. */}
    <p className={styles.footerDisclosure}><strong>DESIGN PREVIEW</strong> {previewNote}</p>
    <dialog ref={dialog} className={styles.shareDialog} aria-labelledby="footer-dialog-title"><div className={styles.dialogHeading}><span>BAGGER McGEE</span><button aria-label="Close" onClick={()=>dialog.current?.close()}>×</button></div><h2 id="footer-dialog-title">{panel}</h2><p>{footerInfo[panel]}</p><button className={styles.primary} onClick={()=>dialog.current?.close()}>Close</button></dialog>
  </footer>;
}





