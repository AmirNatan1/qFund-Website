import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { evaluationPillars, investmentCriteria, valueCreation } from "../siteData";
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

      <section className="inner-section thesis-premise section-light">
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

      <section className="inner-section thesis-premise section-light">
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

      <section className="inner-section founder-fit section-ink" id="evaluation">
        <div className="section-index reveal"><span>04</span><p>Evaluation</p></div>
        <div className="fit-grid">
          <div className="fit-heading reveal">
            <p className="eyebrow">HOW WE EVALUATE DEEP TECH</p>
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

      <section className="inner-section proof-path section-light">
        <div className="section-index reveal"><span>06</span><p>Strategic focus</p></div>
        <div className="editorial-split">
          <h2 className="reveal">Six strategic <em>focus areas.</em></h2>
          <div className="editorial-copy reveal">
            <p>We invest across six strategic focus areas: quantum computing, defense, energy, advanced industry, semiconductors, and advanced electronics.</p>
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
