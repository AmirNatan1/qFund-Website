import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";

export const metadata: Metadata = {
  title: "For Founders | qFund",
  description: "What deep-tech founders can expect when building conviction with qFund—from technical truth to an enduring company.",
};

const conversationLayers = [
  ["01", "The technical discontinuity", "What became possible that was not possible before—and which assumption in the existing system does it overturn?"],
  ["02", "The defining evidence", "Which result matters most now, what would falsify the thesis, and what is the shortest credible experiment?"],
  ["03", "The economic consequence", "Whose system changes when the technology works, and why is the improvement important enough to adopt?"],
  ["04", "The company inside the science", "How can product, talent, customer learning, and capital reinforce the technical advantage?"],
] as const;

const partnershipVectors = [
  ["T/01", "Technical narrative", "Translate a dense breakthrough into a precise explanation without flattening what makes it defensible."],
  ["M/02", "Milestone architecture", "Connect scientific proof, engineering readiness, customer evidence, and financing into one coherent sequence."],
  ["C/03", "Customer logic", "Identify the operators who feel the constraint most acutely and the evidence they need before they can trust a new system."],
  ["S/04", "Scale story", "Make the case for how learning, integration, data, manufacturing, or deployment compounds the moat."],
] as const;

export default function FoundersPage() {
  return (
    <InnerPageShell active="founders">
      <section className="inner-hero founders-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="founder-lattice" aria-hidden="true">
          <span className="lattice-beam beam-a" /><span className="lattice-beam beam-b" /><span className="lattice-beam beam-c" />
          {Array.from({ length: 16 }, (_, index) => (
            <i key={index} style={{ "--node-index": index } as CSSProperties} />
          ))}
          <strong>BUILD<br />STATE</strong>
        </div>
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/#explore">← Back to the qFund system</Link>
          <p className="eyebrow">FOR FOUNDERS / QF–03</p>
          <h1>Build the company<br />inside the <em>breakthrough.</em></h1>
          <p className="inner-hero-deck">Deeptech founders carry two responsibilities at once: prove something difficult is true, then build an organization capable of making that truth matter.</p>
        </div>
        <div className="inner-hero-meta"><span>FOUNDER INTERFACE / ACTIVE</span><span>FOLLOW THE EVIDENCE ↓</span></div>
      </section>

      <section className="inner-section founder-conversation section-light">
        <div className="section-index reveal"><span>01</span><p>The first conversations</p></div>
        <div className="founder-conversation-heading reveal">
          <p className="eyebrow dark">START WITH THE THING THAT IS HARD TO FAKE</p>
          <h2>We want to understand the evidence—not hear a rehearsed version of certainty.</h2>
        </div>
        <div className="conversation-layers">
          {conversationLayers.map(([number, title, text], index) => (
            <article className="conversation-layer reveal" key={number} style={{ "--layer-index": index } as CSSProperties}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="layer-signal" aria-hidden="true"><i /><b /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section founder-proof section-dark">
        <div className="section-index reveal"><span>02</span><p>How evidence compounds</p></div>
        <div className="founder-proof-layout">
          <div className="proof-console reveal">
            <p className="eyebrow">LIVE COMPANY STATE</p>
            <div className="proof-console-screen" aria-hidden="true">
              <span className="console-beam" />
              <span className="proof-ring pr-one" /><span className="proof-ring pr-two" /><span className="proof-ring pr-three" />
              <i className="proof-dot pd-one" /><i className="proof-dot pd-two" /><i className="proof-dot pd-three" /><i className="proof-dot pd-four" />
              <strong>QF<br />BUILD</strong>
            </div>
            <small>TECHNICAL PROOF → COMPANY PROOF</small>
          </div>
          <div className="proof-gates">
            {[
              ["GATE / 01", "A result becomes repeatable", "The core phenomenon survives outside the original setup."],
              ["GATE / 02", "A system becomes usable", "Architecture turns performance into a product-shaped capability."],
              ["GATE / 03", "A customer changes behavior", "Evidence becomes strong enough for an operator to commit time, trust, or budget."],
              ["GATE / 04", "The advantage compounds", "Every deployment increases know-how, integration depth, or operating leverage."],
            ].map(([code, title, text], index) => (
              <article className="proof-gate reveal" key={code} style={{ "--gate-index": index } as CSSProperties}>
                <span>{code}</span><h3>{title}</h3><p>{text}</p><i aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section partnership-vectors section-sage">
        <div className="section-index reveal"><span>03</span><p>Where partnership helps</p></div>
        <div className="vectors-heading reveal">
          <p className="eyebrow dark">CAPITAL IS ONE INPUT</p>
          <h2>The useful work is aligning the technical path with the company path.</h2>
        </div>
        <div className="vector-grid">
          {partnershipVectors.map(([code, title, text], index) => (
            <article className="vector-card reveal" key={code} style={{ "--vector-index": index } as CSSProperties}>
              <span>{code}</span><h3>{title}</h3><p>{text}</p>
              <div className="vector-trace" aria-hidden="true"><i /><i /><i /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section founder-prep section-ink">
        <div className="section-index reveal"><span>04</span><p>What to bring</p></div>
        <div className="prep-grid">
          <div className="prep-heading reveal"><p className="eyebrow">NO PERFECT DECK REQUIRED</p><h2>Bring the clearest version of what you know—and what you still need to prove.</h2></div>
          <div className="prep-list">
            {[
              "The insight or architecture that makes the company non-obvious.",
              "The evidence you trust today, including where it is still fragile.",
              "The next milestone that would materially change the risk profile.",
              "The customer or system consequence if the technology succeeds.",
            ].map((item, index) => <div className="prep-row reveal" key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
          </div>
        </div>
      </section>

      <section className="inner-cta founders-inner-cta">
        <div className="founder-cta-beam" aria-hidden="true"><span /><span /><i /></div>
        <p className="eyebrow reveal">BUILDING PAST THE OBVIOUS?</p>
        <h2 className="reveal">Start with the<br /><em>technical truth.</em></h2>
        <a className="reveal" href="mailto:info@qfund.io?subject=Building%20with%20qFund">Begin the conversation <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
