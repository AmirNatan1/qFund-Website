import type { ReactNode } from "react";
import InnerPageShell from "./InnerPageShell";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export default function LegalPage({ eyebrow, title, summary, children }: LegalPageProps) {
  return (
    <InnerPageShell active={null}>
      <article className="qf-legal-page">
        <header className="qf-legal-hero">
          <p className="qf-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{summary}</p>
          <time dateTime="2026-08-19">Last updated 19 August 2026</time>
        </header>
        <div className="qf-legal-content">{children}</div>
      </article>
    </InnerPageShell>
  );
}
