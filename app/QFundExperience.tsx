"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import BackToTop from "./components/BackToTop";
import BrandMark from "./components/BrandMark";
import FrontierField from "./components/FrontierField";
import IntroReveal from "./components/IntroReveal";
import NewsArtwork from "./components/NewsArtwork";
import IndustriesExperience from "./industries/IndustriesExperience";
import { formatNewsDate, newsItems } from "./newsData";
import { portfolio, team } from "./siteData";

const sections = [
  ["top", "About"],
  ["portfolio", "Portfolio"],
  ["team", "Team"],
  ["thesis", "Thesis"],
  ["news", "News"],
] as const;

function SectionRuler({ active }: { active: string }) {
  const goToSection = (id: string) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav className="qf-section-ruler" aria-label="Page sections">
      {sections.map(([id, label]) => (
        <button
          className={active === id ? "is-active" : ""}
          type="button"
          aria-label={`Go to ${label}`}
          aria-current={active === id ? "location" : undefined}
          onClick={() => goToSection(id)}
          key={id}
        >
          <i aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function QFundExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const cursorRef = useRef<HTMLDivElement>(null);
  const heroFieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scrollFrame = 0;
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5%" },
    );

    document.querySelectorAll(".qf-reveal").forEach((node) => revealObserver.observe(node));

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { threshold: [0.12, 0.3, 0.55], rootMargin: "-34% 0px -34%" },
    );

    sections.forEach(([id]) => {
      const node = document.getElementById(id);
      if (node) sectionObserver.observe(node);
    });

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        root.style.setProperty("--page-progress", String(window.scrollY / max));
        scrollFrame = 0;
      });
    };

    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        if (!reduced && cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
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
      sectionObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  const moveFutureField = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    event.currentTarget.style.setProperty("--field-shift-x", `${(x * 14).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--field-shift-y", `${(y * 12).toFixed(2)}px`);
    event.currentTarget.style.setProperty("--field-rotate-x", `${(y * -3).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--field-rotate-y", `${(x * 4).toFixed(2)}deg`);
  };

  const resetFutureField = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--field-shift-x", "0px");
    event.currentTarget.style.setProperty("--field-shift-y", "0px");
    event.currentTarget.style.setProperty("--field-rotate-x", "0deg");
    event.currentTarget.style.setProperty("--field-rotate-y", "0deg");
  };

  return (
    <main className="qf-site">
      <a className="qf-skip-link" href="#portfolio">Skip to content</a>
      <div className="qf-cursor" ref={cursorRef} aria-hidden="true"><span /></div>
      <div className="qf-progress" aria-hidden="true" />

      <header className="qf-header">
        <a className="qf-logo" href="#top" aria-label="qFund home"><BrandMark /></a>
        <SectionRuler active={activeSection} />
        <nav className="qf-header-actions" aria-label="Secondary navigation">
          <Link href="/news/">News</Link>
          <Link className="qf-button qf-button-small" href="/contact/">Contact qFund <span>↗</span></Link>
        </nav>
        <button
          className="qf-menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span /><span />
        </button>
      </header>

      <div className={menuOpen ? "qf-mobile-menu is-open" : "qf-mobile-menu"}>
        <nav aria-label="Mobile navigation">
          {sections.map(([id, label], index) => (
            <a href={`#${id}`} onClick={() => setMenuOpen(false)} key={id}>
              <span>{String(index).padStart(2, "0")}</span>{label}
            </a>
          ))}
          <Link href="/news/" onClick={() => setMenuOpen(false)}><span>05</span>All news</Link>
          <Link href="/contact/" onClick={() => setMenuOpen(false)}><span>06</span>Contact</Link>
        </nav>
      </div>

      <section
        className="qf-hero qf-scroll-section"
        id="top"
        data-qf-section
        aria-labelledby="qf-hero-title"
        onPointerMove={moveFutureField}
        onPointerLeave={resetFutureField}
      >
        <span className="qf-hero-grid" aria-hidden="true" />
        <div className="qf-hero-copy">
          <p className="qf-kicker qf-reveal is-visible"><span /> DEEP TECH VENTURE CAPITAL</p>
          <h1 id="qf-hero-title" className="qf-reveal is-visible">
            <span>Funding the</span>
            <span className="qf-serif">deep future</span>
            <span>of technology.</span>
          </h1>
          <p className="qf-hero-deck qf-reveal is-visible">
            qFund invests in startups developing core infrastructure, hardware, and enabling technologies across defense, energy, semiconductors, quantum computing, industrial systems, AI, and robotics.
          </p>
          <div className="qf-hero-actions qf-reveal is-visible">
            <Link className="qf-text-link" href="/contact/">Tell us what you are building <span>↗</span></Link>
          </div>
        </div>
        <div className="qf-hero-visual">
          <FrontierField
            elementRef={(node) => {
              heroFieldRef.current = node;
            }}
          />
        </div>
        <div className="qf-hero-foot">
          <span>HERZLIYA</span>
          <a href="#portfolio">SCROLL TO EXPLORE <i>↓</i></a>
        </div>
      </section>

      <section className="qf-portfolio qf-scroll-section" id="portfolio" data-qf-section aria-labelledby="portfolio-title">
        <div className="qf-section-label qf-reveal"><span>01</span><p>Our portfolio</p></div>
        <div className="qf-portfolio-heading qf-reveal">
          <p className="qf-kicker">ELEVEN STARTUPS · ONE DEEP-TECH PORTFOLIO</p>
          <h2 id="portfolio-title">Built around technologies with <em>consequence.</em></h2>
        </div>
        <div className="qf-portfolio-grid qf-reveal" aria-label="Portfolio companies">
          {portfolio.map((item) => (
            <a
              className="qf-portfolio-card"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.name}: ${item.description}`}
              style={{
                "--qf-portfolio-bg": item.background,
                "--qf-portfolio-logo-scale": item.logoScale ?? 1,
              } as CSSProperties}
              key={item.name}
            >
              <span className={`qf-portfolio-logo qf-portfolio-logo--${item.logoMode ?? "source"}`}>
                <img src={item.logo} alt={`${item.name} logo`} loading="lazy" />
              </span>
              <span className="qf-portfolio-description">
                <strong>{item.name}</strong>
                <span>{item.description}</span>
                <i aria-hidden="true">↗</i>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="qf-team qf-scroll-section" id="team" data-qf-section aria-labelledby="team-title">
        <div className="qf-section-label qf-reveal"><span>02</span><p>Investment team</p></div>
        <div className="qf-section-heading qf-reveal">
          <p className="qf-kicker">QFUND · HERZLIYA</p>
          <h2 id="team-title">Investment <em>team.</em></h2>
        </div>
        <div className="qf-team-grid">
          {team.map((member, index) => (
            <article className="qf-team-card qf-reveal" style={{ "--card-index": index } as CSSProperties} key={member.name}>
              <a className="qf-team-image" href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`}>
                <Image src={member.image} alt={member.name} fill sizes="(max-width: 720px) 100vw, 33vw" unoptimized />
                <span aria-hidden="true">LinkedIn ↗</span>
              </a>
              <div><span>{member.role}</span><h3>{member.name}</h3></div>
            </article>
          ))}
        </div>
      </section>

      <IndustriesExperience />

      <section className="qf-news qf-scroll-section" id="news" data-qf-section aria-labelledby="news-title">
        <div className="qf-section-label qf-reveal"><span>04</span><p>News</p></div>
        <div className="qf-news-heading qf-reveal">
          <div><p className="qf-kicker">LATEST ACTIVITY</p><h2 id="news-title">qFund <em>in motion.</em></h2></div>
          <Link className="qf-text-link" href="/news/">View all news <span>↗</span></Link>
        </div>
        <div className="qf-news-grid">
          {newsItems.slice(0, 3).map((item, index) => (
            <Link className="qf-news-card qf-reveal" href={`/news/${item.slug}/`} key={`${item.date}-${item.title}`}>
              <NewsArtwork item={item} index={index} />
              <div><span>{item.tag}</span><time dateTime={item.date}>{formatNewsDate(item.date)}</time></div>
              <h3>{item.title}</h3>
              <p>{item.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="qf-footer">
        <div className="qf-footer-lead">
          <p className="qf-kicker">START A CONVERSATION</p>
          <h2>Tell us what you are <em>building.</em></h2>
          <Link className="qf-button" href="/contact/">Contact qFund <span>↗</span></Link>
        </div>
        <div className="qf-footer-bar">
          <a href="#top" aria-label="qFund home"><BrandMark /></a>
          <BackToTop />
          <div><a href="mailto:info@qfund.io">info@qfund.io</a><a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a><span>Arik Einstein 3 · Herzliya · © {new Date().getFullYear()} qFund</span></div>
        </div>
      </footer>

      <IntroReveal targetRef={heroFieldRef} />
    </main>
  );
}
