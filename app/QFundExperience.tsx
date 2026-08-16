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
import IndustriesExperience from "./industries/IndustriesExperience";
import { formatNewsDate, newsItems } from "./newsData";
import { portfolio, team } from "./siteData";

const sections = [
  ["top", "Home"],
  ["about", "About"],
  ["industries", "Industries"],
  ["portfolio", "Portfolio"],
  ["team", "Team"],
  ["news", "News"],
] as const;

function parseHexColor(value: string): [number, number, number] {
  const match = value.trim().match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!match) return [0, 0, 0];
  return [Number.parseInt(match[1], 16), Number.parseInt(match[2], 16), Number.parseInt(match[3], 16)];
}

function rgba([red, green, blue]: [number, number, number], alpha: number) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

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

function FrontierField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const field = fieldRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !field || !context) return;

    const rootStyles = getComputedStyle(document.documentElement);
    const brandRgb = parseHexColor(rootStyles.getPropertyValue("--color-brand"));
    const accentRgb = parseHexColor(rootStyles.getPropertyValue("--qf-coral"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, inside: false };
    let width = 1;
    let height = 1;
    let frame = 0;
    let fieldVisible = false;
    let pageVisible = !document.hidden;

    const render = (time: number) => {
      const seconds = time / 1000;
      pointer.x += (pointer.targetX - pointer.x) * 0.055;
      pointer.y += (pointer.targetY - pointer.y) * 0.055;

      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";

      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const pointerX = pointer.x * width;
      const pointerY = pointer.y * height;
      const fieldRadius = Math.max(width, height) * 0.32;

      const lens = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, fieldRadius);
      lens.addColorStop(0, rgba(accentRgb, 0.15));
      lens.addColorStop(0.42, rgba(brandRgb, 0.09));
      lens.addColorStop(1, rgba(brandRgb, 0));
      context.fillStyle = lens;
      context.fillRect(0, 0, width, height);

      const rows = 15;
      const horizontalSteps = 64;
      for (let row = 0; row < rows; row += 1) {
        const rowRatio = row / (rows - 1);
        const baseY = height * (0.16 + rowRatio * 0.68);
        context.beginPath();
        for (let step = 0; step <= horizontalSteps; step += 1) {
          const ratio = step / horizontalSteps;
          const x = ratio * width;
          const centerPull = Math.exp(-Math.pow((ratio - 0.5) / 0.23, 2));
          const wave = Math.sin(ratio * 10 + row * 0.48 + seconds * 0.52) * (1.5 + centerPull * 5.5);
          const depth = (rowRatio - 0.5) * Math.sin((ratio - 0.5) * Math.PI) * 9;
          const dx = x - pointerX;
          const dy = baseY - pointerY;
          const pointerPull = pointer.inside
            ? (pointerY - baseY) * Math.exp(-(dx * dx + dy * dy) / (fieldRadius * fieldRadius)) * 0.13
            : 0;
          const y = baseY + wave + depth + pointerPull;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        const rowDistance = Math.abs(rowRatio - 0.5);
        context.strokeStyle = rgba(brandRgb, 0.12 + (0.5 - rowDistance) * 0.27);
        context.lineWidth = row === 7 ? 1.35 : 0.86;
        context.stroke();
      }

      const columns = 13;
      const verticalSteps = 48;
      for (let column = 0; column < columns; column += 1) {
        const columnRatio = column / (columns - 1);
        const baseX = width * (0.12 + columnRatio * 0.76);
        context.beginPath();
        for (let step = 0; step <= verticalSteps; step += 1) {
          const ratio = step / verticalSteps;
          const y = ratio * height;
          const centerPull = Math.exp(-Math.pow((ratio - 0.5) / 0.27, 2));
          const wave = Math.cos(ratio * 8 + column * 0.42 - seconds * 0.42) * (1.2 + centerPull * 4);
          const dx = baseX - pointerX;
          const dy = y - pointerY;
          const pointerPull = pointer.inside
            ? (pointerX - baseX) * Math.exp(-(dx * dx + dy * dy) / (fieldRadius * fieldRadius)) * 0.11
            : 0;
          const x = baseX + wave + pointerPull;
          if (step === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = rgba(brandRgb, 0.16);
        context.lineWidth = 0.82;
        context.stroke();
      }

      for (let anchor = 0; anchor < 6; anchor += 1) {
        const angle = -Math.PI / 2 + (anchor / 6) * Math.PI * 2 + seconds * 0.025;
        const radiusX = width * 0.33;
        const radiusY = height * 0.29;
        const x = centerX + Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle) * radiusY;
        const pulse = 0.5 + Math.sin(seconds * 1.2 + anchor * 1.4) * 0.5;
        context.beginPath();
        context.arc(x, y, 2.3 + pulse * 1.2, 0, Math.PI * 2);
        context.fillStyle = rgba(accentRgb, 0.55 + pulse * 0.35);
        context.fill();
        context.beginPath();
        context.arc(x, y, 7 + pulse * 4, 0, Math.PI * 2);
        context.strokeStyle = rgba(accentRgb, 0.08 + pulse * 0.12);
        context.lineWidth = 1;
        context.stroke();
      }

      const particles = 18;
      for (let particle = 0; particle < particles; particle += 1) {
        const progress = (seconds * 0.055 + particle / particles) % 1;
        const fromLeft = particle % 2 === 0;
        const startX = fromLeft ? -12 : width + 12;
        const startY = height * (0.17 + ((particle * 37) % 66) / 100);
        const controlX = centerX + (fromLeft ? -1 : 1) * width * 0.12;
        const controlY = centerY + Math.sin(particle * 2.1) * height * 0.2;
        const inverse = 1 - progress;
        const x = inverse * inverse * startX + 2 * inverse * progress * controlX + progress * progress * centerX;
        const y = inverse * inverse * startY + 2 * inverse * progress * controlY + progress * progress * centerY;
        const opacity = Math.sin(progress * Math.PI) * 0.72;
        context.beginPath();
        context.arc(x, y, 1.15 + progress * 1.25, 0, Math.PI * 2);
        context.fillStyle = rgba(accentRgb, opacity);
        context.fill();
      }

      const emission = (seconds % 5.4) / 5.4;
      context.beginPath();
      context.arc(centerX, centerY, 54 + emission * Math.min(width, height) * 0.28, 0, Math.PI * 2);
      context.strokeStyle = rgba(brandRgb, Math.pow(1 - emission, 2) * 0.32);
      context.lineWidth = 1;
      context.stroke();
    };

    const resize = () => {
      const bounds = field.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const density = Math.min(window.devicePixelRatio || 1, 1.4);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(density, 0, 0, density, 0, 0);
      render(0);
    };

    const animate = (time: number) => {
      frame = 0;
      if (reduced || !fieldVisible || !pageVisible) return;
      render(time);
      frame = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (!reduced && fieldVisible && pageVisible && !frame) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      const bounds = field.getBoundingClientRect();
      pointer.targetX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointer.targetY = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
      pointer.inside = true;
      field.style.setProperty("--frontier-x", `${(pointer.targetX * 100).toFixed(1)}%`);
      field.style.setProperty("--frontier-y", `${(pointer.targetY * 100).toFixed(1)}%`);
      if (reduced) render(0);
    };

    const onPointerLeave = () => {
      pointer.targetX = 0.5;
      pointer.targetY = 0.5;
      pointer.inside = false;
      field.style.setProperty("--frontier-x", "50%");
      field.style.setProperty("--frontier-y", "50%");
      if (reduced) render(0);
    };

    const observer = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        fieldVisible = entry.isIntersecting;
        if (fieldVisible) startAnimation();
        else stopAnimation();
      },
      { rootMargin: "12%" },
    );
    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (pageVisible) startAnimation();
      else stopAnimation();
    };
    observer.observe(field);
    visibilityObserver.observe(field);
    document.addEventListener("visibilitychange", onVisibilityChange);
    field.addEventListener("pointermove", onPointerMove, { passive: true });
    field.addEventListener("pointerleave", onPointerLeave, { passive: true });
    resize();

    return () => {
      stopAnimation();
      observer.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      field.removeEventListener("pointermove", onPointerMove);
      field.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="qf-frontier-field" ref={fieldRef} aria-hidden="true">
      <canvas className="qf-frontier-canvas" ref={canvasRef} />
      <span className="qf-frontier-core">
        <span className="qf-frontier-mark">
          <i className="qf-frontier-q" />
          <i className="qf-frontier-arrow" />
        </span>
      </span>
      <span className="qf-frontier-depth depth-one" />
      <span className="qf-frontier-depth depth-two" />
    </div>
  );
}

