import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { dealFlow, hubPartners, valueCreation } from "../siteData";

export const metadata: Metadata = {
  title: "qFund × Quantum Hub | qFund",
  description:
    "qFund and Quantum Hub combine investment, technical validation, partner access, and proof-of-concept implementation.",
};

export default function PlatformPage() {
  return (
    <InnerPageShell active="platform">
      <section className="inner-hero notes-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="notes-wave" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => <i style={{ "--wave-index": index } as CSSProperties} key={index} />)}
        </div>
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/#platform">← qFund</Link>
          <p className="eyebrow">INTEGRATED GROWTH PLATFORM</p>
          <h1>qFund ×<br /><em>Quantum Hub.</em></h1>
          <p className="inner-hero-deck">
            Investment, validation, partner access, and proof-of-concept implementation.
          </p>
        </div>
        <div className="inner-hero-meta"><span>QFUND INVESTMENT · QUANTUM HUB VALIDATION</span><span>THE PLATFORM ↓</span></div>
      </section>

      <section className="inner-section notes-index section-dark">
        <div className="section-index reveal"><span>01</span><p>Integrated growth platform</p></div>
        <div className="notes-intro reveal">
          <h2>Capital and validation operate side by side.</h2>
          <p>
            qFund enhances capital with strategic access to partners and facilitates proof-of-concept implementation.
          </p>
        </div>
        <div className="notes-grid">
          {valueCreation.map((item, index) => (
            <article className="note-card reveal" key={item.code} style={{ "--note-index": index } as CSSProperties}>
              <div className="note-top"><span>{item.code}</span><small>QFUND × QUANTUM HUB</small><i aria-hidden="true" /></div>
              <p className="note-category">Integrated platform</p>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section platform-playground section-light">
        <div className="section-index reveal"><span>02</span><p>PoC Playground</p></div>
        <div className="editorial-split">
          <h2 className="reveal">Six years of innovation, testing, and <em>proof of feasibility.</em></h2>
          <div className="editorial-copy reveal">
            <p>
              Quantum Hub is a proof-of-concept playground where startups test technologies commercially on partner infrastructure with immediate access to potential customers.
            </p>
            <p>
              The platform enables validation, experimentation, and accelerated commercialization in automotive, logistics, Industry 4.0, and energy.
            </p>
            <p>
              Facilities include test vehicles, beta sites, and access to partners and potential clients.
            </p>
          </div>
        </div>
      </section>

      <section className="inner-section platform-flow section-sage">
        <div className="section-index reveal"><span>03</span><p>Deal flow activity</p></div>
        <div className="platform-flow-heading reveal">
          <p className="eyebrow dark">THREE YEARS</p>
          <h2>From initial review to investment.</h2>
        </div>
        <div className="deal-flow-funnel" aria-label="qFund and Quantum Hub deal flow activity over three years">
          {dealFlow.map(([value, label], index) => (
            <article
              className="deal-flow-stage reveal"
              key={label}
              style={{
                "--flow-index": index,
                "--flow-width": `${100 - index * 10.5}%`,
              } as CSSProperties}
            >
              <strong>{value}</strong>
              <span>{label}</span>
              <i aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section research-method section-light">
        <div className="section-index reveal"><span>04</span><p>Quantum Hub partners</p></div>
        <div className="research-method-grid">
          <div className="reveal">
            <p className="eyebrow dark">INDUSTRIAL PARTNER NETWORK</p>
            <h2>Strategic access across industrial sectors.</h2>
          </div>
          <div className="research-cycles">
            {hubPartners.map((partner, index) => (
              <article className="research-cycle reveal" key={partner.name}>
                <span>0{index + 1}</span><h3>{partner.name}</h3><p>{partner.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-cta notes-inner-cta">
        <div className="note-signal-field" aria-hidden="true"><span /><span /><span /><span /></div>
        <p className="eyebrow reveal">QFUND × QUANTUM HUB</p>
        <h2 className="reveal">Investment.<br /><em>Validation.</em></h2>
        <a className="reveal" href="mailto:info@qfund.io">info@qfund.io <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
