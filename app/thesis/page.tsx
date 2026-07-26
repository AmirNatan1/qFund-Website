import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { evaluationPillars, focusAreas, investmentCriteria, valueCreation } from "../siteData";
import EvaluationChamber from "./EvaluationChamber";
import FocusAreasGallery from "./FocusAreasGallery";
import ThesisConvictionField from "./ThesisConvictionField";

export const metadata: Metadata = {
  title: "Investment Thesis | qFund",
  description:
    "We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies from Seed to Series A across Deep Tech.",
  alternates: { canonical: "/thesis/" },
  openGraph: {
    title: "Investment Thesis | qFund",
    description: "We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies from Seed to Series A across Deep Tech.",
    url: "/thesis/",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Investment Thesis | qFund",
    description: "We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies from Seed to Series A across Deep Tech.",
    images: ["/og.png"],
  },
};

export default function ThesisPage() {
  return (
    <InnerPageShell active="thesis">
      <section className="inner-hero thesis-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/">← qFund</Link>
          <p className="eyebrow">INVESTMENT THESIS</p>
          <h1>
            <span>Investing in</span>
            <span>top-tier <em>Deep Tech</em></span>
            <span>founders.</span>
          </h1>
          <p className="inner-hero-deck">
            We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies.
          </p>
        </div>
        <ThesisConvictionField points={investmentCriteria} />
        <div className="inner-hero-meta"><span>HERZLIYA · ISRAEL</span><span>THE THESIS ↓</span></div>
      </section>

      <section className="inner-section thesis-premise thesis-premise-world section-light">
        <div className="section-index reveal"><span>01</span><p>Why Deep Tech</p></div>
        <div className="editorial-split">
          <h2 className="reveal">The world is <em>eating back.</em></h2>
          <div className="editorial-copy reveal">
            <p>“Software is eating the world,” Marc Andreessen wrote in 2011, and for two decades he was right. Software won almost everything. That era is closing. The hardest problems left — the energy transition, the limits of computation, national security — will not be solved by applications. They will be solved by companies built on fundamental scientific and engineering breakthroughs.</p>
            <div className="metrics" aria-label="Deep Tech market context">
              <article><strong>$177B</strong><span>Global Deep Tech market, 2025</span></article>
              <article><strong>82.5%</strong><span>Year-over-year growth</span></article>
            </div>
            <p>Source: Deep Tech Funding Playbook, 2026.</p>
          </div>
        </div>
      </section>

      <section className="inner-section thesis-premise thesis-premise-definition section-light">
        <div className="section-index reveal"><span>02</span><p>Deep Tech</p></div>
        <div className="editorial-split">
          <h2 className="reveal">Deep Tech is not just <em>“hard” technology.</em></h2>
          <div className="editorial-copy reveal">
            <p>It combines scientific innovation, engineering complexity, long development cycles, difficult replication, and strategic importance.</p>
            <p>We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies across defense, energy, semiconductors, quantum computing, industrial systems, AI, and robotics.</p>
          </div>
        </div>
      </section>

      <section className="inner-section four-tests section-dark" id="investment-criteria">
        <div className="section-index reveal"><span>03</span><p>Investment criteria</p></div>
        <div className="tests-heading reveal">
          <p className="eyebrow">INVESTMENT THESIS</p>
          <h2>Three requirements.<br />One investment discipline.</h2>
        </div>
        <div className="full-test-grid criteria-grid">
          {investmentCriteria.map((pillar, index) => (
            <article className={`full-test criterion-card criterion-${index + 1} reveal`} key={pillar.code} style={{ "--test-index": index } as CSSProperties}>
              {index === 0 ? (
                <div className="criterion-visual criterion-founders" aria-hidden="true">
                  <span className="criterion-founder-core"><i /><b /></span>
                  {Array.from({ length: 5 }, (_, node) => <i className={`criterion-founder-node node-${node + 1}`} key={node} />)}
                  <span className="criterion-founder-link link-a" />
                  <span className="criterion-founder-link link-b" />
                  <span className="criterion-founder-link link-c" />
                </div>
              ) : null}
              {index === 1 ? (
                <div className="criterion-visual criterion-technology" aria-hidden="true">
                  <span className="technology-beam" />
                  <span className="technology-beam beam-secondary" />
                  <div className="technology-wave">
                    {Array.from({ length: 11 }, (_, bar) => <i style={{ "--bar": bar } as CSSProperties} key={bar} />)}
                  </div>
                  <b>10×</b>
                </div>
              ) : null}
              {index === 2 ? (
                <div className="criterion-visual criterion-market" aria-hidden="true">
                  <span className="market-horizon" />
                  <span className="market-origin" />
                  <i className="market-ring ring-a" />
                  <i className="market-ring ring-b" />
                  <i className="market-ring ring-c" />
                  <b className="market-marker marker-a" />
                  <b className="market-marker marker-b" />
                  <b className="market-marker marker-c" />
                </div>
              ) : null}
              <span>INVESTMENT CRITERION</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section founder-fit section-ink" id="evaluation">
        <div className="section-index reveal"><span>04</span><p>Evaluation</p></div>
        <div className="evaluation-heading reveal">
          <p className="eyebrow">HOW WE EVALUATE DEEP TECH</p>
          <h2>A four-part test for enduring advantage.</h2>
          <p>Each investment must withstand technical, commercial, and founder-level scrutiny.</p>
        </div>
        <EvaluationChamber pillars={evaluationPillars} />
      </section>

      <section className="inner-section partnership-vectors section-sage">
        <div className="section-index reveal"><span>05</span><p>Value creation</p></div>
        <div className="vectors-heading reveal">
          <p className="eyebrow dark">WHAT WE BRING</p>
          <h2>Investment, validation, strategic access, and commercialization support.</h2>
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

      <section className="inner-section proof-path strategic-focus-section section-light">
        <div className="section-index reveal"><span>06</span><p>Strategic focus</p></div>
        <div className="strategic-focus-heading reveal">
          <p className="eyebrow dark">WHERE WE INVEST</p>
          <h2>Six strategic <em>focus areas.</em></h2>
          <p>Quantum computing, defense, energy, advanced industry, semiconductors, and advanced electronics.</p>
        </div>
        <FocusAreasGallery areas={focusAreas} />
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
