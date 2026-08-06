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
  return `/focus/${title.toLowerCase().replaceAll(" ", "-")}.jpg`;
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

function ApproachGraphic({ index, code }: { index: number; code: string }) {
  const variant = ["team", "technology", "market", "defensibility"][index];

  return (
    <div className={`qf-approach-graphic is-${variant}`} aria-hidden="true">
      <span className="qf-approach-grid" />
      {variant === "team" ? (
        <div className="qf-handshake">
          <svg viewBox="0 0 24 22" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" focusable="false">
            <g className="qf-handshake-hands">
              <path d="M3 1 2 12l6.5 6.5a1 1 0 1 0 3-3" vectorEffect="non-scaling-stroke" />
              <path d="M3 2h8" vectorEffect="non-scaling-stroke" />
              <path d="m11 15 2 2a1 1 0 1 0 3-3" vectorEffect="non-scaling-stroke" />
              <path
                d="m14 12 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 2"
                vectorEffect="non-scaling-stroke"
              />
              <path d="m21 1 1 11h-2" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
          <b>DOMAIN / FOUNDER FIT</b>
        </div>
      ) : null}
      {variant === "technology" ? (
        <div className="qf-technology-symbol">
          <span className="qf-chip"><b>10×</b><i /></span>
          <span className="qf-trace trace-one" />
          <span className="qf-trace trace-two" />
          <span className="qf-trace trace-three" />
          <span className="qf-trace trace-four" />
        </div>
      ) : null}
      {variant === "market" ? (
        <div className="qf-market-symbol">
          <span className="qf-market-ring ring-one" />
          <span className="qf-market-ring ring-two" />
          <span className="qf-market-ring ring-three" />
          <span className="qf-market-vector"><i /><b /></span>
        </div>
      ) : null}
      {variant === "defensibility" ? (
        <div className="qf-defensibility-symbol">
          <span className="qf-barrier barrier-one" />
          <span className="qf-barrier barrier-two" />
          <span className="qf-barrier barrier-three" />
          <span className="qf-lock"><i /></span>
        </div>
      ) : null}
      <span className="qf-approach-code">{code}</span>
    </div>
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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, inside: false };
    let width = 1;
    let height = 1;
    let frame = 0;

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
      lens.addColorStop(0, "rgba(34, 199, 203, 0.15)");
      lens.addColorStop(0.42, "rgba(12, 111, 105, 0.055)");
      lens.addColorStop(1, "rgba(12, 111, 105, 0)");
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
        context.strokeStyle = `rgba(12, 111, 105, ${0.07 + (0.5 - rowDistance) * 0.16})`;
        context.lineWidth = row === 7 ? 1.15 : 0.72;
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
        context.strokeStyle = "rgba(12, 111, 105, 0.085)";
        context.lineWidth = 0.7;
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
        context.fillStyle = `rgba(34, 199, 203, ${0.55 + pulse * 0.35})`;
        context.fill();
        context.beginPath();
        context.arc(x, y, 7 + pulse * 4, 0, Math.PI * 2);
        context.strokeStyle = `rgba(34, 199, 203, ${0.08 + pulse * 0.12})`;
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
        context.fillStyle = `rgba(34, 199, 203, ${opacity})`;
        context.fill();
      }

      const emission = (seconds % 5.4) / 5.4;
      context.beginPath();
      context.arc(centerX, centerY, 54 + emission * Math.min(width, height) * 0.28, 0, Math.PI * 2);
      context.strokeStyle = `rgba(12, 111, 105, ${Math.pow(1 - emission, 2) * 0.2})`;
      context.lineWidth = 1;
      context.stroke();
    };

    const resize = () => {
      const bounds = field.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const density = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(density, 0, 0, density, 0, 0);
      render(0);
    };

    const animate = (time: number) => {
      render(time);
      frame = window.requestAnimationFrame(animate);
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
    observer.observe(field);
    field.addEventListener("pointermove", onPointerMove, { passive: true });
    field.addEventListener("pointerleave", onPointerLeave, { passive: true });
    resize();
    if (!reduced) frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
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
  const [activeApproach, setActiveApproach] = useState(0);
  const [activeCompany, setActiveCompany] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);
  const companyTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

  const selectCompanyFromKeyboard = (index: number) => {
    const nextIndex = (index + portfolio.length) % portfolio.length;
    setActiveCompany(nextIndex);
    companyTabRefs.current[nextIndex]?.focus();
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
          <Link href="/news/" onClick={() => setMenuOpen(false)}><span>07</span>All news</Link>
          <Link href="/contact/" onClick={() => setMenuOpen(false)}><span>08</span>Contact</Link>
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
        <div className="qf-hero-visual"><FrontierField /></div>
        <div className="qf-hero-foot">
          <span>HERZLIYA · ISRAEL</span>
          <a href="#about">SCROLL TO EXPLORE <i>↓</i></a>
        </div>
      </section>

      <section className="qf-about qf-scroll-section" id="about" data-qf-section aria-labelledby="about-title">
        <div className="qf-section-label qf-reveal"><span>01</span><p>About us</p></div>
        <div className="qf-about-heading qf-reveal">
          <p className="qf-kicker">EARLY-STAGE VENTURE CAPITAL</p>
          <h2 id="about-title">What we invest in, and what we bring <em>beyond capital.</em></h2>
        </div>
        <div className="qf-about-body">
          <div className="qf-about-copy qf-reveal">
            <p>We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies across defense, energy, semiconductors, quantum computing, industrial systems, AI, and robotics.</p>
            <p>Our approach combines financial investment with technical validation, commercialization support, and strategic access.</p>
          </div>
          <div className="qf-about-facts qf-reveal" aria-label="qFund at a glance">
            <article><strong>Deep Tech</strong><span>Investment focus</span></article>
            <article><strong>Pre-seed to Series A</strong><span>Investment horizon</span></article>
            <article><strong>Israel</strong><span>Israeli-related startups</span></article>
          </div>
        </div>
      </section>

      <section className="qf-industries qf-scroll-section" id="industries" data-qf-section aria-labelledby="industries-title">
        <div className="qf-section-label qf-reveal"><span>02</span><p>Industries</p></div>
        <div className="qf-section-heading qf-reveal">
          <p className="qf-kicker">SIX STRATEGIC FOCUS AREAS</p>
          <h2 id="industries-title">Six sectors, and what we look for inside <em>each one.</em></h2>
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
          <h2 id="approach-title">How we choose companies, and what we do <em>after we invest.</em></h2>
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
            <ApproachGraphic index={activeApproach} code={approach.code} />
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
          <div className="qf-company-tabs" role="tablist" aria-label="Portfolio companies">
            {portfolio.map((item, index) => (
              <button
                ref={(node) => { companyTabRefs.current[index] = node; }}
                className={activeCompany === index ? "is-active" : ""}
                type="button"
                role="tab"
                id={`portfolio-tab-${index}`}
                aria-controls="portfolio-company-panel"
                aria-selected={activeCompany === index}
                tabIndex={activeCompany === index ? 0 : -1}
                onClick={() => setActiveCompany(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    selectCompanyFromKeyboard(index + 1);
                  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    event.preventDefault();
                    selectCompanyFromKeyboard(index - 1);
                  } else if (event.key === "Home") {
                    event.preventDefault();
                    selectCompanyFromKeyboard(0);
                  } else if (event.key === "End") {
                    event.preventDefault();
                    selectCompanyFromKeyboard(portfolio.length - 1);
                  }
                }}
                aria-label={`Show ${item.name}`}
                key={item.name}
              >
                <Image src={item.logo} alt={`${item.name} logo`} width={220} height={90} unoptimized />
                <span>{item.name}</span><i aria-hidden="true" />
              </button>
            ))}
          </div>
          <article
            className="qf-company-feature"
            id="portfolio-company-panel"
            role="tabpanel"
            aria-labelledby={`portfolio-tab-${activeCompany}`}
            tabIndex={0}
          >
            <div className="qf-company-feature-inner" key={company.name}>
              <div className="qf-company-feature-brand">
                <div className="qf-company-feature-logo">
                  <Image src={company.logo} alt={`${company.name} logo`} width={460} height={190} unoptimized />
                </div>
                <p><span>{String(activeCompany + 1).padStart(2, "0")}</span> / {String(portfolio.length).padStart(2, "0")}</p>
              </div>
              <div className="qf-company-feature-copy">
                <span>Portfolio company</span>
                <h3>{company.name}</h3>
                <p>{company.description}</p>
                <ul className="qf-company-facts">
                  <li><span>Industry</span><strong>{company.category}</strong></li>
                  <li><span>Founders</span><strong>{company.founders.map((founder) => founder.name).join(", ")}</strong></li>
                </ul>
                {company.validation ? <small><span>Momentum</span>{company.validation}</small> : null}
                <a href={company.website} target="_blank" rel="noreferrer">Visit company <i>↗</i></a>
              </div>
              <div className="qf-company-founders" aria-label={`${company.name} founders`}>
                <p>Meet the founders</p>
                <div>
                  {company.founders.map((founder) => (
                    <a href={founder.linkedin} target="_blank" rel="noreferrer" aria-label={`${founder.name} on LinkedIn`} key={founder.name}>
                      <span><Image src={founder.image} alt={founder.name} fill sizes="96px" unoptimized /></span>
                      <strong>{founder.name}</strong>
                      <i aria-hidden="true">↗</i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </article>
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
