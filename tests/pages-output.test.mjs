import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputUrl = new URL("../dist/", import.meta.url);
const canonicalOutputUrl = new URL("../out/", import.meta.url);
const legacyClientOutputUrl = new URL("../dist/client/", import.meta.url);

async function readHome() {
  return readFile(new URL("index.html", outputUrl), "utf8");
}

test("exports the unified qFund homepage", async () => {
  const html = await readHome();

  assert.match(html, /<title>q fund \| Early-Stage Deep Tech Venture Capital<\/title>/i);
  assert.match(html, /Funding the/);
  assert.match(html, /deep future/);
  assert.match(html, /Pre-seed/);
  assert.match(html, /Series A/);
  assert.match(html, /Deep Tech/);
  assert.match(html, /Pre-seed to Series A/);
  assert.match(html, /id="top"/);
  assert.match(html, /id="thesis"/);
  assert.doesNotMatch(html, /id="about"|id="industries"/);
  assert.doesNotMatch(html, /Our approach|id="approach"|href="#approach"/i);
  assert.match(html, /id="portfolio"/);
  assert.match(html, /id="team"/);
  assert.match(html, /id="news"/);
  const orderedSections = ["top", "portfolio", "team", "thesis", "news"].map((id) => html.indexOf(`id="${id}"`));
  assert.ok(orderedSections.every((position) => position >= 0));
  assert.deepEqual(orderedSections, [...orderedSections].sort((a, b) => a - b));
  assert.match(html, /Quantum Computing/);
  assert.match(html, /Qedma/);
  assert.match(html, /Liav Ben Rubi/);
  assert.match(html, /class="qf-frontier-field"/);
  assert.match(html, /class="qf-frontier-canvas"/);
  assert.match(html, /class="qf-frontier-core"/);
  assert.match(html, /class="qf-frontier-q"/);
  assert.match(html, /class="qf-frontier-arrow"/);
  assert.doesNotMatch(html, /qf-logo-field|qf-assembly-core|qf-lockup-track|qf-q-arrow-flight|qf-fund-reveal|qf-final-arrow-mask/);
  assert.doesNotMatch(html, /qfund-(?:q-base|q-arrow|fund)-hd\.png/);
  assert.doesNotMatch(html, /class="qf-handshake"/);
  assert.doesNotMatch(html, /qf-joined-hands|qf-person-arm|qf-paper-chain|qf-paper-person/);
  assert.doesNotMatch(html, /class="qf-team-link"/);
  assert.match(html, /href="\/news\/"/);
  assert.match(html, /href="\/contact\/"/);
  assert.doesNotMatch(html, /href="\/(?:thesis|companies|founders)\/"/);
  assert.doesNotMatch(html, /Deep Tech founders|tech founders/i);
  assert.doesNotMatch(html, /board member|board observer|sits on the boards/i);
});

