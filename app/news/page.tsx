import type { Metadata } from "next";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import NewsArtwork from "../components/NewsArtwork";
import { newsItems } from "../newsData";

export const metadata: Metadata = {
  title: "News and Activity | qFund",
  description:
    "Follow qFund activity connecting Deep Tech startups with investors and strategic partners.",
  alternates: { canonical: "/news/" },
  openGraph: {
    title: "News and Activity | qFund",
    description: "Follow qFund activity connecting Deep Tech startups with investors and strategic partners.",
    url: "/news/",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "News and Activity | qFund",
    description: "Follow qFund activity connecting Deep Tech startups with investors and strategic partners.",
    images: ["/og.png"],
  },
};

export default function NewsPage() {
  return (
    <InnerPageShell active="news">
      <section className="qf-news-archive-hero" aria-labelledby="news-archive-title">
        <span className="qf-archive-orbit" aria-hidden="true"><i /><i /><i /></span>
        <div className="qf-reveal is-visible">
          <p className="qf-kicker">NEWS AND ACTIVITY</p>
          <h1 id="news-archive-title">qFund <em>in motion.</em></h1>
          <Link className="qf-text-link" href="/#news">← Latest on the homepage</Link>
        </div>
      </section>
      <section className="qf-news-archive" aria-label="All qFund news">
        {newsItems.map((item, index) => (
          <article className="qf-news-archive-card qf-reveal" key={`${item.date}-${item.title}`}>
            <Link className="qf-news-archive-link qf-news-archive-link--title-only" href={`/news/${item.slug}/`}>
              <NewsArtwork item={item} index={index} priority={index < 2} />
              <div className="qf-news-archive-copy">
                <h2>{item.title}</h2>
              </div>
            </Link>
          </article>
        ))}
      </section>
    </InnerPageShell>
  );
}
