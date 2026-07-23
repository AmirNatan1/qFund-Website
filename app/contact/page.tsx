import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { qFactorPillars } from "../siteData";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact qFund | Deep Tech Venture Capital",
  description:
    "Contact qFund, an early-stage venture capital firm backing Israeli-related Deep Tech founders.",
};

export default function ContactPage() {
  return (
    <InnerPageShell active="contact">
      <section className="contact-route-hero">
        <div className="contact-route-grid" aria-hidden="true" />
        <div className="contact-transmission" aria-hidden="true">
          <span className="transmission-ring transmission-ring-a" />
          <span className="transmission-ring transmission-ring-b" />
          <span className="transmission-ring transmission-ring-c" />
          <span className="transmission-ring transmission-ring-d" />
          <i className="transmission-sweep" />
          <b className="transmission-node node-a" />
          <b className="transmission-node node-b" />
          <b className="transmission-node node-c" />
          <strong>Q</strong>
          <small>CHANNEL OPEN</small>
        </div>

        <div className="contact-route-copy reveal is-visible">
          <Link className="back-link" href="/">← qFund</Link>
          <p className="eyebrow">CONTACT QFUND</p>
          <h1>Begin the<br /><em>conversation.</em></h1>
          <p>
            qFund backs Israeli-related startups developing core infrastructure,
            hardware, and enabling technologies.
          </p>
        </div>

        <div className="contact-route-meta">
          <span>ARIK EINSTEIN 3 · HERZLIYA, ISRAEL</span>
          <a href="mailto:info@qfund.io">INFO@QFUND.IO ↗</a>
        </div>
      </section>

      <section className="contact-route-body section-light">
        <div className="section-index reveal"><span>01</span><p>Founder introduction</p></div>
        <div className="contact-route-layout">
          <ContactForm />
          <aside className="contact-direct reveal">
            <p className="eyebrow dark">DIRECT CHANNELS</p>
            <div>
              <span>Email</span>
              <a href="mailto:info@qfund.io">info@qfund.io ↗</a>
            </div>
            <div>
              <span>LinkedIn</span>
              <a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">
                qFund ↗
              </a>
            </div>
            <div>
              <span>Office</span>
              <p>Arik Einstein 3<br />Herzliya, Israel</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="contact-qfactor section-dark">
        <div className="section-index reveal"><span>02</span><p>The Q Factor</p></div>
        <div className="contact-qfactor-heading reveal">
          <p className="eyebrow">INVESTMENT THESIS</p>
          <h2>Founders.<br />Deep Tech.<br /><em>Market.</em></h2>
          <Link className="text-link route-link inverted" href="/thesis/">
            Read the investment thesis <span>↗</span>
          </Link>
        </div>
        <div className="contact-qfactor-list">
          {qFactorPillars.map((pillar, index) => (
            <article className="contact-qfactor-row reveal" key={pillar.code}>
              <span>{pillar.code}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
              <i style={{ "--contact-index": index } as CSSProperties} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>
    </InnerPageShell>
  );
}
