import type { Metadata } from "next";
import Link from "next/link";
import InnerPageShell from "../components/InnerPageShell";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact qFund | Deep Tech Venture Capital",
  description:
    "Contact our early-stage venture capital team at Arik Einstein 3, Herzliya, Israel, about Israeli-related Deep Tech companies from Seed to Series A.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    title: "Contact qFund | Deep Tech Venture Capital",
    description: "Contact our early-stage venture capital team at Arik Einstein 3, Herzliya, Israel, about Israeli-related Deep Tech companies from Seed to Series A.",
    url: "/contact/",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact qFund | Deep Tech Venture Capital",
    description: "Contact our early-stage venture capital team at Arik Einstein 3, Herzliya, Israel, about Israeli-related Deep Tech companies from Seed to Series A.",
    images: ["/og.png"],
  },
};

export default function ContactPage() {
  return (
    <InnerPageShell active="contact">
      <section className="contact-route-hero">
        <div className="contact-route-grid" aria-hidden="true" />
        <div className="contact-transmission" aria-hidden="true">
          <span className="transmission-ring transmission-ring-a" />
          <span className="transmission-ring transmission-ring-b" />
          <span className="transmission-ring transmission-ring-c" />
          <span className="transmission-ring transmission-ring-d" />
          <i className="transmission-sweep" />
          <b className="transmission-node node-a" />
          <b className="transmission-node node-b" />
          <b className="transmission-node node-c" />
          <strong><span /></strong>
          <small>CHANNEL OPEN</small>
        </div>

        <div className="contact-route-copy reveal is-visible">
          <Link className="back-link" href="/">← qFund</Link>
          <p className="eyebrow">CONTACT qFund</p>
          <h1>Begin the<br /><em>conversation.</em></h1>
          <p>
            We back Israeli-related startups developing core infrastructure,
            hardware, and enabling technologies.
          </p>
        </div>

        <div className="contact-route-meta">
          <span>ARIK EINSTEIN 3 · HERZLIYA, ISRAEL</span>
          <a href="mailto:info@qfund.io">info@qfund.io ↗</a>
        </div>
      </section>

      <section className="contact-route-body section-light">
        <div className="section-index reveal"><span>01</span><p>Founder introduction</p></div>
        <div className="contact-route-layout">
          <ContactForm />
          <aside className="contact-direct reveal">
            <p className="eyebrow dark">DIRECT CHANNELS</p>
            <div>
              <span>Email</span>
              <a href="mailto:info@qfund.io">info@qfund.io ↗</a>
            </div>
            <div>
              <span>LinkedIn</span>
              <a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">
                qFund ↗
              </a>
            </div>
            <div>
              <span>Office</span>
              <p>Arik Einstein 3<br />Herzliya, Israel</p>
            </div>
          </aside>
        </div>
      </section>
    </InnerPageShell>
  );
}
