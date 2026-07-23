"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import BrandMark from "./BrandMark";

type InnerPageShellProps = {
  active: "thesis" | "companies" | "founders" | "notes";
  children: ReactNode;
};

const routes = [
  ["Thesis", "/thesis/", "thesis"],
  ["Companies", "/companies/", "companies"],
  ["Founders", "/founders/", "founders"],
  ["Field notes", "/field-notes/", "notes"],
] as const;

export default function InnerPageShell({ active, children }: InnerPageShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5%" },
    );

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        root.style.setProperty("--page-progress", String(window.scrollY / max));
        frame = 0;
      });
    };

    const onPointer = (event: PointerEvent) => {
      root.style.setProperty("--mx", event.clientX + "px");
      root.style.setProperty("--my", event.clientY + "px");
      if (!reduced && cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    onScroll();

    return () => {
      window.cancelAnimationFrame(frame);
      revealObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <main className="inner-site is-ready">
      <a className="skip-link" href="#page-content">Skip to content</a>
      <div className="cursor" ref={cursorRef} aria-hidden="true"><span /></div>
      <div className="scroll-progress" aria-hidden="true" />

      <header className="nav-shell inner-nav">
        <Link href="/" className="nav-logo" aria-label="qFund home"><BrandMark /></Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {routes.map(([label, href, key]) => (
            <Link href={href} className={active === key ? "is-active" : ""} aria-current={active === key ? "page" : undefined} key={key}>{label}</Link>
          ))}
        </nav>
        <a className="nav-cta" href="mailto:info@qfund.io" data-magnetic>
          <span>Start a conversation</span><span aria-hidden="true">↗</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span /><span />
        </button>
      </header>

      <div className={menuOpen ? "mobile-menu inner-mobile-menu is-open" : "mobile-menu inner-mobile-menu"}>
        <nav aria-label="Mobile navigation">
          {routes.map(([label, href, key], index) => (
            <Link href={href} aria-current={active === key ? "page" : undefined} key={key}>
              <span>0{index + 1}</span>{label}
            </Link>
          ))}
          <Link href="/"><span>05</span>Home</Link>
        </nav>
        <a href="mailto:info@qfund.io">info@qfund.io ↗</a>
      </div>

      <div id="page-content">{children}</div>

      <footer className="inner-footer">
        <Link href="/" aria-label="qFund home"><BrandMark /></Link>
        <p>Early-stage capital for the scientists and engineers building the deep future.</p>
        <div>
          <a href="mailto:info@qfund.io">info@qfund.io</a>
          <a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <span>Herzliya, Israel · © {new Date().getFullYear()} qFund</span>
        </div>
      </footer>
    </main>
  );
}
