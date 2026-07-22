import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://qfund.io/", {
      headers: { accept: "text/html", host: "qfund.io" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the qFund experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>qFund \| Funding the Deep Future of Technology<\/title>/i);
  assert.match(html, /Funding the/);
  assert.match(html, /deep future/);
  assert.match(html, /Quantum systems/);
  assert.match(html, /Qedma/);
  assert.match(html, /Liav Ben Rubi/);
  assert.match(html, /info@qfund\.io/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("publishes the essential navigation and landmarks", async () => {
  const response = await render();
  const html = await response.text();

  for (const anchor of ["#thesis", "#focus", "#portfolio", "#team"]) {
    assert.match(html, new RegExp(`href=["']${anchor}["']`, "i"));
  }

  assert.match(html, /aria-label="Main navigation"/i);
  assert.match(html, /aria-label="Filter portfolio companies"/i);
  assert.match(html, /aria-label="qFund home"/i);
});
