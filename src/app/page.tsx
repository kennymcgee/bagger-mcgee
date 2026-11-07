import Link from "next/link";

export default function Home() {
  return (
    <main>
      <header><Link className="brand" href="/">BAGGER McGEE<span>MOTORCYCLE PARTS</span></Link><span className="badge">Coming soon</span></header>
      <section className="hero">
        <p className="eyebrow">FOR THE NEXT MILE</p>
        <h1>Your ride.<br />Your parts.<br /><em>A better price.</em></h1>
        <p className="intro">A simpler way to compare motorcycle parts for Harley-Davidson and Indian motorcycles.</p>
        <div className="notice"><span className="dot" /><p>We’re building Bagger McGee.<br /><strong>Parts and price comparisons are coming soon.</strong></p></div>
      </section>
      <footer><span>BAGGER McGEE</span><p>Built for riders. Made for the road.</p></footer>
    </main>
  );
}
