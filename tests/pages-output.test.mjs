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

  assert.match(html, /<title>qFund \| Early-Stage Deep Tech Venture Capital<\/title>/i);
  assert.match(html, /Funding the/);
  assert.match(html, /deep future/);
  assert.match(html, /Pre-seed/);
  assert.match(html, /Series A/);
  assert.match(html, /Deep Tech/);
  assert.match(html, /Pre-seed to Series A/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="industries"/);
  assert.match(html, /id="approach"/);
  assert.match(html, /id="portfolio"/);
  assert.match(html, /id="team"/);
  assert.match(html, /id="news"/);
  assert.match(html, /Quantum computing/);
  assert.match(html, /Qedma/);
  assert.match(html, /Liav Ben Rubi/);
  assert.match(html, /class="qf-q-arrow-flight"/);
  assert.match(html, /class="qf-fund-reveal"/);
  assert.equal((html.match(/class="qf-paper-person"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /qf-joined-hands|qf-person-arm/);
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
    access(new URL("qfund-q-base-hd.png", outputUrl)),
    access(new URL("qfund-q-arrow-hd.png", outputUrl)),
    access(new URL("qfund-fund-hd.png", outputUrl)),
    access(new URL("team/liav-ben-rubi-hd.webp", outputUrl)),
    access(new URL("team/dana-taigman-koren-hd.webp", outputUrl)),
    access(new URL("team/liron-ben-zaken-hd.webp", outputUrl)),
    access(new URL("portfolio/qedma.webp", outputUrl)),
    access(new URL("focus/quantum-computing.jpg", outputUrl)),
    access(new URL("focus/defense.jpg", outputUrl)),
    access(new URL("focus/energy.jpg", outputUrl)),
    access(new URL("focus/advanced-industry.jpg", outputUrl)),
    access(new URL("focus/semiconductors.jpg", outputUrl)),
    access(new URL("focus/advanced-electronics.jpg", outputUrl)),
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

  assert.match(news, /<title>News and Activity \| qFund<\/title>/i);
  assert.match(news, /qFund in New York/);
  assert.match(news, /VC delegation to Japan/);
  assert.match(news, /class="qf-news-art/);
  assert.match(contact, /<title>Contact qFund \| Deep Tech Venture Capital<\/title>/i);
  assert.match(contact, /Tell us what you are/);
  assert.match(contact, /Pre-seed to Series A/);
  assert.match(contact, /info@qfund\.io/);
  assert.doesNotMatch(contact, /Begin the|contact-dialogue/i);

  for (const route of ["thesis", "companies", "founders"]) {
    await assert.rejects(access(new URL(`${route}/index.html`, outputUrl)));
  }
});

test("renders the right-side section rail and three latest news stories", async () => {
  const home = await readHome();
  assert.match(home, /class="qf-section-rail"/);
  assert.match(home, /aria-label="Go to About"/);
  assert.match(home, /aria-label="Go to Industries"/);
  assert.match(home, /aria-label="Go to Our approach"/);
  assert.equal((home.match(/class="qf-news-card qf-reveal"/g) ?? []).length, 3);
  assert.match(home, />View all news/);
});

test("keeps the logo turn and word reveal synchronized", async () => {
  const css = await readFile(new URL("../app/revamp.css", import.meta.url), "utf8");
  const arrowMotion = css.match(/@keyframes qf-arrow-flight\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";
  const wordReveal = css.match(/@keyframes qf-fund-uncover\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

  assert.match(arrowMotion, /rotateY\(360deg\)/);
  assert.doesNotMatch(arrowMotion, /rotateX\(/);
  assert.match(arrowMotion, /52%/);
  assert.match(wordReveal, /33\.99%/);
  assert.match(wordReveal, /52%/);
  assert.match(wordReveal, /73\.4%/);
});

test("links every team portrait and portfolio logo to its destination", async () => {
  const home = await readHome();
  for (const linkedin of [
    "https://www.linkedin.com/in/liav-ben-rubi/",
    "https://www.linkedin.com/in/danataigmankoren/",
    "https://www.linkedin.com/in/liron-ben-zaken/",
  ]) {
    assert.match(home, new RegExp(`href="${linkedin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  }

  for (const website of [
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
  ]) {
    assert.match(home, new RegExp(`href="${website.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  }
});

test("uses direct image URLs and one back-to-top control per page", async () => {
  const pages = await Promise.all(
    ["index.html", "news/index.html", "contact/index.html"].map((path) => readFile(new URL(path, outputUrl), "utf8")),
  );
  const rendered = pages.join("\n");

  assert.doesNotMatch(rendered, /\/_next\/image\//);
  assert.match(pages[0], /src="\/team\/liav-ben-rubi-hd\.webp"/);
  assert.match(pages[0], /src="\/portfolio\/element-security\.webp"/);
  assert.match(pages[0], /src="\/focus\/advanced-electronics\.jpg"/);

  for (const html of pages) {
    assert.equal((html.match(/aria-label="Back to the top"/g) ?? []).length, 1);
  }
});
