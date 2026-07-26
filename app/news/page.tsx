import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { formatNewsDate, newsItems } from "../newsData";

export const metadata: Metadata = {
  title: "News and Activity | qFund",
  description:
    "Follow qFund activity across New York, Miami, Korea, and Japan, connecting Israeli-related Deep Tech founders with investors and strategic partners.",
  alternates: { canonical: "/news/" },
  openGraph: {
    title: "News and Activity | qFund",
    description: "Follow qFund activity across New York, Miami, Korea, and Japan, connecting Israeli-related Deep Tech founders with investors and strategic partners.",
    url: "/news/",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "News and Activity | qFund",
    description: "Follow qFund activity across New York, Miami, Korea, and Japan, connecting Israeli-related Deep Tech founders with investors and strategic partners.",
    images: ["/og.png"],
  },
};

export default function NewsPage() {
  return (
    <InnerPageShell active="news">
      <section className="inner-hero companies-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="company-constellation" aria-hidden="true">
          <span className="constellation-line line-a" /><span className="constellation-line line-b" /><span className="constellation-line line-c" />
          <i className="constellation-node cn-a" /><i className="constellation-node cn-b" /><i className="constellation-node cn-c" /><i className="constellation-node cn-d" />
        </div>
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/">← qFund</Link>
          <p className="eyebrow">NEWS AND ACTIVITY</p>
          <h1>qFund<br /><em>in motion.</em></h1>
          <p className="inner-hero-deck">
            Meetings, ecosystem activity, and venture delegations supporting Israeli-related Deep Tech founders.
          </p>
        </div>
      </section>

      <section className="inner-section directory-section section-light">
        <div className="section-index reveal"><span>01</span><p>Activity</p></div>
        <div className="company-directory">
          {newsItems.map((item, index) => (
            <article
              className="directory-card reveal is-filtered-in"
              style={{ "--company-index": index } as CSSProperties}
              key={`${item.date}-${item.title}`}
            >
              <div className="directory-visual">
                <span className="directory-grid" aria-hidden="true" />
                <span className="directory-scan" aria-hidden="true" />
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <small>{item.tag.toUpperCase()}</small>
              </div>
              <div className="directory-copy">
                <div><span>{item.tag}</span><span>{formatNewsDate(item.date).toUpperCase()}</span></div>
                <h2>{item.title}</h2>
                <p>{item.blurb}</p>
              </div>
              <span className="directory-status"><i /> {formatNewsDate(item.date).toUpperCase()}</span>
            </article>
          ))}
        </div>
      </section>
    </InnerPageShell>
  );
}
