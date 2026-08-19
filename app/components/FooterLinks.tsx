import Link from "next/link";

export default function FooterLinks() {
  return (
    <div className="qf-footer-links">
      <a href="mailto:info@qfund.io">info@qfund.io</a>
      <a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a>
      <Link href="/privacy/">Privacy</Link>
      <Link href="/accessibility/">Accessibility</Link>
      <Link href="/terms/">Terms</Link>
      <span>© {new Date().getFullYear()} q fund</span>
    </div>
  );
}
