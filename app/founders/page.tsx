import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { evaluationPillars, qFactorPillars, valueCreation } from "../siteData";

export const metadata: Metadata = {
  title: "For Founders | qFund",
  description:
    "qFund combines financial investment with technical validation, commercialization support, and strategic access for Deep Tech founders.",
};

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
          <strong>Q<br />FACTOR</strong>
        </div>
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/">← qFund</Link>
          <p className="eyebrow">FOR FOUNDERS</p>
          <h1>Backing<br /><em>Deep Tech founders.</em></h1>
          <p className="inner-hero-deck">
            Financial investment, technical validation, commercialization support, and strategic access.
          </p>
        </div>
        <div className="inner-hero-meta"><span>EARLY STAGE · SEED TO SERIES A</span><span>THE Q FACTOR ↓</span></div>
      </section>

      <section className="inner-section founder-conversation section-light">
        <div className="section-index reveal"><span>01</span><p>The Q Factor</p></div>
        <div className="founder-conversation-heading reveal">
          <p className="eyebrow dark">INVESTMENT THESIS</p>
          <h2>Top-tier founders—the proven experts behind 10× industry transformations.</h2>
        </div>
        <div className="conversation-layers">
          {qFactorPillars.map((pillar, index) => (
            <article className="conversation-layer reveal" key={pillar.code} style={{ "--layer-index": index } as CSSProperties}>
              <span>{pillar.code}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <div className="layer-signal" aria-hidden="true"><i /><b /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section founder-proof section-dark">
        <div className="section-index reveal"><span>02</span><p>How qFund evaluates</p></div>
        <div className="founder-proof-layout">
          <div className="proof-console reveal">
            <p className="eyebrow">FOUR-PILLAR METHOD</p>
            <div className="proof-console-screen" aria-hidden="true">
              <span className="console-beam" />
              <span className="proof-ring pr-one" /><span className="proof-ring pr-two" /><span className="proof-ring pr-three" />
              <i className="proof-dot pd-one" /><i className="proof-dot pd-two" /><i className="proof-dot pd-three" /><i className="proof-dot pd-four" />
              <strong>DEEP<br />TECH</strong>
            </div>
            <small>SCIENCE FICTION → REAL-WORLD INFRASTRUCTURE</small>
          </div>
          <div className="proof-gates">
            {evaluationPillars.map((pillar, index) => (
              <article className="proof-gate reveal" key={pillar.code} style={{ "--gate-index": index } as CSSProperties}>
                <span>{pillar.code}</span><h3>{pillar.title}</h3><p>{pillar.text}</p><i aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-section partnership-vectors section-sage">
        <div className="section-index reveal"><span>03</span><p>Value creation</p></div>
        <div className="vectors-heading reveal">
          <p className="eyebrow dark">QFUND × QUANTUM HUB</p>
          <h2>Capital, validation, strategic access, and commercialization support.</h2>
        </div>
        <div className="vector-grid">
          {valueCreation.map((item, index) => (
            <article className="vector-card reveal" key={item.code} style={{ "--vector-index": index } as CSSProperties}>
              <span>{item.code}</span><h3>{item.title}</h3><p>{item.text}</p>
              <div className="vector-trace" aria-hidden="true"><i /><i /><i /></div>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section founder-prep section-ink">
        <div className="section-index reveal"><span>04</span><p>Integrated platform</p></div>
        <div className="prep-grid">
          <div className="prep-heading reveal">
            <p className="eyebrow">INVESTMENT + VALIDATION</p>
            <h2>qFund and Quantum Hub operate side by side.</h2>
          </div>
          <div className="prep-list">
            {[
              "Strategic access to partners.",
              "Proof-of-concept implementation.",
              "Technology evaluations and partner assessments.",
              "A path from validation to investment and sustained value creation.",
            ].map((item, index) => (
              <div className="prep-row reveal" key={item}><span>0{index + 1}</span><p>{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-cta founders-inner-cta">
        <div className="founder-cta-beam" aria-hidden="true"><span /><span /><i /></div>
        <p className="eyebrow reveal">BACKING DEEP TECH FOUNDERS</p>
        <h2 className="reveal">Contact<br /><em>qFund.</em></h2>
        <a className="reveal" href="mailto:info@qfund.io">info@qfund.io <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
