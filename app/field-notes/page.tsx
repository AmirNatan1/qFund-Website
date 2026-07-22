import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import { fieldNotes } from "../siteData";

export const metadata: Metadata = {
  title: "Field Notes | qFund",
  description: "qFund working theses on the technologies and markets shaping the next industrial cycle.",
};

export default function FieldNotesPage() {
  return (
    <InnerPageShell active="notes">
      <section className="inner-hero notes-hero">
        <div className="inner-hero-grid" aria-hidden="true" />
        <div className="notes-wave" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => <i style={{ "--wave-index": index } as CSSProperties} key={index} />)}
        </div>
        <div className="inner-hero-copy reveal is-visible">
          <Link className="back-link" href="/#insights">← Back to signals</Link>
          <p className="eyebrow">FIELD NOTES / QF–03</p>
          <h1>Questions worth pursuing<br /><em>before consensus.</em></h1>
          <p className="inner-hero-deck">These are working theses—not finished answers. A live map of the technical shifts we believe are becoming investable.</p>
        </div>
        <div className="inner-hero-meta"><span>RESEARCH AGENDA</span><span>06 ACTIVE SIGNALS ↓</span></div>
      </section>

      <section className="inner-section notes-index section-dark">
        <div className="section-index reveal"><span>01</span><p>Active signals</p></div>
        <div className="notes-intro reveal">
          <h2>Signals become useful when they change where you look.</h2>
          <p>We follow shifts in technical capability, system constraints, and market readiness. The overlap—not the headline—is often where a new company can form.</p>
        </div>
        <div className="notes-grid">
          {fieldNotes.map((note, index) => (
            <article className="note-card reveal" id={note.code.toLowerCase().replace("/", "-")} key={note.code} style={{ "--note-index": index } as CSSProperties}>
              <div className="note-top"><span>{note.code}</span><small>WORKING THESIS</small><i aria-hidden="true" /></div>
              <p className="note-category">{note.category}</p>
              <h2>{note.title}</h2>
              <p>{note.summary}</p>
              <div className="note-watch"><span>Signals to watch</span><p>{note.watch}</p></div>
              <a href={`mailto:info@qfund.io?subject=${encodeURIComponent(`Field note ${note.code}: ${note.title}`)}`}>Compare notes <span>↗</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="inner-section research-method section-light">
        <div className="section-index reveal"><span>02</span><p>How we research</p></div>
        <div className="research-method-grid">
          <div className="reveal"><p className="eyebrow dark">A CONVERSATION, NOT A CONTENT CALENDAR</p><h2>Research is how we become a better first meeting.</h2></div>
          <div className="research-cycles">
            {[
              ["01", "Map the constraint", "Understand what has kept a system expensive, fragile, slow, or inaccessible."],
              ["02", "Find the discontinuity", "Track the technical change that could invalidate the old trade-off."],
              ["03", "Test the pull", "Speak with builders and buyers close enough to see the transition early."],
            ].map(([number, title, text]) => (
              <article className="research-cycle reveal" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="inner-cta notes-inner-cta">
        <div className="note-signal-field" aria-hidden="true"><span /><span /><span /><span /></div>
        <p className="eyebrow reveal">FOUND A SIGNAL WE SHOULD BE FOLLOWING?</p>
        <h2 className="reveal">The best research<br /><em>starts in dialogue.</em></h2>
        <a className="reveal" href="mailto:info@qfund.io?subject=A%20signal%20for%20qFund">Compare notes <span>↗</span></a>
      </section>
    </InnerPageShell>
  );
}
