import type { Metadata } from "next";
import InnerPageShell from "../components/InnerPageShell";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact qFund | Deep Tech Venture Capital",
  description:
    "Contact qFund in Herzliya about Deep Tech startups from Pre-seed to Series A.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    title: "Contact qFund | Deep Tech Venture Capital",
    description: "Contact qFund in Herzliya about Deep Tech startups from Pre-seed to Series A.",
    url: "/contact/",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact qFund | Deep Tech Venture Capital",
    description: "Contact qFund in Herzliya about Deep Tech startups from Pre-seed to Series A.",
    images: ["/og.png"],
  },
};

export default function ContactPage() {
  return (
    <InnerPageShell active="contact">
      <section className="qf-contact-page" aria-labelledby="contact-title">
        <span className="qf-contact-grid" aria-hidden="true" />
        <div className="qf-contact-intro qf-reveal is-visible">
          <h1 id="contact-title">Tell us what you are <em>building.</em></h1>
        </div>
        <div className="qf-contact-layout">
          <ContactForm />
          <aside className="qf-contact-direct qf-reveal">
            <span>Direct channels</span>
            <div><small>Email</small><a href="mailto:info@qfund.io">info@qfund.io ↗</a></div>
            <div><small>LinkedIn</small><a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">qFund ↗</a></div>
            <div><small>Office</small><p>Arik Einstein 3 · Herzliya, Israel</p></div>
          </aside>
        </div>
      </section>
    </InnerPageShell>
  );
}
