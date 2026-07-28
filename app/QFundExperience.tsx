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
import NewsArtwork from "./components/NewsArtwork";
import { formatNewsDate, newsItems } from "./newsData";
import { evaluationPillars, focusAreas, portfolio, team, valueCreation } from "./siteData";

const sections = [
  ["top", "Home"],
  ["about", "About"],
  ["industries", "Industries"],
  ["approach", "Our approach"],
  ["portfolio", "Portfolio"],
  ["team", "Team"],
  ["news", "News"],
] as const;

function imagePath(title: string) {
  return `/focus/${title.toLowerCase().replaceAll(" ", "-")}.webp`;
}

function SectionRail({ active }: { active: string }) {
  const goToSection = (id: string) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <nav className="qf-section-rail" aria-label="Page sections">
      {sections.map(([id, label], index) => (
        <button
          className={active === id ? "is-active" : ""}
          type="button"
          aria-label={`Go to ${label}`}
          aria-current={active === id ? "location" : undefined}
          onClick={() => goToSection(id)}
          key={id}
        >
          <span>{label}</span>
          <i aria-hidden="true" />
          <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
        </button>
      ))}
    </nav>
  );
}

function FutureField() {
  return (
    <div className="qf-future-field" aria-hidden="true">
      <span className="qf-field-grid" />
      <span className="qf-field-axis axis-x" />
      <span className="qf-field-axis axis-y" />
      <span className="qf-field-orbit orbit-one"><i /></span>
      <span className="qf-field-orbit orbit-two"><i /></span>
      <span className="qf-field-orbit orbit-three"><i /></span>
      <span className="qf-field-wave wave-one" />
      <span className="qf-field-wave wave-two" />
      <span className="qf-field-core"><i /><b /></span>
      <span className="qf-field-caption">PRE-SEED</span>
      <span className="qf-field-caption caption-end">SERIES A</span>
    </div>
  );
}