export default function QFundExperience() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
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
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          if (entry.target.classList.contains("qf-check")) entry.target.classList.add("is-writing");
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
      <a className="qf-skip-link" href="#about">Skip to content</a>
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
          {sections.slice(1).map(([id, label], index) => (
            <a href={`#${id}`} onClick={() => setMenuOpen(false)} key={id}>
              <span>{String(index + 1).padStart(2, "0")}</span>{label}
            </a>
          ))}
          <Link href="/news/" onClick={() => setMenuOpen(false)}><span>06</span>All news</Link>
          <Link href="/contact/" onClick={() => setMenuOpen(false)}><span>07</span>Contact</Link>
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
        <div className="qf-hero-visual"><FrontierField /></div>
        <div className="qf-hero-foot">
          <span>HERZLIYA</span>
          <a href="#about">SCROLL TO EXPLORE <i>↓</i></a>
        </div>
      </section>

      <section className="qf-about qf-scroll-section" id="about" data-qf-section aria-labelledby="about-title">
        <div className="qf-section-label qf-reveal"><span>01</span><p>About us</p></div>
        <div className="qf-about-heading qf-reveal">
          <p className="qf-kicker">EARLY-STAGE VENTURE CAPITAL</p>
          <h2 id="about-title">What we invest in, and what we bring <em>beyond capital.</em></h2>
        </div>
        <div className="qf-check-stage">
          <span className="qf-check-stage-grid" aria-hidden="true" />
          <div className="qf-check qf-reveal" aria-label="qFund backs the builders of the deep future, from pre-seed to Series A">
            <div className="qf-check-top">
              <div className="qf-check-bank">
                <span className="qf-check-monogram" aria-hidden="true">q</span>
                <div><strong>qFund</strong><small>DEEP TECH VENTURE CAPITAL</small></div>
              </div>
              <span className="qf-check-corner-mark">QF / 01</span>
            </div>

            <div className="qf-check-statement" aria-hidden="true">
              <span className="qf-check-script-line" style={{ "--write-order": 0 } as CSSProperties}>
                <span className="qf-check-written">Backing the builders</span>
              </span>
              <span className="qf-check-script-line" style={{ "--write-order": 1 } as CSSProperties}>
                <span className="qf-check-written">of the deep future.</span>
              </span>
            </div>

            <div className="qf-check-bottom">
              <span className="qf-check-script-line qf-check-stage-line" style={{ "--write-order": 2 } as CSSProperties}>
                <span className="qf-check-written">Pre-seed to Series A</span>
              </span>
              <span className="qf-check-script-line qf-check-signature-line" style={{ "--write-order": 3 } as CSSProperties}>
                <span className="qf-check-written">qFund</span>
              </span>
            </div>

            <div className="qf-check-security" aria-hidden="true"><i /><i /><i /></div>
          </div>
        </div>
      </section>

      <IndustriesExperience />

      <section className="qf-portfolio qf-scroll-section" id="portfolio" data-qf-section aria-labelledby="portfolio-title">
        <div className="qf-section-label qf-reveal"><span>03</span><p>Our portfolio</p></div>
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
        <div className="qf-section-label qf-reveal"><span>04</span><p>Investment team</p></div>
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
        <div className="qf-section-label qf-reveal"><span>05</span><p>News</p></div>
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
          <div><a href="mailto:info@qfund.io">info@qfund.io</a><a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a><span>Arik Einstein 3 · Herzliya · © {new Date().getFullYear()} qFund</span></div>
        </div>
      </footer>
    </main>
  );
}
