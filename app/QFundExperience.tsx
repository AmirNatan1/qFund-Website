"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import BrandMark from "./components/BrandMark";
import BackToTop from "./components/BackToTop";
import {
  evaluationPillars,
  filters,
  focusAreas,
  portfolio,
  team,
} from "./siteData";
import HeroWaveField from "./components/HeroWaveField";
import { formatNewsDate, newsItems } from "./newsData";

const routes = [
  ["Thesis", "/thesis/"],
  ["Companies", "/companies/"],
  ["Founders", "/founders/"],
  ["News", "/news/"],
] as const;

const gatewayStages = [
  { cue: "IDENTIFY", name: "discovery" },
  { cue: "VALIDATE", name: "validation" },
  { cue: "BUILD", name: "trajectory" },
] as const;

function GatewaySignal({ stage }: { stage: 0 | 1 | 2 }) {
  const signal = gatewayStages[stage];

  return (
    <div
      className={`gateway-visual gateway-system gateway-system-${signal.name}`}
      style={{ "--gateway-stage": stage } as CSSProperties}
      aria-hidden="true"
    >
      <span className="gateway-system-grid" />
      <span className="gateway-system-beam gateway-beam-primary" />
      <span className="gateway-system-beam gateway-beam-secondary" />
      <span className="gateway-system-track" />
      <span className="gateway-system-pulse" />
      {Array.from({ length: 4 }, (_, index) => (
        <b className={`gateway-system-node gateway-system-node-${index + 1}`} key={index} />
      ))}
      <span className="gateway-system-halo gateway-halo-one" />
      <span className="gateway-system-halo gateway-halo-two" />
      <i className="gateway-core">0{stage + 1}</i>
      <small>{signal.cue}</small>
    </div>
  );
}

