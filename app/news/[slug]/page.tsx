import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InnerPageShell from "../../components/InnerPageShell";
import { newsItems } from "../../newsData";

type NewsArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return newsItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = newsItems.find((candidate) => candidate.slug === slug);
  if (!item) return {};

  return {
    title: `${item.title} | qFund`,
    description: `External coverage and source links for ${item.title}.`,
    alternates: { canonical: `/news/${item.slug}/` },
    openGraph: {
      title: item.title,
      description: `External coverage and source links for ${item.title}.`,
      url: `/news/${item.slug}/`,
      type: "website",
      images: [],
    },
    twitter: {
      card: "summary",
      title: item.title,
      description: `External coverage and source links for ${item.title}.`,
      images: [],
    },
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const item = newsItems.find((candidate) => candidate.slug === slug);
  if (!item) notFound();

  return (
    <InnerPageShell active="news">
      <section className="qf-news-article" aria-labelledby="coverage-title">
        <header className="qf-news-article-header qf-reveal is-visible">
          <Link className="qf-news-article-back" href="/news/">← All qFund news</Link>
          <h1 id="coverage-title">{item.title}</h1>
        </header>

        <section className="qf-news-sources qf-reveal is-visible" aria-labelledby="source-links-title">
          <h2 id="source-links-title">Read the coverage</h2>
          <ul>
            {item.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  <span>{source.outlet}</span>
                  <strong>{source.title}</strong>
                  <i aria-hidden="true">↗</i>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </InnerPageShell>
  );
}
