import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { evaluationPillars, focusAreas, investmentCriteria } from "../siteData";

export const metadata: Metadata = {
  title: "Investment Thesis | qFund",
  description:
    "qFund invests in top-tier founders, breakthrough Deep Tech, and massive high-conviction markets.",
};

export default function ThesisPage() {
  return (
    <InnerPageShell active="thesis">
      <section className="inner-hero thesis-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/">← qFund</Link>
          <p className="eyebrow">INVESTMENT THESIS</p>
          <h1>Investing in top-tier<br /><em>Deep Tech founders.</em></h1>
          <p className="inner-hero-deck">
            qFund invests in the proven experts behind 10× industry transformations.
          </p>
        </div>
        <div className="thesis-hero-system reveal is-visible" aria-hidden="true">
          <span className="thesis-ring thesis-ring-a" />
          <span className="thesis-ring thesis-ring-b" />
          <span className="thesis-ring thesis-ring-c" />
          <span className="thesis-node node-one" />
          <span className="thesis-node node-two" />
          <span className="thesis-node node-three" />
          <strong>INVESTMENT<br />CRITERIA</strong>
          <small>FOUNDERS · DEEP TECH · MARKET</small>
        </div>
        <div className="inner-hero-meta"><span>HERZLIYA · ISRAEL</span><span>THE THESIS ↓</span></div>
      </section>

      <section className="inner-section thesis-premise section-light">
        <div className="section-index reveal"><span>01</span><p>Deep Tech</p></div>
        <div className="editorial-split">
          <h2 className="reveal">Deep Tech is not just <em>“hard” technology.</em></h2>
          <div className="editorial-copy reveal">
            <p>It combines scientific innovation, engineering complexity, long development cycles, difficult replication, and strategic importance.</p>
            <p>
              qFund invests in startups developing core infrastructure, hardware, and enabling technologies across defense, energy, semiconductors, quantum computing, industrial systems, AI, and robotics.
            </p>
          </div>
        </div>
      </section>

      <section className="inner-section four-tests section-dark" id="investment-criteria">
        <div className="section-index reveal"><span>02</span><p>Investment criteria</p></div>
        <div className="tests-heading reveal">
          <p className="eyebrow">INVESTMENT THESIS</p>
          <h2>Three requirements.<br />One investment discipline.</h2>
        </div>
        <div className="full-test-grid">
          {investmentCriteria.map((pillar, index) => (
            <article className="full-test reveal" key={pillar.code} style={{ "--test-index": index } as CSSProperties}>
              <div className="test-radar" aria-hidden="true"><span /><i /><strong>{pillar.code}</strong></div>
              <span>INVESTMENT CRITERION</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section proof-path section-sage">
        <div className="section-index reveal"><span>03</span><p>Strategic focus</p></div>
        <div className="proof-heading reveal">
          <p className="eyebrow dark">STRATEGIC FOCUS</p>
          <h2>Breakthrough technologies across six strategic focus areas.</h2>
        </div>
        <div className="proof-track">
          {focusAreas.map((area, index) => (
            <article className="proof-step reveal" key={area.code}>
              <span>{area.code}</span>
              <div className="proof-pulse" aria-hidden="true"><i style={{ animationDelay: `${index * 0.35}s` }} /></div>
              <h3>{area.title}</h3>
              <p>{area.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section founder-fit section-ink">
        <div className="section-index reveal"><span>04</span><p>Evaluation</p></div>
        <div className="fit-grid">
          <div className="fit-heading reveal">
            <p className="eyebrow">HOW QFUND EVALUATES DEEP TECH</p>
            <h2>Founders. Technology. Market. Defensibility.</h2>
          </div>
          <div className="fit-list">
            {evaluationPillars.map((pillar, index) => (
              <div className="fit-row reveal" key={pillar.code}>
                <span>0{index + 1}</span>
                <p><strong>{pillar.title}.</strong> {pillar.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-cta thesis-inner-cta">
        <div className="cta-orbit" aria-hidden="true"><span /><span /><i /></div>
        <p className="eyebrow reveal">BACKING DEEP TECH FOUNDERS</p>
        <h2 className="reveal">Building an Israeli-related<br /><em>Deep Tech company?</em></h2>
        <a className="reveal" href="mailto:info@qfund.io">info@qfund.io <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
