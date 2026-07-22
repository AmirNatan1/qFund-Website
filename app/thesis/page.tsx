import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { underwritingTests } from "../siteData";

export const metadata: Metadata = {
  title: "Investment Thesis | qFund",
  description: "How qFund builds conviction in foundational technology before consensus forms.",
};

const proofPath = [
  ["01", "Observe", "Find the technical insight that changes what a system can do."],
  ["02", "Prove", "Design the shortest credible path to retire the defining risk."],
  ["03", "Build", "Turn a breakthrough into an architecture customers can trust."],
  ["04", "Compound", "Let data, know-how, integration, and scale deepen the advantage."],
] as const;

export default function ThesisPage() {
  return (
    <InnerPageShell active="thesis">
      <section className="inner-hero thesis-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/">← Back to the long scroll</Link>
          <p className="eyebrow">INVESTMENT THESIS / QF–01</p>
          <h1>Technical truth<br />becomes <em>economic leverage.</em></h1>
          <p className="inner-hero-deck">
            Deeptech is not a sector. It is a way of building enduring advantage—where science, engineering, and company design must move as one system.
          </p>
        </div>
        <div className="thesis-hero-system reveal is-visible" aria-hidden="true">
          <span className="thesis-ring thesis-ring-a" />
          <span className="thesis-ring thesis-ring-b" />
          <span className="thesis-ring thesis-ring-c" />
          <span className="thesis-node node-one" />
          <span className="thesis-node node-two" />
          <span className="thesis-node node-three" />
          <strong>QF<br />01</strong>
          <small>CONVICTION ENGINE</small>
        </div>
        <div className="inner-hero-meta"><span>HERZLIYA / ISRAEL</span><span>SCROLL TO DE-RISK ↓</span></div>
      </section>

      <section className="inner-section thesis-premise section-light">
        <div className="section-index reveal"><span>01</span><p>The premise</p></div>
        <div className="editorial-split">
          <h2 className="reveal">The application layer moves quickly. <em>The foundations move everything.</em></h2>
          <div className="editorial-copy reveal">
            <p>We look below obvious product categories for enabling technologies that unlock new performance, resilience, access, or economics across entire systems.</p>
            <p>That means getting comfortable while the evidence is still technical: before a market has a familiar label, before the benchmark is standardized, and often before a conventional growth curve exists.</p>
          </div>
        </div>
      </section>

      <section className="inner-section four-tests section-dark">
        <div className="section-index reveal"><span>02</span><p>The four tests</p></div>
        <div className="tests-heading reveal">
          <p className="eyebrow">WHAT EARLY EVIDENCE LOOKS LIKE</p>
          <h2>Conviction is built<br />one risk at a time.</h2>
        </div>
        <div className="full-test-grid">
          {underwritingTests.map((test, index) => (
            <article className="full-test reveal" key={test.code} style={{ "--test-index": index } as CSSProperties}>
              <div className="test-radar" aria-hidden="true"><span /><i /><strong>{test.code}</strong></div>
              <span>{test.signal}</span>
              <h3>{test.title}</h3>
              <p>{test.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section proof-path section-sage">
        <div className="section-index reveal"><span>03</span><p>The proof path</p></div>
        <div className="proof-heading reveal">
          <p className="eyebrow dark">FROM FIRST PRINCIPLE TO ENDURING COMPANY</p>
          <h2>A milestone is valuable when it changes what becomes possible next.</h2>
        </div>
        <div className="proof-track">
          {proofPath.map(([number, title, text], index) => (
            <article className="proof-step reveal" key={number}>
              <span>{number}</span>
              <div className="proof-pulse" aria-hidden="true"><i style={{ animationDelay: `${index * 0.5}s` }} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section founder-fit section-ink">
        <div className="section-index reveal"><span>04</span><p>Founder fit</p></div>
        <div className="fit-grid">
          <div className="fit-heading reveal">
            <p className="eyebrow">WE ARE MOST USEFUL WHEN</p>
            <h2>The company is still hard to explain—and impossible to ignore once understood.</h2>
          </div>
          <div className="fit-list">
            {[
              "Your insight precedes the category that will contain it.",
              "Scientific and commercial milestones must reinforce one another.",
              "Early customers need trust, integration, and a view of the future.",
              "You are building a global company from an Israeli technical advantage.",
            ].map((item, index) => (
              <div className="fit-row reveal" key={item}><span>0{index + 1}</span><p>{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-cta thesis-inner-cta">
        <div className="cta-orbit" aria-hidden="true"><span /><span /><i /></div>
        <p className="eyebrow reveal">A TECHNICAL CONVERSATION IS A GOOD PLACE TO START</p>
        <h2 className="reveal">Show us the assumption<br /><em>you know is wrong.</em></h2>
        <a className="reveal" href="mailto:info@qfund.io?subject=Building%20past%20the%20obvious">Tell us what you see <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
