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
  assert.match(html, /Quantum systems/);
  assert.match(html, /Qedma/);
  assert.match(html, /Liav Ben Rubi/);
  assert.match(html, /The long scroll is/);
  assert.match(html, /href="\/founders\/"/);
  assert.match(html, /info@qfund\.io/);
  assert.match(html, /og\.png/);
});

test("publishes the required static assets", async () => {
  await access(new URL("404.html", outputUrl));
  await access(new URL("og.png", outputUrl));
  await access(new URL("qfund-field.png", outputUrl));

  const html = await readHome();
  const stylesheet = html.match(/href="([^"]+\.css)"/i)?.[1];
  const script = html.match(/src="([^"]+\.js)"/i)?.[1];

  assert.ok(stylesheet, "exported page should reference a stylesheet");
  assert.ok(script, "exported page should reference a JavaScript bundle");
  await access(new URL(stylesheet.replace(/^\//, ""), outputUrl));
  await access(new URL(script.replace(/^\//, ""), outputUrl));
});

test("supports the common Cloudflare Pages output-directory presets", async () => {
  await access(new URL("index.html", canonicalOutputUrl));
  await access(new URL("index.html", outputUrl));
  await access(new URL("index.html", legacyClientOutputUrl));
});

test("exports the expanded editorial routes", async () => {
  const [thesis, companies, founders, notes] = await Promise.all([
    readFile(new URL("thesis/index.html", outputUrl), "utf8"),
    readFile(new URL("companies/index.html", outputUrl), "utf8"),
    readFile(new URL("founders/index.html", outputUrl), "utf8"),
    readFile(new URL("field-notes/index.html", outputUrl), "utf8"),
  ]);

  assert.match(thesis, /<title>Investment Thesis \| qFund<\/title>/i);
  assert.match(thesis, /Technical truth/);
  assert.match(thesis, /The four tests/);
  assert.match(companies, /<title>Companies \| qFund<\/title>/i);
  assert.match(companies, /Company directory/);
  assert.match(companies, /Qedma/);
  assert.match(founders, /<title>For Founders \| qFund<\/title>/i);
  assert.match(founders, /Build the company/);
  assert.match(founders, /How evidence compounds/);
  assert.match(notes, /<title>Field Notes \| qFund<\/title>/i);
  assert.match(notes, /Questions worth pursuing/);
  assert.match(notes, /Quantum utility arrives before fault tolerance/);
});
