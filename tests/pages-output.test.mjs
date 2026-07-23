import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputUrl = new URL("../dist/", import.meta.url);
const canonicalOutputUrl = new URL("../out/", import.meta.url);
const legacyClientOutputUrl = new URL("../dist/client/", import.meta.url);

async function readHome() {
  return readFile(new URL("index.html", outputUrl), "utf8");
}

test("exports a Cloudflare Pages entry document", async () => {
  const html = await readHome();

  assert.match(html, /<title>qFund \| Funding the Deep Future of Technology<\/title>/i);
  assert.match(html, /Funding the/);
  assert.match(html, /deep future/);
  assert.match(html, /Quantum computing/);
  assert.match(html, /Qedma/);
  assert.match(html, /Liav Ben Rubi/);
  assert.match(html, /href="\/founders\/"/);
  assert.match(html, /href="\/quantum-hub\/"/);
  assert.match(html, /href="\/contact\/"/);
  assert.match(html, /info@qfund\.io/);
  assert.match(html, /og-motion\.png/);
});

test("publishes the required static assets", async () => {
  await access(new URL("404.html", outputUrl));
  await access(new URL("og-motion.png", outputUrl));
  await access(new URL("qfund-logo.png", outputUrl));
  await access(new URL("qfund-logo.jpg", outputUrl));
  await access(new URL("qfund-field.png", outputUrl));
  await access(new URL("team/liav-ben-rubi.webp", outputUrl));
  await access(new URL("team/dana-taigman-koren.webp", outputUrl));
  await access(new URL("team/liron-ben-zaken.png", outputUrl));
  await access(new URL("portfolio/qedma.webp", outputUrl));

  const html = await readHome();
  const stylesheet = html.match(/href="([^"]+\.css)"/i)?.[1];
  const script = html.match(/src="([^"]+\.js)"/i)?.[1];

  assert.ok(stylesheet, "exported page should reference a stylesheet");
  assert.ok(script, "exported page should reference a JavaScript bundle");
  assert.match(html, /src="\/qfund-logo\.png"/);
  await access(new URL(stylesheet.replace(/^\//, ""), outputUrl));
  await access(new URL(script.replace(/^\//, ""), outputUrl));
});

test("supports the common Cloudflare Pages output-directory presets", async () => {
  await access(new URL("index.html", canonicalOutputUrl));
  await access(new URL("index.html", outputUrl));
  await access(new URL("index.html", legacyClientOutputUrl));
});

test("exports the source-backed editorial routes", async () => {
  const [thesis, companies, founders, platform, contact] = await Promise.all([
    readFile(new URL("thesis/index.html", outputUrl), "utf8"),
    readFile(new URL("companies/index.html", outputUrl), "utf8"),
    readFile(new URL("founders/index.html", outputUrl), "utf8"),
    readFile(new URL("quantum-hub/index.html", outputUrl), "utf8"),
    readFile(new URL("contact/index.html", outputUrl), "utf8"),
  ]);

  assert.match(thesis, /<title>Investment Thesis \| qFund<\/title>/i);
  assert.match(thesis, /Investment criteria/);
  assert.match(thesis, /Strategic focus/);
  assert.match(thesis, /class="thesis-conviction-field reveal is-visible"/);
  assert.doesNotMatch(thesis, /class="thesis-hero-system/);
  assert.equal((thesis.match(/class="full-test reveal"/g) ?? []).length, 3);
  assert.match(companies, /<title>Portfolio Companies \| qFund<\/title>/i);
  assert.match(companies, /Company directory/);
  assert.match(companies, /Qedma/);
  assert.match(companies, /https:\/\/www\.qedma\.com\//);
  assert.match(founders, /<title>For Founders \| qFund<\/title>/i);
  assert.match(founders, /How qFund evaluates/);
  assert.match(founders, /Value creation/);
  assert.equal((founders.match(/class="conversation-layer reveal"/g) ?? []).length, 3);
  assert.match(platform, /<title>qFund × Quantum Hub \| qFund<\/title>/i);
  assert.match(platform, /Deal flow activity/);
  assert.match(platform, /3,250/);
  assert.match(contact, /<title>Contact qFund \| Deep Tech Venture Capital<\/title>/i);
  assert.match(contact, /Tell us what/);
  assert.match(contact, /info@qfund\.io/);
  assert.match(contact, /Arik Einstein 3/);
});

test("links every team portrait and portfolio logo to its verified destination", async () => {
  const [home, companies] = await Promise.all([
    readHome(),
    readFile(new URL("companies/index.html", outputUrl), "utf8"),
  ]);

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
    assert.match(companies, new RegExp(`href="${website.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
  }
});

test("serves portfolio and team images directly in the static export", async () => {
  const [home, companies] = await Promise.all([
    readFile(new URL("index.html", outputUrl), "utf8"),
    readFile(new URL("companies/index.html", outputUrl), "utf8"),
  ]);
  const rendered = `${home}\n${companies}`;

  assert.doesNotMatch(rendered, /\/_next\/image\//);
  assert.match(home, /src="\/team\/liav-ben-rubi\.webp"/);
  assert.match(home, /src="\/team\/dana-taigman-koren\.webp"/);
  assert.match(home, /src="\/team\/liron-ben-zaken\.png"/);

  for (const company of [
    "element-security",
    "commcrete",
    "skapion",
    "oraqon",
    "qedma",
    "actasys",
    "particle",
    "signal-edge",
    "litevision",
    "quamcore",
  ]) {
    assert.match(rendered, new RegExp(`src="/portfolio/${company}\\.webp"`));
  }
});

test("does not publish the superseded provisional narrative", async () => {
  const pages = await Promise.all(
    ["index.html", "thesis/index.html", "companies/index.html", "founders/index.html", "quantum-hub/index.html", "contact/index.html"]
      .map((path) => readFile(new URL(path, outputUrl), "utf8")),
  );
  const rendered = pages.join("\n");

  for (const phrase of [
    "Technical truth becomes economic leverage",
    "Proof, not prediction",
    "Questions worth pursuing before consensus",
    "Quantum utility arrives before fault tolerance",
    "Calibrating frontier systems",
  ]) {
    assert.doesNotMatch(rendered, new RegExp(phrase, "i"));
  }
  assert.doesNotMatch(rendered, /href="\/field-notes\/"/i);
});
