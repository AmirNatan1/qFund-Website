import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Accessibility Statement | q fund",
  description: "q fund's commitment to an accessible and inclusive experience on qfund.io.",
  alternates: { canonical: "/accessibility/" },
};

export default function AccessibilityPage() {
  return (
    <LegalPage
      eyebrow="Access for everyone"
      title="Accessibility Statement"
      summary="q fund is committed to making its website usable by as many people as possible, including people who use assistive technologies."
    >
      <section>
        <h2>Our approach</h2>
        <p>
          We aim to provide an inclusive digital experience and to align qfund.io with the applicable Israeli
          accessibility requirements, Israeli Standard 5568, and the Web Content Accessibility Guidelines at
          level AA. Accessibility is an ongoing process: we review the site as content and technology change and
          work to correct barriers that we identify.
        </p>
      </section>

      <section>
        <h2>Measures available on this site</h2>
        <ul>
          <li>semantic headings, landmarks, and labelled navigation;</li>
          <li>a skip link that allows keyboard users to move directly to the main content;</li>
          <li>keyboard-operable links, menus, forms, and controls with visible focus treatment;</li>
          <li>text alternatives for meaningful images and text descriptions alongside visual industry content;</li>
          <li>labelled form fields, required-field indicators, and accessible validation messages;</li>
          <li>responsive layouts that support mobile screens and browser zoom; and</li>
          <li>reduced or removed animation when the device’s “reduce motion” preference is enabled.</li>
        </ul>
      </section>

      <section>
        <h2>Visual and interactive content</h2>
        <p>
          The site includes animated and three-dimensional visual elements. These elements are supplementary;
          the essential investment focus, portfolio, team, news, and contact information is also available as
          text and standard controls. Visitors who prefer less motion can enable the reduced-motion setting in
          their operating system or browser.
        </p>
      </section>

      <section>
        <h2>Known limitations</h2>
        <p>
          We are continuing to review the immersive visual sections across combinations of browsers and
          assistive technologies. A particular device, browser extension, or third-party page linked from this
          site may behave differently. This statement describes our current measures and is not a claim that
          every possible use case has been formally certified.
        </p>
      </section>

      <section>
        <h2>Contact us about accessibility</h2>
        <p>
          If you encounter an accessibility problem or need information in another format, email
          <a href="mailto:info@qfund.io"> info@qfund.io</a>. Please describe the page, the issue, the assistive
          technology or browser you were using if relevant, and the best way to reach you. We will review the
          request and make a reasonable effort to provide an accessible alternative and correct the issue.
        </p>
        <address>
          q fund<br />
          Arik Einstein 3<br />
          Herzliya 4659071, Israel
        </address>
      </section>
    </LegalPage>
  );
}
