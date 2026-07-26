import type { Metadata } from "next";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import CompaniesExperience from "./CompaniesExperience";

export const metadata: Metadata = {
  title: "Portfolio Companies | qFund",
  description:
    "Our portfolio spans thermal management, defense, satellite communications, quantum computing, cybersecurity, laser detection, and particle acceleration.",
  alternates: { canonical: "/companies/" },
  openGraph: {
    title: "Portfolio Companies | qFund",
    description: "Our portfolio spans thermal management, defense, satellite communications, quantum computing, cybersecurity, laser detection, and particle acceleration.",
    url: "/companies/",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Companies | qFund",
    description: "Our portfolio spans thermal management, defense, satellite communications, quantum computing, cybersecurity, laser detection, and particle acceleration.",
    images: ["/og.png"],
  },
};

const portfolioProfile = [
  ["01", "Portfolio composition", "Hardware and hardware-enabling software make up 90% of our portfolio."],
  ["02", "Portfolio founders", "Our founders are academic experts, alumni of elite technological units, and industry leaders."],
  ["03", "Critical challenges", "The portfolio spans thermal management, defense, satellite communications, quantum computing, cybersecurity, laser detection, and particle acceleration."],
  ["04", "Named companies", "10 Israeli-related Deep Tech companies are represented in the portfolio."],
] as const;

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
          <Link className="back-link" href="/#portfolio">← qFund portfolio</Link>
          <p className="eyebrow">PORTFOLIO COMPANIES</p>
          <h1>Real Deep Tech<br /><em>companies.</em></h1>
          <p className="inner-hero-deck">
            Companies solving critical challenges in thermal management, defense, satellite communications, quantum computing, cybersecurity, laser detection, and particle acceleration.
          </p>
        </div>
        <div className="inner-hero-meta"><span>NAMED PORTFOLIO</span><span>FILTER BY FIELD ↓</span></div>
      </section>

      <section className="inner-section directory-section section-light">
        <div className="section-index reveal"><span>01</span><p>Company directory</p></div>
        <CompaniesExperience />
      </section>

      <section className="inner-section portfolio-pattern section-sage">
        <div className="section-index reveal"><span>02</span><p>Portfolio profile</p></div>
        <div className="pattern-heading reveal">
          <p className="eyebrow dark">PORTFOLIO PROFILE</p>
          <h2>Deep Tech founders solving critical challenges.</h2>
        </div>
        <div className="pattern-grid">
          {portfolioProfile.map(([number, title, text]) => (
            <article className="pattern-card reveal" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p><i aria-hidden="true" />
            </article>
          ))}
        </div>
        <Link className="text-link route-link reveal" href="/founders/">Meet the people behind the portfolio <span>↗</span></Link>
      </section>

      <section className="inner-cta companies-inner-cta">
        <p className="eyebrow reveal">EARLY-STAGE · SEED TO SERIES A</p>
        <h2 className="reveal">Backing Israeli-related<br /><em>Deep Tech startups.</em></h2>
        <a className="reveal" href="mailto:info@qfund.io">info@qfund.io <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
