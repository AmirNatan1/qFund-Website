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
  assert.equal(rootHtml, canonicalHtml, "run npm run release:pages-root before publishing");
});

test("repository-root snapshot includes every required public asset", async () => {
  const html = await readFile(new URL("index.html", rootUrl), "utf8");
  const stylesheets = [...html.matchAll(/href="([^"]+\.css)"/gi)].map((match) => match[1]);
  const script = html.match(/src="([^"]+\.js)"/i)?.[1];
  assert.ok(stylesheets.length > 0);
  assert.ok(script);

  await Promise.all([
    access(new URL("404.html", rootUrl)),
    access(new URL("qfund-logo-light.png", rootUrl)),
    access(new URL("qfund-logo-official-hd.png", rootUrl)),
    access(new URL("qfund-intro-logo-hd.png", rootUrl)),
    access(new URL("qfund-intro-logo-4k.png", rootUrl)),
    access(new URL("qfund-q-base-hd.png", rootUrl)),
    access(new URL("qfund-q-arrow-hd.png", rootUrl)),
    access(new URL("qfund-fund-hd.png", rootUrl)),
    access(new URL("qfund-q-base-vector.svg", rootUrl)),
    access(new URL("qfund-q-arrow-vector.svg", rootUrl)),
    access(new URL("qfund-q-base-a7e10fa-padded.svg", rootUrl)),
    access(new URL("qfund-q-arrow-a7e10fa-padded.svg", rootUrl)),
    access(new URL("qfund-fund-vector.svg", rootUrl)),
    access(new URL("team/liron-ben-zaken-hd.webp", rootUrl)),
    access(new URL("portfolio/skapion-hd.svg", rootUrl)),
    access(new URL("portfolio/oraqon-hd.png", rootUrl)),
    access(new URL("portfolio/qedma-hd.jpg", rootUrl)),
    access(new URL("portfolio/particle-hd.svg", rootUrl)),
    access(new URL("portfolio/quamcore-color.svg", rootUrl)),
    access(new URL("portfolio/eshtech-color.svg", rootUrl)),
    access(new URL("focus/quantum-computing.jpg", rootUrl)),
    access(new URL("news/skapion-drone-swarm.webp", rootUrl)),
    ...stylesheets.map((href) => access(new URL(href.replace(/^\//, ""), rootUrl))),
    access(new URL(script.replace(/^\//, ""), rootUrl)),
  ]);
});

test("repository-root snapshot includes every intended secondary route", async () => {
  for (const route of ["news", "contact", "privacy", "accessibility", "terms"]) {
    const [rootHtml, canonicalHtml] = await Promise.all([
      readFile(new URL(`${route}/index.html`, rootUrl), "utf8"),
      readFile(new URL(`${route}/index.html`, canonicalOutputUrl), "utf8"),
    ]);
    assert.equal(rootHtml, canonicalHtml, `${route} root snapshot should be current`);
  }

  for (const route of ["thesis", "companies", "founders"]) {
    await assert.rejects(access(new URL(`${route}/index.html`, rootUrl)));
  }
});

test("repository-root snapshot uses the new one-page experience", async () => {
  const home = await readFile(new URL("index.html", rootUrl), "utf8");
  assert.match(home, /Funding the/);
  assert.match(home, /class="qf-section-ruler"/);
  assert.match(home, /src="\/portfolio\/element-security-color\.svg"/);
  assert.match(home, /src="\/portfolio\/skapion-mark\.svg"/);
  assert.match(home, /src="\/portfolio\/oraqon-hd\.png"/);
  assert.match(home, /src="\/portfolio\/qedma-clean\.png"/);
  assert.match(home, /src="\/portfolio\/actasys-clean\.svg"/);
  assert.match(home, /src="\/portfolio\/particle-hd\.svg"/);
  assert.equal((home.match(/class="qf-portfolio-card"/g) ?? []).length, 11);
  assert.match(home, /src="\/team\/liav-ben-rubi-enhanced\.png"/);
  assert.doesNotMatch(home, /href="\/(?:thesis|companies|founders)\/"/);
});