export default function QFundExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [activeApproach, setActiveApproach] = useState(0);
  const [activeCompany, setActiveCompany] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);

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
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
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

  const approach = evaluationPillars[activeApproach];
  const company = portfolio[activeCompany];

  return (
    <main className="qf-site">
      <a className="qf-skip-link" href="#about">Skip to content</a>
      <div className="qf-cursor" ref={cursorRef} aria-hidden="true"><span /></div>
      <div className="qf-progress" aria-hidden="true" />

      <header className="qf-header">
        <a className="qf-logo" href="#top" aria-label="qFund home"><BrandMark /></a>
        <p className="qf-header-stage">Pre-seed <span /> Series A</p>
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
          {sections.slice(1).map(([id, label], index) => (
            <a href={`#${id}`} onClick={() => setMenuOpen(false)} key={id}>
              <span>{String(index + 1).padStart(2, "0")}</span>{label}
            </a>
          ))}
          <Link href="/news/" onClick={() => setMenuOpen(false)}><span>07</span>All news</Link>
          <Link href="/contact/" onClick={() => setMenuOpen(false)}><span>08</span>Contact</Link>
        </nav>
      </div>

      <SectionRail active={activeSection} />

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
          <p className="qf-kicker qf-reveal is-visible"><span /> DEEP TECH VENTURE CAPITAL · ISRAEL</p>
          <h1 id="qf-hero-title" className="qf-reveal is-visible">
            <span>Funding the</span>
            <span className="qf-serif">deep future</span>
            <span>of technology.</span>
          </h1>
          <p className="qf-hero-deck qf-reveal is-visible">
            qFund invests in Israeli-related startups developing core infrastructure, hardware, and enabling technologies.
          </p>
          <div className="qf-hero-actions qf-reveal is-visible">
            <a className="qf-button" href="#approach">Our approach <span>↓</span></a>
            <Link className="qf-text-link" href="/contact/">Tell us what you are building <span>↗</span></Link>
          </div>
        </div>
        <div className="qf-hero-visual"><FutureField /></div>
        <div className="qf-hero-foot">
          <span>HERZLIYA · ISRAEL</span>
          <a href="#about">SCROLL TO EXPLORE <i>↓</i></a>
        </div>
      </section>

      <section className="qf-about qf-scroll-section" id="about" data-qf-section aria-labelledby="about-title">
        <div className="qf-section-label qf-reveal"><span>01</span><p>About us</p></div>
        <div className="qf-about-heading qf-reveal">
          <p className="qf-kicker">EARLY-STAGE VENTURE CAPITAL</p>
          <h2 id="about-title">Built for technologies that have to work <em>in the real world.</em></h2>
        </div>
        <div className="qf-about-body">
          <div className="qf-about-copy qf-reveal">
            <p>We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies across defense, energy, semiconductors, quantum computing, industrial systems, AI, and robotics.</p>
            <p>Our approach combines financial investment with technical validation, commercialization support, and strategic access.</p>
          </div>
          <div className="qf-about-facts qf-reveal" aria-label="qFund at a glance">
            <article><strong>Pre-seed</strong><span>Entry point</span></article>
            <article><strong>Series A</strong><span>Investment horizon</span></article>
            <article><strong>Israel</strong><span>Israeli-related startups</span></article>
          </div>
        </div>
      </section>

      <section className="qf-industries qf-scroll-section" id="industries" data-qf-section aria-labelledby="industries-title">
        <div className="qf-section-label qf-reveal"><span>02</span><p>Industries</p></div>
        <div className="qf-section-heading qf-reveal">
          <p className="qf-kicker">SIX STRATEGIC FOCUS AREAS</p>
          <h2 id="industries-title">Where scientific advantage becomes <em>industrial consequence.</em></h2>
        </div>
        <div className="qf-industry-grid">
          {focusAreas.map((item, index) => (
            <article className="qf-industry-card qf-reveal" style={{ "--card-index": index } as CSSProperties} key={item.title}>
              <figure>
                <Image
                  src={imagePath(item.title)}
                  alt={`${item.title} technical system`}
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
                  unoptimized
                />
                <span className="qf-image-wash" aria-hidden="true" />
                <span className="qf-image-scan" aria-hidden="true" />
              </figure>
              <div>
                <span>{item.code}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="qf-approach qf-scroll-section" id="approach" data-qf-section aria-labelledby="approach-title">
        <div className="qf-section-label qf-reveal"><span>03</span><p>Our approach</p></div>
        <div className="qf-approach-heading qf-reveal">
          <p className="qf-kicker">CONVICTION, THEN COMPANY BUILDING</p>
          <h2 id="approach-title">A disciplined route from technical truth to <em>commercial scale.</em></h2>
        </div>
        <div className="qf-approach-instrument qf-reveal">
          <div className="qf-approach-controls" role="list" aria-label="Investment evaluation pillars">
            {evaluationPillars.map((item, index) => (
              <button
                type="button"
                className={activeApproach === index ? "is-active" : ""}
                onMouseEnter={() => setActiveApproach(index)}
                onFocus={() => setActiveApproach(index)}
                onClick={() => setActiveApproach(index)}
                aria-pressed={activeApproach === index}
                key={item.code}
              >
                <span>{item.code}</span><strong>{item.title}</strong><i aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="qf-approach-readout" key={approach.code}>
            <div className="qf-approach-graphic" style={{ "--approach-index": activeApproach } as CSSProperties} aria-hidden="true">
              <span className="ring ring-a" /><span className="ring ring-b" /><span className="ring ring-c" />
              <i className="axis axis-a" /><i className="axis axis-b" />
              <b>{approach.code}</b>
            </div>
            <div className="qf-approach-copy">
              <span>{approach.signal}</span>
              <h3>{approach.title}</h3>
              <p>{approach.text}</p>
              <small>{String(activeApproach + 1).padStart(2, "0")} / {String(evaluationPillars.length).padStart(2, "0")}</small>
            </div>
          </div>
        </div>
        <div className="qf-value-grid">
          {valueCreation.map((item) => (
            <article className="qf-value-card qf-reveal" key={item.code}>
              <span>{item.code}</span><h3>{item.title}</h3><p>{item.text}</p><i aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="qf-portfolio qf-scroll-section" id="portfolio" data-qf-section aria-labelledby="portfolio-title">
        <div className="qf-section-label qf-reveal"><span>04</span><p>Our portfolio</p></div>
        <div className="qf-portfolio-heading qf-reveal">
          <p className="qf-kicker">TEN STARTUPS · ONE DEEP-TECH PORTFOLIO</p>
          <h2 id="portfolio-title">Built around technologies with <em>consequence.</em></h2>
        </div>
        <div className="qf-portfolio-console qf-reveal">
          <div className="qf-company-feature" key={company.name}>
            <div className="qf-company-feature-logo">
              <Image src={company.logo} alt={`${company.name} logo`} width={360} height={150} unoptimized />
            </div>
            <span>{company.category}</span>
            <h3>{company.name}</h3>
            <p>{company.description}</p>
            {company.validation ? <small>{company.validation}</small> : null}
            <a href={company.website} target="_blank" rel="noreferrer">Visit company <i>↗</i></a>
          </div>
          <div className="qf-company-matrix" aria-label="Portfolio companies">
            {portfolio.map((item, index) => (
              <a
                className={activeCompany === index ? "is-active" : ""}
                href={item.website}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setActiveCompany(index)}
                onFocus={() => setActiveCompany(index)}
                aria-label={`${item.name} website`}
                key={item.name}
              >
                <Image src={item.logo} alt={`${item.name} logo`} width={220} height={90} unoptimized />
                <span>{item.name}</span><i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="qf-team qf-scroll-section" id="team" data-qf-section aria-labelledby="team-title">
        <div className="qf-section-label qf-reveal"><span>05</span><p>Investment team</p></div>
        <div className="qf-section-heading qf-reveal">
          <p className="qf-kicker">QFUND · HERZLIYA</p>
          <h2 id="team-title">Experience across R&amp;D, industry, investment, and <em>global partnerships.</em></h2>
        </div>
        <div className="qf-team-grid">
          {team.map((member, index) => (
            <article className="qf-team-card qf-reveal" style={{ "--card-index": index } as CSSProperties} key={member.name}>
              <a className="qf-team-image" href={member.linkedin} target="_blank" rel="noreferrer" aria-label={`${member.name} on LinkedIn`}>
                <Image src={member.image} alt={member.name} fill sizes="(max-width: 720px) 100vw, 33vw" unoptimized />
                <span aria-hidden="true">LinkedIn ↗</span>
              </a>
              <div><span>{member.role}</span><h3>{member.name}</h3><p>{member.bio}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="qf-news qf-scroll-section" id="news" data-qf-section aria-labelledby="news-title">
        <div className="qf-section-label qf-reveal"><span>06</span><p>News</p></div>
        <div className="qf-news-heading qf-reveal">
          <div><p className="qf-kicker">LATEST ACTIVITY</p><h2 id="news-title">qFund <em>in motion.</em></h2></div>
          <Link className="qf-text-link" href="/news/">View all news <span>↗</span></Link>
        </div>
        <div className="qf-news-grid">
          {newsItems.slice(0, 3).map((item, index) => (
            <article className="qf-news-card qf-reveal" key={`${item.date}-${item.title}`}>
              <NewsArtwork item={item} index={index} />
              <div><span>{item.tag}</span><time dateTime={item.date}>{formatNewsDate(item.date)}</time></div>
              <h3>{item.title}</h3>
              <p>{item.blurb}</p>
            </article>
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
          <div><a href="mailto:info@qfund.io">info@qfund.io</a><a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a><span>Arik Einstein 3 · Herzliya, Israel · © {new Date().getFullYear()} qFund</span></div>
        </div>
      </footer>
    </main>
  );
}
