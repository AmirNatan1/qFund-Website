import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use | q fund",
  description: "Terms governing access to and use of qfund.io.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Website terms"
      title="Terms of Use"
      summary="These terms govern access to and use of qfund.io. By using the website, you agree to use it lawfully and in accordance with these terms."
    >
      <section>
        <h2>1. About this website</h2>
        <p>
          qfund.io is operated by q fund, an early-stage venture capital firm based in Herzliya, Israel. The
          website provides general information about q fund, its investment focus, team, portfolio, and activity.
          Questions about these terms can be sent to <a href="mailto:info@qfund.io">info@qfund.io</a>.
        </p>
      </section>

      <section>
        <h2>2. Information only — no offer or advice</h2>
        <p>
          Website content is provided for general informational purposes. Nothing on this website constitutes
          investment, financial, legal, tax, accounting, or other professional advice; an offer or solicitation
          to buy or sell a security or interest in any fund; an invitation to invest; or a recommendation or
          commitment by q fund. Any investment activity is conducted only through definitive documents and in
          accordance with applicable law. You should obtain independent advice before making a decision based on
          information relevant to an investment or business matter.
        </p>
      </section>

      <section>
        <h2>3. Startup introductions</h2>
        <p>
          Sending an enquiry or startup introduction does not create a confidential, fiduciary, advisory,
          partnership, agency, or other relationship; oblige q fund to review or respond; or constitute a promise
          or commitment to invest. Unless q fund has first agreed otherwise in writing, do not submit trade
          secrets, highly sensitive personal data, or information that you are not authorised to disclose.
        </p>
        <p>
          q fund evaluates many companies, including businesses that may have similar ideas, products, markets,
          or technologies. Receiving your submission does not restrict q fund from evaluating, investing in, or
          working with another business, provided that q fund complies with obligations it has expressly accepted.
        </p>
      </section>

      <section>
        <h2>4. Accuracy and forward-looking information</h2>
        <p>
          We aim to keep the website accurate, but information can become outdated and may contain errors or
          omissions. Company stages, portfolio information, market descriptions, and third-party news may change
          without notice. Statements about plans, markets, opportunities, or future events are inherently
          uncertain and are not guarantees of results. You should verify information before relying on it.
        </p>
      </section>

      <section>
        <h2>5. Intellectual property</h2>
        <p>
          Unless stated otherwise, q fund owns or is licensed to use the website’s design, text, graphics,
          photographs, branding, and other content. You may view and make a reasonable copy of website content
          for personal, internal, and non-commercial reference. You may not reproduce, modify, distribute,
          scrape, publish, sell, or commercially exploit website content without permission. Portfolio company
          names, logos, and other third-party marks belong to their respective owners.
        </p>
      </section>

      <section>
        <h2>6. Acceptable use</h2>
        <p>
          You may not misuse the website, interfere with its operation or security, attempt unauthorised access,
          introduce malicious code, collect information through automated means in a manner that burdens the
          service, impersonate another person, or use the site in violation of law or another person’s rights.
        </p>
      </section>

      <section>
        <h2>7. Third-party sites</h2>
        <p>
          Links to portfolio companies, LinkedIn, publications, and other third-party sites are provided for
          convenience and context. q fund does not control those sites and is not responsible for their content,
          availability, security, or privacy practices. A link does not by itself constitute an endorsement.
        </p>
      </section>

      <section>
        <h2>8. Availability and responsibility</h2>
        <p>
          The website is provided on an “as available” basis. To the fullest extent permitted by law, q fund does
          not promise that the site will always be uninterrupted, error-free, or free of harmful components. q
          fund is not responsible for indirect, incidental, or consequential loss arising solely from use of or
          inability to use this informational website. Nothing in these terms excludes or limits responsibility
          that cannot lawfully be excluded or limited.
        </p>
      </section>

      <section>
        <h2>9. Privacy</h2>
        <p>
          Our <a href="/privacy/">Privacy Notice</a> explains how we handle personal information collected
          through the website and forms part of these terms.
        </p>
      </section>

      <section>
        <h2>10. Governing law and changes</h2>
        <p>
          These terms are governed by the laws of the State of Israel, without prejudice to rights that apply
          mandatorily under another law. Disputes relating to the website are subject to the competent courts in
          Israel. We may update these terms when the website, our practices, or legal requirements change. The
          revised terms apply from the date shown at the top of this page.
        </p>
      </section>
    </LegalPage>
  );
}
