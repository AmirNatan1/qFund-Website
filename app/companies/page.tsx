import type { Metadata } from "next";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import CompaniesExperience from "./CompaniesExperience";

export const metadata: Metadata = {
  title: "Companies | qFund",
  description: "Selected qFund companies building foundational technology across compute, communications, and intelligent systems.",
};

export default function CompaniesPage() {
  return (
    <InnerPageShell active="companies">
      <section className="inner-hero companies-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="company-constellation" aria-hidden="true">
          <span className="constellation-line line-a" /><span className="constellation-line line-b" /><span className="constellation-line line-c" />
          <i className="constellation-node cn-a" /><i className="constellation-node cn-b" /><i className="constellation-node cn-c" /><i className="constellation-node cn-d" />
        </div>
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/#portfolio">← Back to selected companies</Link>
          <p className="eyebrow">COMPANY SYSTEM / QF–02</p>
          <h1>Proof lives<br />in the <em>build.</em></h1>
          <p className="inner-hero-deck">A portfolio of teams turning difficult science and engineering into infrastructure the world can depend on.</p>
        </div>
        <div className="inner-hero-meta"><span>SELECTED PORTFOLIO</span><span>FILTER THE SYSTEM ↓</span></div>
      </section>

      <section className="inner-section directory-section section-light">
        <div className="section-index reveal"><span>01</span><p>Company directory</p></div>
        <CompaniesExperience />
      </section>

      <section className="inner-section portfolio-pattern section-sage">
        <div className="section-index reveal"><span>02</span><p>The pattern</p></div>
        <div className="pattern-heading reveal">
          <p className="eyebrow dark">DIFFERENT FIELDS / SHARED ARCHITECTURE</p>
          <h2>We look for advantages that become more defensible as the company learns.</h2>
        </div>
        <div className="pattern-grid">
          {[
            ["01", "Hard to begin", "Specialized insight, engineering depth, or scientific risk creates a real starting barrier."],
            ["02", "Clear to prove", "The defining risk can be translated into milestones that produce credible evidence."],
            ["03", "Valuable to integrate", "The technology changes a critical workflow or system—not merely a feature."],
            ["04", "Stronger with scale", "Deployment compounds know-how, data, integration depth, or manufacturing advantage."],
          ].map(([number, title, text]) => (
            <article className="pattern-card reveal" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p><i aria-hidden="true" /></article>
          ))}
        </div>
      </section>

      <section className="inner-cta companies-inner-cta">
        <p className="eyebrow reveal">THE NEXT COMPANY WILL NOT LOOK LIKE THE LAST ONE</p>
        <h2 className="reveal">Building something<br /><em>foundational?</em></h2>
        <a className="reveal" href="mailto:info@qfund.io?subject=A%20foundational%20company">Start a conversation <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
