import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const rootUrl = new URL("../", import.meta.url);
const canonicalOutputUrl = new URL("../out/", import.meta.url);

test("keeps the repository-root Pages snapshot current", async () => {
  const [rootHtml, canonicalHtml] = await Promise.all([
    readFile(new URL("index.html", rootUrl), "utf8"),
    readFile(new URL("index.html", canonicalOutputUrl), "utf8"),
  ]);

  assert.equal(
    rootHtml,
    canonicalHtml,
    "run npm run release:pages-root before publishing",
  );
});

test("repository-root snapshot includes every required public asset", async () => {
  const html = await readFile(new URL("index.html", rootUrl), "utf8");
  const stylesheet = html.match(/href="([^"]+\.css)"/i)?.[1];
  const script = html.match(/src="([^"]+\.js)"/i)?.[1];

  assert.ok(stylesheet, "root page should reference a stylesheet");
  assert.ok(script, "root page should reference a JavaScript bundle");

  await Promise.all([
    access(new URL("404.html", rootUrl)),
    access(new URL("og.png", rootUrl)),
    access(new URL("qfund-field.png", rootUrl)),
    access(new URL("team/liron-ben-zaken.png", rootUrl)),
    access(new URL("portfolio/quamcore.webp", rootUrl)),
    access(new URL(stylesheet.replace(/^\//, ""), rootUrl)),
    access(new URL(script.replace(/^\//, ""), rootUrl)),
  ]);
});

test("repository-root snapshot includes every source-backed route", async () => {
  for (const route of ["thesis", "companies", "founders", "platform"]) {
    const [rootHtml, canonicalHtml] = await Promise.all([
      readFile(new URL(`${route}/index.html`, rootUrl), "utf8"),
      readFile(new URL(`${route}/index.html`, canonicalOutputUrl), "utf8"),
    ]);
    assert.equal(rootHtml, canonicalHtml, `${route} root snapshot should be current`);
  }
});
