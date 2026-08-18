"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import BackToTop from "./BackToTop";
import BrandMark from "./BrandMark";

type InnerPageShellProps = {
  active: "news" | "contact";
  children: ReactNode;
};

export default function InnerPageShell({ active, children }: InnerPageShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let scrollFrame = 0;
    let pointerFrame = 0;

    const revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }),
      { threshold: 0.12, rootMargin: "0px 0px -5%" },
    );

    document.querySelectorAll(".qf-reveal").forEach((node) => revealObserver.observe(node));

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        root.style.setProperty("--page-progress", String(window.scrollY / max));
        scrollFrame = 0;
      });
    };

    const onPointer = (event: PointerEvent) => {
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        if (!reduced && cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
        }
        pointerFrame = 0;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    onScroll();

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.cancelAnimationFrame(pointerFrame);
      revealObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <main className="qf-inner" id="top">
      <a className="qf-skip-link" href="#page-content">Skip to content</a>
      <div className="qf-cursor" ref={cursorRef} aria-hidden="true"><span /></div>
      <div className="qf-progress" aria-hidden="true" />

      <header className="qf-header qf-inner-header">
        <Link className="qf-logo" href="/" aria-label="qFund home"><BrandMark /></Link>
        <Link className="qf-back-home" href="/">← Back to qFund</Link>
        <nav className="qf-header-actions" aria-label="Secondary navigation">
          <Link className={active === "news" ? "is-active" : ""} href="/news/">News</Link>
          <Link className={active === "contact" ? "qf-button qf-button-small is-active" : "qf-button qf-button-small"} href="/contact/">Contact qFund <span>↗</span></Link>
        </nav>
        <button
          className="qf-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        ><span /><span /></button>
      </header>

      <div className={menuOpen ? "qf-mobile-menu is-open" : "qf-mobile-menu"}>
        <nav aria-label="Mobile navigation">
          <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/news/" onClick={() => setMenuOpen(false)}>News</Link>
          <Link href="/contact/" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
      </div>

      <div id="page-content">{children}</div>

      <footer className="qf-footer-bar qf-inner-footer">
        <Link href="/" aria-label="qFund home"><BrandMark /></Link>
        <BackToTop />
        <div><a href="mailto:info@qfund.io">info@qfund.io</a><a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a><span>Arik Einstein 3 · Herzliya · © {new Date().getFullYear()} qFund</span></div>
      </footer>
    </main>
  );
}