export default function QFundExperience() {
  const [ready, setReady] = useState(false);
  const [loadValue, setLoadValue] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFocus, setActiveFocus] = useState(0);
  const [activeTest, setActiveTest] = useState(0);
  const [filter, setFilter] = useState("all");
  const [activeCompany, setActiveCompany] = useState(0);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let loadTimer = 0;

    if (reduced) {
      loadTimer = window.setTimeout(() => {
        setLoadValue(100);
        setReady(true);
      }, 0);
    } else {
      loadTimer = window.setInterval(() => {
        setLoadValue((current) => {
          const next = Math.min(100, current + Math.max(2, Math.round((100 - current) / 7)));
          if (next === 100) {
            window.clearInterval(loadTimer);
            window.setTimeout(() => setReady(true), 220);
          }
          return next;
        });
      }, 42);
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6%" },
    );

    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
    const signalCorridor = document.querySelector<HTMLElement>("[data-signal-corridor]");

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const scroll = window.scrollY;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        root.style.setProperty("--page-progress", String(scroll / max));
        root.style.setProperty("--hero-shift", String(Math.min(1, scroll / window.innerHeight)));
        if (signalCorridor) {
          const bounds = signalCorridor.getBoundingClientRect();
          const travel = Math.max(1, signalCorridor.offsetHeight - window.innerHeight);
          const progress = reduced ? 0.55 : Math.min(1, Math.max(0, -bounds.top / travel));
          signalCorridor.style.setProperty("--corridor-progress", String(progress));
          signalCorridor.style.setProperty("--corridor-shift", String((progress - 0.5) * 2));
        }
        frame = 0;
      });
    };

    const onPointer = (event: PointerEvent) => {
      root.style.setProperty("--mx", `${event.clientX}px`);
      root.style.setProperty("--my", `${event.clientY}px`);
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      }
    };

    const magneticNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const magneticCleanup = magneticNodes.map((node) => {
      const move = (event: PointerEvent) => {
        if (reduced) return;
        const box = node.getBoundingClientRect();
        const x = (event.clientX - box.left - box.width / 2) * 0.16;
        const y = (event.clientY - box.top - box.height / 2) * 0.16;
        node.style.transform = `translate3d(${x}px,${y}px,0)`;
      };
      const leave = () => {
        node.style.transform = "translate3d(0,0,0)";
      };
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      return () => {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      };
    });

    const tiltNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-tilt]"));
    const tiltCleanup = tiltNodes.map((node) => {
      const move = (event: PointerEvent) => {
        if (reduced) return;
        const box = node.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width - 0.5;
        const py = (event.clientY - box.top) / box.height - 0.5;
        node.style.setProperty("--tilt-x", String(py * -4));
        node.style.setProperty("--tilt-y", String(px * 5));
        node.style.setProperty("--card-x", `${(px + 0.5) * 100}%`);
        node.style.setProperty("--card-y", `${(py + 0.5) * 100}%`);
      };
      const leave = () => {
        node.style.setProperty("--tilt-x", "0");
        node.style.setProperty("--tilt-y", "0");
      };
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerleave", leave);
      return () => {
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerleave", leave);
      };
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    onScroll();

    return () => {
      window.clearInterval(loadTimer);
      window.cancelAnimationFrame(frame);
      revealObserver.disconnect();
      magneticCleanup.forEach((cleanup) => cleanup());
      tiltCleanup.forEach((cleanup) => cleanup());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  const active = focusAreas[activeFocus];
  const activeEvaluation = evaluationPillars[activeTest];
  const visibleCompanies = portfolio
    .map((company, index) => ({ company, index }))
    .filter(({ company }) => filter === "all" || filter === company.group);
  const selectedCompany =
    visibleCompanies.find(({ index }) => index === activeCompany) ?? visibleCompanies[0];

  return (
    <main className={ready ? "site is-ready" : "site is-loading"}>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <div className="preloader" aria-hidden={ready}>
        <div className="preloader-grid" />
        <div className="preloader-inner">
          <BrandMark />
          <p>Backing Deep Tech founders</p>
          <div className="preloader-track"><span style={{ width: `${loadValue}%` }} /></div>
          <span className="preloader-count">{String(loadValue).padStart(3, "0")}</span>
        </div>
      </div>

      <div className="cursor" ref={cursorRef} aria-hidden="true"><span /></div>
      <div className="scroll-progress" aria-hidden="true" />

      <header className="nav-shell">
        <a href="#top" className="nav-logo" aria-label="qFund home"><BrandMark /></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {routes.map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}
        </nav>
        <Link className="nav-cta" href="/contact/" data-magnetic>
          <span>Contact qFund</span><span aria-hidden="true">↗</span>
        </Link>
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

      <div className={menuOpen ? "mobile-menu is-open" : "mobile-menu"}>
        <nav aria-label="Mobile navigation">
          {routes.map(([label, href], index) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{label}
            </Link>
          ))}
          <Link href="/contact/" onClick={() => setMenuOpen(false)}>
            <span>05</span>Contact
          </Link>
        </nav>
        <a href="mailto:info@qfund.io">info@qfund.io ↗</a>
      </div>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true">
          <HeroWaveField />
        </div>
        <div className="hero-field" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-coordinates" aria-hidden="true">
          <span>HERZLIYA</span><span>ISRAEL</span>
        </div>
        <div className="hero-content" id="main-content">
          <p className="eyebrow hero-eyebrow"><span /> EARLY-STAGE VENTURE CAPITAL · DEEP TECH</p>
          <h1 id="hero-title" className="hero-title">
            <span className="line"><span>Backing</span></span>
            <span className="line accent-line"><span>Israeli-related</span></span>
            <span className="line"><span>Deep Tech founders.</span></span>
          </h1>
          <div className="hero-bottom">
            <p>
              We are an early-stage venture capital firm backing Deep Tech founders.
            </p>
          </div>
        </div>
        <div className="hero-status" aria-hidden="true">
          <span className="pulse-dot" /> ISRAELI-RELATED DEEP TECH
        </div>
      </section>

      <section className="ticker" aria-label="Strategic focus areas">
        <div className="ticker-track">
          {[...focusAreas, ...focusAreas].map((item, index) => (
            <span key={`${item.title}-${index}`}>{item.short}<i>✦</i></span>
          ))}
        </div>
      </section>

      <section className="page-gateway section-ink" id="explore">
        <div className="section-index reveal"><span>00</span><p>Explore qFund</p></div>
        <div className="gateway-heading reveal">
          <p className="eyebrow">EARLY STAGE / DEEP TECH / ISRAEL</p>
          <h2>Backing<br /><em>Deep Tech founders.</em></h2>
          <p>
            Financial investment, technical validation, commercialization support, and strategic access.
          </p>
        </div>
        <div className="gateway-grid">
          <Link className="gateway-card gateway-thesis reveal" href="/thesis/" data-tilt>
            <GatewaySignal stage={0} />
            <span>Investment thesis</span><h3>What qFund looks for.</h3>
            <p>Founders, breakthrough Deep Tech, and massive high-conviction markets.</p>
            <i className="gateway-arrow" aria-hidden="true">↗</i>
          </Link>
          <Link className="gateway-card gateway-companies reveal" href="/companies/" data-tilt>
            <GatewaySignal stage={1} />
            <span>Portfolio</span><h3>Real Deep Tech companies.</h3>
            <p>Thermal management, defense, satellite communications, quantum computing, cybersecurity, laser detection, and particle acceleration.</p>
            <i className="gateway-arrow" aria-hidden="true">↗</i>
          </Link>
          <Link className="gateway-card gateway-founders reveal" href="/founders/" data-tilt>
            <GatewaySignal stage={2} />
            <span>Portfolio founders</span><h3>The people behind the portfolio.</h3>
            <p>Academic experts, alumni of elite technological units, and industry leaders.</p>
            <i className="gateway-arrow" aria-hidden="true">↗</i>
          </Link>
        </div>
      </section>

      <section className="thesis section-light" id="thesis">
        <div className="section-index reveal"><span>01</span><p>About qFund</p></div>
        <div className="thesis-statement reveal">
          <p className="eyebrow dark">EARLY-STAGE VENTURE CAPITAL</p>
          <h2>
            Core infrastructure, hardware, and
            <em> enabling technologies.</em>
          </h2>
        </div>
        <div className="thesis-grid">
          <div className="thesis-copy reveal">
            <p>
              We invest in Israeli-related startups developing core infrastructure, hardware, and enabling technologies across defense, energy, semiconductors, quantum computing, industrial systems, AI, and robotics.
            </p>
            <p>
              Our approach combines financial investment with technical validation, commercialization support, and strategic access.
            </p>
            <Link className="text-link route-link" href="/thesis/">Read the investment thesis <span>↗</span></Link>
          </div>
          <div className="metrics reveal" aria-label="qFund investment approach">
            <article><strong>EARLY</strong><span>Seed to Series A</span></article>
            <article><strong>DEEP</strong><span>Hardware and enabling software</span></article>
            <article><strong>ISRAEL</strong><span>Israeli-related startups</span></article>
          </div>
        </div>
      </section>

      <section className="underwrite section-sage" id="evaluate">
        <div className="section-index reveal"><span>02</span><p>How qFund evaluates</p></div>
        <div className="underwrite-layout">
          <div className="underwrite-intro reveal">
            <p className="eyebrow dark">FOUR-PILLAR METHOD</p>
            <h2>Separating science fiction<br /><em>from real-world infrastructure.</em></h2>
            <p>
              We evaluate founders, technology, market, and defensibility.
            </p>
            <Link className="text-link route-link" href="/thesis/#evaluation">Evaluation and value creation <span>↗</span></Link>
          </div>

          <div className="underwrite-console reveal">
            <div className="console-visual" aria-hidden="true">
              <span className="console-ring ring-one" />
              <span className="console-ring ring-two" />
              <span className="console-axis axis-x" />
              <span className="console-axis axis-y" />
              <span className="console-sweep" />
              <strong>{activeEvaluation.code}</strong>
              <small>{activeEvaluation.signal}</small>
            </div>
            <div className="underwrite-tests" role="list" aria-label="qFund evaluation pillars">
              {evaluationPillars.map((test, index) => (
                <button
                  className={activeTest === index ? "underwrite-test is-active" : "underwrite-test"}
                  key={test.code}
                  type="button"
                  onMouseEnter={() => setActiveTest(index)}
                  onFocus={() => setActiveTest(index)}
                  onClick={() => setActiveTest(index)}
                  aria-pressed={activeTest === index}
                >
                  <span>{test.code}</span>
                  <span><strong>{test.title}</strong><small>{test.text}</small></span>
                  <i aria-hidden="true">{activeTest === index ? "●" : "○"}</i>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="focus section-dark" id="focus">
        <div className="section-index reveal"><span>03</span><p>Strategic focus areas</p></div>
        <div className="focus-layout">
          <div className="focus-list reveal">
            <p className="eyebrow">STRATEGIC FOCUS</p>
            {focusAreas.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={activeFocus === index ? "focus-button is-active" : "focus-button"}
                onMouseEnter={() => setActiveFocus(index)}
                onFocus={() => setActiveFocus(index)}
                onClick={() => setActiveFocus(index)}
                aria-pressed={activeFocus === index}
              >
                <span>{item.code}</span><strong>{item.title}</strong><i aria-hidden="true">↗</i>
              </button>
            ))}
          </div>
          <div className="focus-stage reveal" data-focus={activeFocus}>
            <div className="orbit-system" aria-hidden="true">
              <span className="orbit orbit-a" /><span className="orbit orbit-b" /><span className="orbit orbit-c" />
              <span className="satellite sat-a" /><span className="satellite sat-b" /><span className="satellite sat-c" />
              <span className="orbit-core">{active.code}</span>
            </div>
            <div className="focus-readout">
              <span className="signal">STRATEGIC FOCUS AREA</span>
              <h3 key={active.title}>{active.title}</h3>
              <p key={active.text}>{active.text}</p>
              <div className="readout-line"><span style={{ width: `${((activeFocus + 1) / focusAreas.length) * 100}%` }} /></div>
              <small>FIELD {active.code} / 0{focusAreas.length}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="signal-corridor" data-signal-corridor aria-label="Our investment approach">
        <div className="signal-corridor-stage">
          <div className="corridor-grid" aria-hidden="true" />
          <div className="corridor-aperture" aria-hidden="true">
            <span className="corridor-ring corridor-ring-a" />
            <span className="corridor-ring corridor-ring-b" />
            <span className="corridor-ring corridor-ring-c" />
            <span className="corridor-axis corridor-axis-x" />
            <span className="corridor-axis corridor-axis-y" />
            <i className="corridor-core"><span /></i>
          </div>
          <div className="corridor-type">
            <p className="eyebrow">CORE INFRASTRUCTURE · HARDWARE · ENABLING TECHNOLOGIES</p>
            <h2>
              <span>Financial investment.</span>
              <span>Technical validation.</span>
            </h2>
          </div>
          <div className="corridor-signals">
            <span>TECHNICAL VALIDATION</span>
            <span>COMMERCIALIZATION SUPPORT</span>
            <span>STRATEGIC ACCESS</span>
          </div>
          <div className="corridor-counter" aria-hidden="true">
            <span>RESEARCH</span><i /><span>SCALE</span>
          </div>
        </div>
      </section>

      <section className="portfolio section-ink" id="portfolio">
        <div className="section-index reveal"><span>04</span><p>Portfolio companies</p></div>
        <div className="portfolio-heading reveal">
          <div>
            <h2>Real Deep Tech companies.</h2>
            <Link className="text-link route-link" href="/companies/">Open the complete portfolio <span>↗</span></Link>
          </div>
          <p>
            Our portfolio spans quantum computing, defense, satellite communications, thermal management, cybersecurity, sensing, RF, and electro-optics.
          </p>
        </div>
        <div className="portfolio-filters reveal" role="group" aria-label="Filter portfolio companies">
          {filters.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? "is-active" : ""}
              onClick={() => {
                setFilter(value);
                const firstMatch = portfolio.findIndex((company) => value === "all" || company.group === value);
                setActiveCompany(Math.max(0, firstMatch));
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="portfolio-console reveal">
          <div className="portfolio-directory" role="group" aria-label="Portfolio company selector">
            <div className="portfolio-directory-label">
              <span>Company</span><span>Field</span><span aria-hidden="true">Select</span>
            </div>
            {visibleCompanies.map(({ company, index }, visibleIndex) => (
              <button
                key={company.name}
                type="button"
                className={selectedCompany?.index === index ? "portfolio-directory-row is-active" : "portfolio-directory-row"}
                onMouseEnter={() => setActiveCompany(index)}
                onFocus={() => setActiveCompany(index)}
                onClick={() => setActiveCompany(index)}
                aria-pressed={selectedCompany?.index === index}
              >
                <span className="portfolio-row-number">{String(visibleIndex + 1).padStart(2, "0")}</span>
                <strong>{company.name}</strong>
                <span>{company.category}</span>
                <i aria-hidden="true">↗</i>
              </button>
            ))}
          </div>

          {selectedCompany ? (
            <article
              className="portfolio-stage"
              style={{ "--company-index": selectedCompany.index } as CSSProperties}
              aria-live="polite"
            >
              <div className="portfolio-stage-field" aria-hidden="true">
                <span className="portfolio-stage-ring ring-a" />
                <span className="portfolio-stage-ring ring-b" />
                <span className="portfolio-stage-ring ring-c" />
                <span className="portfolio-stage-trace trace-a" />
                <span className="portfolio-stage-trace trace-b" />
                <i className="portfolio-stage-node node-a" />
                <i className="portfolio-stage-node node-b" />
                <i className="portfolio-stage-node node-c" />
              </div>
              <div className="portfolio-stage-top">
                <span>ACTIVE COMPANY</span>
                <span>{String(selectedCompany.index + 1).padStart(2, "0")} / {String(portfolio.length).padStart(2, "0")}</span>
              </div>
              <div className="portfolio-stage-content" key={selectedCompany.company.name}>
                <a
                  className="portfolio-stage-logo"
                  href={selectedCompany.company.website}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Visit ${selectedCompany.company.name}`}
                >
                  <Image
                    src={selectedCompany.company.logo}
                    alt={`${selectedCompany.company.name} logo`}
                    width={660}
                    height={260}
                    priority={selectedCompany.index === 0}
                  />
                </a>
                <div className="portfolio-stage-copy">
                  <div>
                    <span>{selectedCompany.company.category}</span>
                     <span>PORTFOLIO COMPANY</span>
                  </div>
                  <h3>{selectedCompany.company.name}</h3>
                   <p>{selectedCompany.company.description}</p>
                   {selectedCompany.company.validation ? <p>{selectedCompany.company.validation}</p> : null}
                  <a href={selectedCompany.company.website} target="_blank" rel="noreferrer">
                    Visit company <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
              <div className="portfolio-stage-progress" aria-hidden="true">
                <span style={{ width: `${((selectedCompany.index + 1) / portfolio.length) * 100}%` }} />
              </div>
            </article>
          ) : null}
        </div>
      </section>

      <section className="team section-sage" id="team">
        <div className="section-index reveal"><span>05</span><p>Team</p></div>
        <div className="team-heading reveal">
          <h2>qFund<br />investment team.</h2>
          <p>Managing Partners Liav Ben Rubi and Dana Taigman Koren, with Principal Liron Ben Zaken.</p>
        </div>
        <div className="team-grid">
          {team.map((person, index) => (
            <article className="team-card reveal" data-tilt key={person.name}>
              <a
                className="team-portrait"
                href={person.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label={`${person.name} on LinkedIn`}
              >
                <span className="portrait-grid" aria-hidden="true" />
                <Image src={person.image} alt={person.name} width={460} height={670} />
                <small>0{index + 1} · LINKEDIN ↗</small>
              </a>
              <div className="team-info">
                <h3>{person.name}</h3><p>{person.role}</p>
                {person.bio ? <span>{person.bio}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="signals section-dark" id="investment-criteria">
        <div className="section-index reveal"><span>06</span><p>Investment thesis</p></div>
        <div className="signals-heading reveal">
          <div>
            <h2>What qFund<br />looks for.</h2>
            <Link className="text-link route-link inverted" href="/thesis/">Read the thesis <span>↗</span></Link>
          </div>
          <p>Founders, Deep Tech, and market — three requirements, one investment discipline.</p>
        </div>
      </section>

      <section className="portfolio section-sage" id="news">
        <div className="section-index reveal"><span>07</span><p>News and activity</p></div>
        <div className="portfolio-heading reveal">
          <div>
            <h2>qFund<br />in motion.</h2>
            <Link className="text-link route-link" href="/news/">View all activity <span>↗</span></Link>
          </div>
          <p>Meetings, ecosystem activity, and venture delegations supporting Israeli-related Deep Tech founders.</p>
        </div>
        <div className="pattern-grid three-up">
          {newsItems.slice(0, 3).map((item, index) => (
            <article className="pattern-card reveal" key={`${item.date}-${item.title}`}>
              <span>{String(index + 1).padStart(2, "0")} · {item.tag.toUpperCase()} · {formatNewsDate(item.date).toUpperCase()}</span>
              <h3>{item.title}</h3>
              <p>{item.blurb}</p>
              <i aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-field" aria-hidden="true" />
        <div className="section-index reveal"><span>08</span><p>Contact qFund</p></div>
        <div className="contact-copy reveal">
          <p className="eyebrow">BACKING DEEP TECH FOUNDERS</p>
          <h2>Building an<br /><em>Israeli-related Deep Tech company?</em></h2>
          <Link href="/contact/" data-magnetic>
            <span>Contact qFund</span><i aria-hidden="true">↗</i>
          </Link>
        </div>
        <footer>
          <BrandMark />
          <div><span>Arik Einstein 3 · Herzliya, Israel</span><a href="mailto:info@qfund.io">info@qfund.io</a></div>
          <BackToTop />
          <div><a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a><span>© {new Date().getFullYear()} qFund</span></div>
        </footer>
      </section>
    </main>
  );
}
