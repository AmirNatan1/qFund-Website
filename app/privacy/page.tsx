import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Notice | q fund",
  description: "How q fund collects, uses, shares, and protects personal information through qfund.io.",
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Your information"
      title="Privacy Notice"
      summary="This notice explains how q fund handles personal information when you visit qfund.io, contact us, or submit a startup introduction."
    >
      <section id="who-we-are">
        <h2>1. Who we are</h2>
        <p>
          q fund is an early-stage venture capital firm based at Arik Einstein 3, Herzliya 4659071,
          Israel. q fund is responsible for the personal information described in this notice.
          Privacy questions and requests can be sent to <a href="mailto:info@qfund.io">info@qfund.io</a>.
        </p>
      </section>

      <section id="information-we-collect">
        <h2>2. Information we collect</h2>
        <p>We may collect the following categories of information:</p>
        <ul>
          <li><strong>Information you provide:</strong> your name, email address, company, funding stage, message, and any other information you choose to include when you contact us.</li>
          <li><strong>Correspondence:</strong> emails, follow-up messages, meeting notes, and related business communications.</li>
          <li><strong>Technical information:</strong> internet protocol address, browser and device information, requested pages, referring page, timestamps, and security or diagnostic logs processed by our hosting and security providers.</li>
        </ul>
        <p>
          Please do not send sensitive personal information, trade secrets, or personal information about
          another person unless it is necessary and you are authorised to provide it.
        </p>
      </section>

      <section id="why-we-use-it">
        <h2>3. Why we use information</h2>
        <p>We use personal information only where relevant to:</p>
        <ul>
          <li>receive, evaluate, and respond to enquiries and startup introductions;</li>
          <li>communicate about a possible investment or business relationship;</li>
          <li>operate, secure, troubleshoot, and improve the website;</li>
          <li>maintain appropriate business records and protect our legal rights; and</li>
          <li>comply with law, regulation, court orders, or lawful requests.</li>
        </ul>
      </section>

      <section id="providing-information">
        <h2>4. Is providing information required?</h2>
        <p>
          You are not legally required to provide information through the website. If you do not provide the
          fields marked as required, we cannot submit, assess, or respond to your enquiry through the form.
          Submitting an enquiry does not guarantee a response, meeting, review, or investment.
        </p>
      </section>

      <section id="sharing">
        <h2>5. Who receives information</h2>
        <p>
          Access is limited to q fund personnel and advisers who need it for the purposes above. We also use
          service providers that process information on our behalf, including Cloudflare for website hosting,
          delivery, and security; Resend for transmitting contact-form emails; and our email and IT providers.
          We may also disclose information to professional advisers, competent authorities where required by
          law, or a successor in connection with a genuine reorganisation, financing, merger, or transfer of our
          business, subject to appropriate safeguards.
        </p>
      </section>

      <section id="international-transfers">
        <h2>6. International processing</h2>
        <p>
          Some providers process information outside Israel, including in the United States and other countries
          where they or their subprocessors operate. Where applicable, we use contractual and organisational
          measures intended to protect information transferred internationally.
        </p>
      </section>

      <section id="cookies">
        <h2>7. Cookies and similar technologies</h2>
        <p>
          qfund.io does not currently use advertising or audience-measurement cookies and does not set its own
          persistent cookie to identify or track visitors. Our hosting and security provider may use strictly
          necessary technologies to deliver traffic, balance load, prevent abuse, or maintain security. You can
          control or delete browser data through your browser settings. If we introduce non-essential analytics
          or advertising technologies, we will update this notice and request consent where required.
        </p>
      </section>

      <section id="retention">
        <h2>8. How long we keep information</h2>
        <p>
          The website does not create a separate database of contact-form submissions. A submission is
          transmitted to q fund by email. We retain correspondence for as long as reasonably needed to evaluate
          and respond to the enquiry, manage a possible or existing business relationship, maintain appropriate
          records, resolve disputes, and meet legal obligations. Our transmission and infrastructure providers
          may retain limited message or log data for their standard service and security periods. We periodically
          review information and delete or restrict it when it is no longer needed.
        </p>
      </section>

      <section id="rights">
        <h2>9. Your rights</h2>
        <p>
          Subject to applicable law, you may ask whether we hold personal information about you, request access
          to it, or ask us to correct information that is incomplete, unclear, or inaccurate. Other rights, such
          as deletion, restriction, objection, or withdrawal of consent, may apply depending on your location and
          the circumstances. Send a request to <a href="mailto:info@qfund.io">info@qfund.io</a>. We may ask for
          reasonable information to verify your identity before acting on a request.
        </p>
      </section>

      <section id="security">
        <h2>10. Security</h2>
        <p>
          We use reasonable technical and organisational measures designed to protect personal information and
          limit access to people who need it. No internet transmission or storage system can be guaranteed to be
          completely secure, so please use care when deciding what to send through the form.
        </p>
      </section>

      <section id="other-sites">
        <h2>11. Other sites and children</h2>
        <p>
          This website links to portfolio companies, LinkedIn, news sources, and other third-party sites. Their
          privacy practices are governed by their own notices. qfund.io is intended for business audiences and
          is not directed to children under 18. If you believe a child has provided information to us, please
          contact us so we can address it.
        </p>
      </section>

      <section id="changes">
        <h2>12. Changes to this notice</h2>
        <p>
          We may update this notice when our practices, providers, or legal obligations change. The date at the
          top shows when it was last revised. Material changes will be presented appropriately on the website.
        </p>
      </section>
    </LegalPage>
  );
}
