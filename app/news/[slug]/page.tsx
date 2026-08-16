import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import InnerPageShell from "../../components/InnerPageShell";
import { formatNewsDate, newsItems } from "../../newsData";

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
    description: item.blurb,
    alternates: { canonical: `/news/${item.slug}/` },
    openGraph: {
      title: item.title,
      description: item.blurb,
      url: `/news/${item.slug}/`,
      type: "article",
      publishedTime: item.date,
      images: [{ url: item.image, alt: item.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.blurb,
      images: [item.image],
    },
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params;
  const itemIndex = newsItems.findIndex((candidate) => candidate.slug === slug);
  const item = newsItems[itemIndex];
  if (!item) notFound();
  const nextItem = newsItems[(itemIndex + 1) % newsItems.length];

  return (
    <InnerPageShell active="news">
      <article className="qf-news-article">
        <header className="qf-news-article-header qf-reveal is-visible">
          <Link className="qf-news-article-back" href="/news/">← All qFund news</Link>
          <div className="qf-news-article-meta">
            <span>{item.tag}</span>
            <time dateTime={item.date}>{formatNewsDate(item.date)}</time>
          </div>
          <h1>{item.title}</h1>
          <p>{item.blurb}</p>
        </header>

        <figure className="qf-news-article-image qf-reveal is-visible">
          <Image
            src={item.image}
            alt={item.imageAlt}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 82vw"
          />
          <figcaption>{item.company} in the qFund portfolio</figcaption>
        </figure>

        <div className="qf-news-article-body">
          {item.body.map((paragraph, index) => (
            <p className="qf-reveal" key={`${item.slug}-${index}`}>{paragraph}</p>
          ))}
        </div>

        <nav className="qf-news-article-next" aria-label="Continue reading">
          <span>CONTINUE READING</span>
          <Link href={`/news/${nextItem.slug}/`}>
            <small>{nextItem.company}</small>
            <strong>{nextItem.title}</strong>
            <i aria-hidden="true">→</i>
          </Link>
        </nav>
      </article>
    </InnerPageShell>
  );
}
