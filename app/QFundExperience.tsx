"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import BrandMark from "./components/BrandMark";
import { filters, focusAreas, portfolio, team, underwritingTests } from "./siteData";

export default function QFundExperience() {
  const [ready, setReady] = useState(false);
  const [loadValue, setLoadValue] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFocus, setActiveFocus] = useState(0);
  const [activeTest, setActiveTest] = useState(0);
  const [filter, setFilter] = useState("all");
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

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        const scroll = window.scrollY;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        root.style.setProperty("--page-progress", String(scroll / max));
        root.style.setProperty("--hero-shift", String(Math.min(1, scroll / window.innerHeight)));
        frame = 0;
      });
    };

    const onPointer = (event: PointerEvent) => {
      root.style.setProperty("--mx", event.clientX + "px");
      root.style.setProperty("--my", event.clientY + "px");
      if (cursorRef.current) {
        cursorRef.current.style.transform = "translate3d(" + event.clientX + "px," + event.clientY + "px,0)";
      }
    };

    const magneticNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]"));
    const magneticCleanup = magneticNodes.map((node) => {
      const move = (event: PointerEvent) => {
        if (reduced) return;
        const box = node.getBoundingClientRect();
        const x = (event.clientX - box.left - box.width / 2) * 0.16;
        const y = (event.clientY - box.top - box.height / 2) * 0.16;
        node.style.transform = "translate3d(" + x + "px," + y + "px,0)";
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
        node.style.setProperty("--card-x", String((px + 0.5) * 100) + "%");
        node.style.setProperty("--card-y", String((py + 0.5) * 100) + "%");
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
  const activeUnderwriting = underwritingTests[activeTest];

  return (
    <main className={ready ? "site is-ready" : "site is-loading"}>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <div className="preloader" aria-hidden={ready}>
        <div className="preloader-grid" />
        <div className="preloader-inner">
          <BrandMark />
          <p>Calibrating frontier systems</p>
          <div className="preloader-track"><span style={{ width: loadValue + "%" }} /></div>
          <span className="preloader-count">{String(loadValue).padStart(3, "0")}</span>
        </div>
      </div>

      <div className="cursor" ref={cursorRef} aria-hidden="true"><span /></div>
      <div className="scroll-progress" aria-hidden="true" />

      <header className="nav-shell">
        <a href="#top" className="nav-logo" aria-label="qFund home"><BrandMark /></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/thesis/">Thesis</Link>
          <Link href="/companies/">Companies</Link>
          <Link href="/founders/">Founders</Link>
          <Link href="/field-notes/">Field notes</Link>
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

      <div className={menuOpen ? "mobile-menu is-open" : "mobile-menu"}>
        <nav aria-label="Mobile navigation">
          {[["Thesis", "/thesis/"], ["Companies", "/companies/"], ["Founders", "/founders/"], ["Field notes", "/field-notes/"]].map(([label, href], index) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              <span>0{index + 1}</span>{label}
            </Link>
          ))}
        </nav>
        <a href="mailto:info@qfund.io">info@qfund.io ↗</a>
      </div>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-field" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-coordinates" aria-hidden="true">
          <span>32.1663° N</span><span>34.8433° E</span>
        </div>
        <div className="hero-content" id="main-content">
          <p className="eyebrow hero-eyebrow"><span /> EARLY-STAGE DEEP TECH · ISRAEL</p>
          <h1 id="hero-title" className="hero-title">
            <span className="line"><span>Funding the</span></span>
            <span className="line accent-line"><span>deep future</span></span>
            <span className="line"><span>of technology.</span></span>
          </h1>
          <div className="hero-bottom">
            <p>
              We partner with exceptional scientists and engineers turning hard-won breakthroughs into category-defining companies.
            </p>
            <a className="round-link" href="#explore" aria-label="Explore qFund" data-magnetic>
              <span>Explore</span><span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <div className="hero-status" aria-hidden="true">
          <span className="pulse-dot" /> SIGNAL ACQUIRED
        </div>
      </section>

      <section className="ticker" aria-label="Investment focus areas">
        <div className="ticker-track">
          {[...focusAreas, ...focusAreas].map((item, index) => (
            <span key={item.title + index}>{item.short}<i>✦</i></span>
          ))}
        </div>
      </section>

      <section className="page-gateway section-ink" id="explore">
        <div className="section-index reveal"><span>00</span><p>Explore qFund</p></div>
        <div className="gateway-heading reveal">
          <p className="eyebrow">GO DEEPER / FOUR DISTINCT SURFACES</p>
          <h2>The long scroll is<br />only the <em>entry point.</em></h2>
          <p>Move from the firm’s core belief to portfolio proof, the founder journey, and the technical signals shaping our attention.</p>
        </div>
        <div className="gateway-grid">
          <Link className="gateway-card gateway-thesis reveal" href="/thesis/" data-tilt>
            <div className="gateway-visual" aria-hidden="true">
              <span className="gateway-orbit orbit-outer" /><span className="gateway-orbit orbit-inner" /><i className="gateway-core">01</i>
            </div>
            <span>Investment thesis</span><h3>How we build conviction.</h3><p>Our premise, underwriting tests, proof path, and founder fit.</p><i className="gateway-arrow" aria-hidden="true">↗</i>
          </Link>
          <Link className="gateway-card gateway-companies reveal" href="/companies/" data-tilt>
            <div className="gateway-visual" aria-hidden="true">
              <span className="gateway-scan" /><span className="gateway-grid-field" /><i className="gateway-core">02</i>
            </div>
            <span>Company system</span><h3>Where belief becomes proof.</h3><p>A filterable portfolio and the shared architecture we seek.</p><i className="gateway-arrow" aria-hidden="true">↗</i>
          </Link>
          <Link className="gateway-card gateway-founders reveal" href="/founders/" data-tilt>
            <div className="gateway-visual" aria-hidden="true">
              <span className="gateway-path" /><b className="path-node pn-one" /><b className="path-node pn-two" /><b className="path-node pn-three" /><i className="gateway-core">03</i>
            </div>
            <span>For founders</span><h3>From breakthrough to company.</h3><p>What the first conversations examine and how evidence compounds.</p><i className="gateway-arrow" aria-hidden="true">↗</i>
          </Link>
          <Link className="gateway-card gateway-notes reveal" href="/field-notes/" data-tilt>
            <div className="gateway-visual gateway-wave" aria-hidden="true">
              {Array.from({ length: 15 }, (_, index) => <b key={index} style={{ "--bar-index": index } as CSSProperties} />)}
              <i className="gateway-core">04</i>
            </div>
            <span>Field notes</span><h3>Questions before consensus.</h3><p>Six active working theses and the signals we are watching.</p><i className="gateway-arrow" aria-hidden="true">↗</i>
          </Link>
        </div>
      </section>

      <section className="thesis section-light" id="thesis">
        <div className="section-index reveal"><span>01</span><p>Our thesis</p></div>
        <div className="thesis-statement reveal">
          <p className="eyebrow dark">BUILT BELOW THE APPLICATION LAYER</p>
          <h2>
            The most consequential companies are built where
            <em> science becomes infrastructure.</em>
          </h2>
        </div>
        <div className="thesis-grid">
          <div className="thesis-copy reveal">
            <p>
              qFund is an early-stage venture firm backing foundational technologies across compute, energy, autonomy, communications, and security.
            </p>
            <p>
              We are comfortable before the benchmarks are obvious—when technical truth, founder velocity, and market timing matter more than consensus.
            </p>
            <a className="text-link route-link" href="/thesis/">Read our full investment thesis <span>↗</span></a>
          </div>
          <div className="metrics reveal" aria-label="qFund investment approach">
            <article><strong>EARLY</strong><span>Pre-seed & seed</span></article>
            <article><strong>DEEP</strong><span>Science-led moats</span></article>
            <article><strong>GLOBAL</strong><span>Built from Israel</span></article>
          </div>
        </div>
      </section>

      <section className="underwrite section-sage" id="underwrite">
        <div className="section-index reveal"><span>02</span><p>What we underwrite</p></div>
        <div className="underwrite-layout">
          <div className="underwrite-intro reveal">
            <p className="eyebrow dark">CONVICTION BEFORE CONSENSUS</p>
            <h2>Four tests for<br /><em>nonlinear progress.</em></h2>
            <p>
              Deeptech risk cannot be reduced to a conventional growth dashboard. We look for evidence that science, engineering, economics, and team are beginning to reinforce one another.
            </p>
            <a className="text-link route-link" href="/thesis/">Enter the thesis <span>↗</span></a>
          </div>

          <div className="underwrite-console reveal">
            <div className="console-visual" aria-hidden="true">
              <span className="console-ring ring-one" />
              <span className="console-ring ring-two" />
              <span className="console-axis axis-x" />
              <span className="console-axis axis-y" />
              <span className="console-sweep" />
              <strong>{activeUnderwriting.code}</strong>
              <small>{activeUnderwriting.signal}</small>
            </div>
            <div className="underwrite-tests" role="list" aria-label="qFund underwriting tests">
              {underwritingTests.map((test, index) => (
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
        <div className="section-index reveal"><span>03</span><p>What we look for</p></div>
        <div className="focus-layout">
          <div className="focus-list reveal">
            <p className="eyebrow">SELECT A FIELD</p>
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
              <span className="orbit-core">Q/{active.code}</span>
            </div>
            <div className="focus-readout">
              <span className="signal">{active.signal}</span>
              <h3 key={active.title}>{active.title}</h3>
              <p key={active.text}>{active.text}</p>
              <div className="readout-line"><span style={{ width: ((activeFocus + 1) / focusAreas.length) * 100 + "%" }} /></div>
              <small>FIELD {active.code} / 0{focusAreas.length}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="portfolio section-ink" id="portfolio">
        <div className="section-index reveal"><span>04</span><p>Selected companies</p></div>
        <div className="portfolio-heading reveal">
          <div>
            <h2>Proof, not prediction.</h2>
            <a className="text-link route-link" href="/companies/">Explore all companies <span>↗</span></a>
          </div>
          <p>We are proud to be early partners to teams engineering what others still consider improbable.</p>
        </div>
        <div className="portfolio-filters reveal" role="group" aria-label="Filter portfolio companies">
          {filters.map(([value, label]) => (
            <button key={value} type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
        <div className="portfolio-grid">
          {portfolio.map((company, index) => {
            const visible = filter === "all" || filter === company.group;
            return (
              <article
                key={company.name}
                className={visible ? "portfolio-card reveal is-filtered-in" : "portfolio-card reveal is-filtered-out"}
                style={{ "--card-index": index } as CSSProperties}
                data-tilt
                aria-hidden={!visible}
              >
                <div className="card-visual" aria-hidden="true">
                  <span className="scan-line" /><span className="scan-node" />
                  <strong>{company.name.slice(0, 1)}</strong>
                </div>
                <div className="card-meta"><span>{company.category}</span><span>FIRST PARTNERED / {company.year}</span></div>
                <h3>{company.name}</h3>
                <p>{company.line}</p>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="method section-light" id="approach">
        <div className="section-index reveal"><span>05</span><p>How we partner</p></div>
        <div className="method-intro reveal">
          <p className="eyebrow dark">CAPITAL FOR NONLINEAR PROGRESS</p>
          <h2>Technical patience.<br />Commercial urgency.</h2>
        </div>
        <div className="method-steps">
          {[
            ["01", "See the truth early", "We dig into first principles, technical architecture, and the insight that makes a breakthrough defensible."],
            ["02", "Build the inflection", "We help translate technical milestones into the proof points that unlock customers, talent, and follow-on capital."],
            ["03", "Compound the advantage", "We stay close as deep technology crosses from laboratory truth to enduring global infrastructure."],
          ].map(([number, title, text]) => (
            <article className="method-step reveal" key={number}>
              <span>{number}</span><h3>{title}</h3><p>{text}</p><i aria-hidden="true">+</i>
            </article>
          ))}
        </div>
      </section>

      <section className="team section-sage" id="team">
        <div className="section-index reveal"><span>06</span><p>The team</p></div>
        <div className="team-heading reveal">
          <h2>Partners for the<br />hard parts.</h2>
          <p>A compact team built for direct, senior-level partnership from first meeting to global scale.</p>
        </div>
        <div className="team-grid">
          {team.map((person, index) => (
            <article className="team-card reveal" data-tilt key={person.name}>
              <div className="team-portrait" aria-hidden="true">
                <span className="portrait-grid" />
                <strong>{person.initials}</strong>
                <small>QF / 0{index + 1}</small>
              </div>
              <div className="team-info"><h3>{person.name}</h3><p>{person.role}</p><span>{person.focus}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="signals section-dark" id="insights">
        <div className="section-index reveal"><span>07</span><p>Signals we follow</p></div>
        <div className="signals-heading reveal">
          <div>
            <h2>Research at the edge<br />of what is investable.</h2>
            <a className="text-link route-link inverted" href="/field-notes/">Open field notes <span>↗</span></a>
          </div>
          <p>Working theses from the technologies and markets shaping the next industrial cycle.</p>
        </div>
        <div className="signal-list">
          {[
            ["Q/01", "Quantum utility arrives before fault tolerance", "Quantum"],
            ["I/02", "The thermal wall is now a systems opportunity", "Infrastructure"],
            ["A/03", "Autonomy moves from software into the physical stack", "Robotics"],
          ].map(([code, title, tag]) => (
            <a className="signal-row reveal" href={`/field-notes/#${code.toLowerCase().replace("/", "-")}`} key={code}>
              <span>{code}</span><h3>{title}</h3><small>{tag}</small><i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
      </section>

      <section className="contact" id="contact">
        <div className="contact-field" aria-hidden="true" />
        <div className="section-index reveal"><span>08</span><p>Build with us</p></div>
        <div className="contact-copy reveal">
          <p className="eyebrow">FOR FOUNDERS WORKING PAST THE OBVIOUS</p>
          <h2>Building the<br /><em>deep future?</em></h2>
          <a href="mailto:info@qfund.io" data-magnetic>
            <span>Tell us what you see</span><i aria-hidden="true">↗</i>
          </a>
        </div>
        <footer>
          <BrandMark />
          <div><span>Herzliya, Israel</span><a href="mailto:info@qfund.io">info@qfund.io</a></div>
          <div><a href="https://www.linkedin.com/company/q-fund" target="_blank" rel="noreferrer">LinkedIn ↗</a><span>© {new Date().getFullYear()} qFund</span></div>
        </footer>
      </section>
    </main>
  );
}