test("publishes the required static assets", async () => {
  await Promise.all([
    access(new URL("404.html", outputUrl)),
    access(new URL("og-motion.png", outputUrl)),
    access(new URL("qfund-logo-light.png", outputUrl)),
    access(new URL("qfund-logo-official-hd.png", outputUrl)),
    access(new URL("qfund-intro-logo-hd.png", outputUrl)),
    access(new URL("qfund-intro-logo-4k.png", outputUrl)),
    access(new URL("qfund-q-base-hd.png", outputUrl)),
    access(new URL("qfund-q-arrow-hd.png", outputUrl)),
    access(new URL("qfund-fund-hd.png", outputUrl)),
    access(new URL("qfund-q-base-vector.svg", outputUrl)),
    access(new URL("qfund-q-arrow-vector.svg", outputUrl)),
    access(new URL("qfund-q-base-a7e10fa-padded.svg", outputUrl)),
    access(new URL("qfund-q-arrow-a7e10fa-padded.svg", outputUrl)),
    access(new URL("qfund-fund-vector.svg", outputUrl)),
    access(new URL("team/liav-ben-rubi-hd.webp", outputUrl)),
    access(new URL("team/dana-taigman-koren-hd.webp", outputUrl)),
    access(new URL("team/liron-ben-zaken-hd.webp", outputUrl)),
    access(new URL("portfolio/skapion-hd.svg", outputUrl)),
    access(new URL("portfolio/oraqon-hd.png", outputUrl)),
    access(new URL("portfolio/qedma-hd.jpg", outputUrl)),
    access(new URL("portfolio/particle-hd.svg", outputUrl)),
    access(new URL("portfolio/eshtech-color.svg", outputUrl)),
    access(new URL("focus/quantum-computing.jpg", outputUrl)),
    access(new URL("focus/defense.jpg", outputUrl)),
    access(new URL("focus/energy.jpg", outputUrl)),
    access(new URL("focus/advanced-industry.jpg", outputUrl)),
    access(new URL("focus/semiconductors.jpg", outputUrl)),
    access(new URL("focus/advanced-electronics.jpg", outputUrl)),
    access(new URL("news/skapion-drone-swarm.webp", outputUrl)),
    access(new URL("news/esh-tech-dronelight.webp", outputUrl)),
    access(new URL("news/litevision-drone-imaging.webp", outputUrl)),
    access(new URL("news/commcrete-stardust-flipper.webp", outputUrl)),
    access(new URL("news/qedma-quantum-computing.webp", outputUrl)),
  ]);

  const html = await readHome();
  const stylesheets = [...html.matchAll(/href="([^"]+\.css)"/gi)].map((match) => match[1]);
  const script = html.match(/src="([^"]+\.js)"/i)?.[1];
  assert.ok(stylesheets.length > 0, "exported page should reference a stylesheet");
  assert.ok(script, "exported page should reference a JavaScript bundle");
  await Promise.all(stylesheets.map((href) => access(new URL(href.replace(/^\//, ""), outputUrl))));
  await access(new URL(script.replace(/^\//, ""), outputUrl));
});

test("supports the common Cloudflare Pages output-directory presets", async () => {
  await Promise.all([
    access(new URL("index.html", canonicalOutputUrl)),
    access(new URL("index.html", outputUrl)),
    access(new URL("index.html", legacyClientOutputUrl)),
  ]);
});

test("publishes only the intended secondary pages", async () => {
  const [news, contact] = await Promise.all([
    readFile(new URL("news/index.html", outputUrl), "utf8"),
    readFile(new URL("contact/index.html", outputUrl), "utf8"),
  ]);

  assert.match(news, /<title>News and Activity \| q fund<\/title>/i);
  assert.match(news, /Skapion/);
  assert.match(news, /Esh-Tech/);
  assert.match(news, /LiteVision-EO/);
  assert.match(news, /Commcrete/);
  assert.match(news, /QEDMA/);
  assert.equal((news.match(/class="qf-news-archive-card qf-reveal"/g) ?? []).length, 5);
  assert.match(news, /class="qf-news-art/);
  assert.match(contact, /<title>Contact q fund \| Deep Tech Venture Capital<\/title>/i);
  assert.match(contact, /Tell us what you are/);
  assert.match(contact, /Pre-seed to Series A/);
  assert.match(contact, /info@qfund\.io/);
  assert.doesNotMatch(contact, /Begin the|contact-dialogue/i);

  for (const route of ["thesis", "companies", "founders"]) {
    await assert.rejects(access(new URL(`${route}/index.html`, outputUrl)));
  }
});

test("exports all five verified qFund news articles with their approved images", async () => {
  const records = [
    ["qfund-participates-skapion-36m-seed", "Skapion", "skapion-drone-swarm.webp"],
    ["qfund-participates-esh-tech-18m-round", "Esh-Tech", "esh-tech-dronelight.webp"],
    ["qfund-invests-litevision-8m-seed", "LiteVision-EO", "litevision-drone-imaging.webp"],
    ["qfund-backed-commcrete-29m-funding", "Commcrete", "commcrete-stardust-flipper.webp"],
    ["qfund-qedma-26m-series-a", "QEDMA", "qedma-quantum-computing.webp"],
  ];

  for (const [slug, company, image] of records) {
    const article = await readFile(new URL(`news/${slug}/index.html`, outputUrl), "utf8");
    assert.match(article, new RegExp(company));
    assert.match(article, new RegExp(`/news/${image}`));
    assert.match(article, /class="qf-news-article-body"/);
    assert.doesNotMatch(article, /Quantum Hub/i);
  }
});

test("renders the header section ruler without the approach section and three latest news stories", async () => {
  const home = await readHome();
  assert.match(home, /class="qf-section-ruler"/);
  assert.match(home, /aria-label="Go to About"/);
  assert.match(home, /aria-label="Go to Thesis"/);
  assert.doesNotMatch(home, /aria-label="Go to Home"|aria-label="Go to Industries"/);
  assert.doesNotMatch(home, /Our approach|id="approach"|href="#approach"/i);
  assert.equal((home.match(/class="qf-news-card qf-reveal"/g) ?? []).length, 3);
  assert.match(home, />View all news/);
});

test("renders all eight thesis chapters with all eight supplied models", async () => {
  const home = await readHome();

  assert.match(home, /id="thesis"/);
  assert.match(home, /data-carousel-interval="3000"/);
  assert.match(home, /Conviction beyond capital/);
  assert.match(home, /data-industry-chapters="8"/);
  assert.match(home, /data-industry-models-supplied="8"/);
  assert.match(home, /data-industry-models-pending="0"/);
  assert.equal((home.match(/data-industry-chapter="true"/g) ?? []).length, 8);
  assert.equal((home.match(/data-model-status="supplied"/g) ?? []).length, 8);
  assert.equal((home.match(/data-model-status="pending"/g) ?? []).length, 0);

  for (const title of [
    "Quantum Computing",
    "Robotics and Drones",
    "Data Centers",
    "Space",
    "Particle Accelerators",
    "Cyber &amp; Attack Surfaces",
    "Sensing, RF, Optics &amp; Quantum Intelligence",
    "Geothermal &amp; Nuclear Energy",
  ]) {
    assert.match(home, new RegExp(title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(home, /id="industry-cyber-and-attack-surfaces"[\s\S]*?data-model-status="supplied"/);
  assert.match(home, /id="industry-sensing-rf-optics-and-quantum-intelligence"[\s\S]*?data-model-status="supplied"/);
  assert.doesNotMatch(home, /MODEL MISSING|TODO|Asset not found/i);
});

test("ships the interactive frontier field without the discarded logo assembly", async () => {
  const [html, css] = await Promise.all([
    readHome(),
    readFile(new URL("../app/revamp.css", import.meta.url), "utf8"),
  ]);

  assert.match(html, /class="qf-frontier-field"/);
  assert.match(html, /class="qf-frontier-canvas"/);
  // Two fields ship: the hero's, and the clone the opening reveal flies into it.
  assert.equal((html.match(/class="qf-frontier-field"/g) ?? []).length, 2);
  assert.equal((html.match(/class="qf-frontier-depth/g) ?? []).length, 4);
  assert.match(html, /class="qf-intro" aria-hidden="true"/);
  assert.match(html, /class="qf-intro-backdrop"/);
  assert.match(html, /class="qf-intro-stage"/);
  assert.match(css, /html\.qf-intro-active \.qf-intro/);
  assert.match(css, /@keyframes qf-intro-rise/);
  assert.match(css, /@keyframes qf-frontier-core/);
  assert.match(css, /@keyframes qf-frontier-orbit/);
  assert.match(css, /qfund-q-base-a7e10fa-padded\.svg/);
  assert.match(css, /qfund-q-arrow-a7e10fa-padded\.svg/);
  assert.doesNotMatch(html, /qfund-intro-logo-(?:hd|4k)\.png/);
  assert.doesNotMatch(css, /@keyframes qf-(?:lockup-cycle|q-settle|arrow-flight|fund-uncover|final-arrow|logo-orbit)/);
  assert.doesNotMatch(css, /\.qf-(?:logo-field|assembly-core|lockup-track|q-arrow-flight|fund-reveal|final-arrow-mask)/);
});

test("links every team portrait and renders the accessible portfolio grid", async () => {
  const home = await readHome();
  for (const linkedin of [
    "https://www.linkedin.com/in/liav-ben-rubi/",
    "https://www.linkedin.com/in/danataigmankoren/",
    "https://www.linkedin.com/in/liron-ben-zaken/",
  ]) {
    assert.match(home, new RegExp(`href="${linkedin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  }
  assert.match(home, /dana-taigman-koren-portrait-2026\.png/);
  assert.doesNotMatch(home, /Liav has over 14 years|Dana has more than 18 years|Liron is a Principal/);

  assert.equal((home.match(/class="qf-portfolio-card"/g) ?? []).length, 11);
  assert.equal((home.match(/class="qf-portfolio-card"[^>]*href=/g) ?? []).length, 11);
  assert.doesNotMatch(home, /role="tab"|portfolio-company-panel/);
  assert.match(home, /src="\/portfolio\/skapion-hd\.svg"/);
  assert.match(home, /src="\/portfolio\/oraqon-hd\.png"/);
  assert.match(home, /src="\/portfolio\/qedma-hd\.jpg"/);
  assert.match(home, /src="\/portfolio\/actasys\.webp"/);
  assert.match(home, /src="\/portfolio\/particle-hd\.svg"/);
  assert.match(home, /src="\/portfolio\/eshtech-color\.svg"/);
  assert.match(home, /Pulsed-laser hard-kill effector/);
  for (const companyUrl of [
    "https://element.security/",
    "https://www.commcrete.com/",
    "https://www.skapion.com/",
    "https://www.oraqon.com/",
    "https://www.qedma.com/",
    "https://www.actasysinc.com/",
    "https://particle-lab.com/",
    "https://signal-edge.com/",
    "https://litevision-eo.com/",
    "https://www.quamcore.com/",
    "https://www.esh-tech.com/",
  ]) {
    assert.match(home, new RegExp(`href="${companyUrl.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}"`));
  }
});

test("uses direct image URLs and one back-to-top control per page", async () => {
  const pages = await Promise.all(
    ["index.html", "news/index.html", "contact/index.html"].map((path) => readFile(new URL(path, outputUrl), "utf8")),
  );
  const rendered = pages.join("\n");

  assert.doesNotMatch(rendered, /\/_next\/image\//);
  assert.match(pages[0], /src="\/team\/liav-ben-rubi-hd\.webp"/);
  assert.match(pages[0], /src="\/portfolio\/element-security-color\.svg"/);
  assert.match(pages[0], /src="\/focus\/advanced-electronics\.jpg"/);
  assert.match(pages[0], /src="\/news\/skapion-drone-swarm\.webp"/);
  assert.match(pages[1], /src="\/news\/qedma-quantum-computing\.webp"/);

  for (const html of pages) {
    assert.equal((html.match(/aria-label="Back to the top"/g) ?? []).length, 1);
  }
});
