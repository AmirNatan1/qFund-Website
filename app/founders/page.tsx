import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { portfolioFounders, type PortfolioFounder } from "../portfolioFounders";

export const metadata: Metadata = {
  title: "Portfolio Founders | qFund",
  description:
    "Meet our portfolio founders: academic experts, alumni of elite technological units, and industry leaders building qFund companies across Deep Tech.",
  alternates: { canonical: "/founders/" },
  openGraph: {
    title: "Portfolio Founders | qFund",
    description: "Meet our portfolio founders: academic experts, alumni of elite technological units, and industry leaders building qFund companies across Deep Tech.",
    url: "/founders/",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio Founders | qFund",
    description: "Meet our portfolio founders: academic experts, alumni of elite technological units, and industry leaders building qFund companies across Deep Tech.",
    images: ["/og.png"],
  },
};

const composition = [
  ["01", "ACADEMIA", "Professors and research scientists"],
  ["02", "ELITE UNITS", "Alumni of Israel's elite technological units"],
  ["03", "INDUSTRY", "Operators from Intel, Mobileye, Rafael, Elbit, and Check Point"],
] as const;

const companies = [...new Set(portfolioFounders.map((founder) => founder.company))];

function initials(name: string) {
  return name
    .replace(/^Prof\.\s+/, "")
    .replace(/,\s*PhD$/, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("");
}

function FounderPortrait({ founder, index }: { founder: PortfolioFounder; index: number }) {
  const content = (
    <>
      <span className="portrait-grid" aria-hidden="true" />
      {founder.headshot ? (
        <Image
          src={founder.headshot}
          alt={`${founder.name}, ${founder.role} at ${founder.company}`}
          width={460}
          height={460}
          sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
      ) : (
        <strong aria-hidden="true">{initials(founder.name)}</strong>
      )}
      {founder.linkedin ? <small>{String(index + 1).padStart(2, "0")} · LINKEDIN ↗</small> : null}
    </>
  );

  if (!founder.linkedin) {
    return <div className="team-portrait">{content}</div>;
  }

  return (
    <a
      className="team-portrait"
      href={founder.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${founder.name} on LinkedIn`}
    >
      {content}
    </a>
  );
}

export default function FoundersPage() {
  return (
    <InnerPageShell active="founders">
      <section className="inner-hero founders-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/">← qFund</Link>
          <p className="eyebrow">PORTFOLIO FOUNDERS</p>
          <h1>The people behind<br /><em>the portfolio.</em></h1>
          <p className="inner-hero-deck">
            Academic experts, alumni of elite technological units, and industry leaders.
          </p>
        </div>
      </section>

      <section className="inner-section portfolio-pattern section-light">
        <div className="section-index reveal"><span>01</span><p>Founder composition</p></div>
        <div className="pattern-grid three-up">
          {composition.map(([number, label, value]) => (
            <article className="pattern-card reveal" key={number}>
              <span>{number} · {label}</span>
              <h3>{value}</h3>
              <i aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="team section-sage founders-roster">
        <div className="section-index reveal"><span>02</span><p>Portfolio founder roster</p></div>
        <div className="team-heading reveal">
          <h2>Meet the<br />founders.</h2>
          <p>Most investors read a pitch deck and make a bet. We don&apos;t. We back founders who are the leading experts on the specific problem they have chosen — and this is who they are.</p>
        </div>

        {companies.map((company) => {
          const founders = portfolioFounders.filter((founder) => founder.company === company);
          return (
            <section className="inner-section founder-company-section" aria-labelledby={`founders-${company.toLowerCase().replace(/\s+/g, "-")}`} key={company}>
              <div className="pattern-heading founder-company-heading reveal">
                <p className="eyebrow dark">PORTFOLIO COMPANY</p>
                <h2 id={`founders-${company.toLowerCase().replace(/\s+/g, "-")}`}>{company}</h2>
              </div>
              <div className="team-grid founder-roster-grid" data-founder-count={founders.length}>
                {founders.map((founder) => {
                  const index = portfolioFounders.indexOf(founder);
                  return (
                    <article className="team-card reveal" data-tilt key={founder.name}>
                      <FounderPortrait founder={founder} index={index} />
                      <div className="team-info">
                        <h3>{founder.name}</h3>
                        <p>{founder.role}</p>
                        {founder.bio ? <span>{founder.bio}</span> : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </section>

      <section className="inner-cta founders-inner-cta">
        <div className="founder-cta-beam" aria-hidden="true"><span /><span /><i /></div>
        <p className="eyebrow reveal">BACKING DEEP TECH FOUNDERS</p>
        <h2 className="reveal">Building an Israeli-related<br /><em>Deep Tech company?</em></h2>
        <a className="reveal" href="mailto:info@qfund.io">info@qfund.io <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
