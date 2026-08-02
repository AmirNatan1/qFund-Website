import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`https://qfund.io${pathname}`, { headers: { accept: "text/html", host: "qfund.io" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the unified qFund experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /Funding the/);
  assert.match(html, /Pre-seed/);
  assert.match(html, /Pre-seed to Series A/);
  assert.match(html, /Deep Tech/);
  assert.match(html, /Quantum computing/);
  assert.match(html, /Qedma/);
  assert.match(html, /Liav Ben Rubi/);
  assert.match(html, /class="qf-section-rail"/);
  assert.match(html, /class="qf-frontier-field"/);
  assert.match(html, /class="qf-frontier-canvas"/);
  assert.match(html, /class="qf-frontier-core"/);
  assert.doesNotMatch(html, /qf-logo-field|qf-q-arrow-flight|qf-fund-reveal/);
  assert.equal((html.match(/class="qf-paper-person"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /qf-joined-hands|qf-person-arm/);
  assert.doesNotMatch(html, /board member|board observer|sits on the boards/i);
  assert.doesNotMatch(html, /href=["']\/(?:thesis|companies|founders)\/["']/i);
});

test("server-renders the only intended secondary pages", async () => {
  const expectations = [
    ["/news", /News and activity/i, /qFund in New York/],
    ["/contact", /Tell us what you are/i, /info@qfund\.io/],
  ];

  for (const [pathname, heading, proof] of expectations) {
    const response = await render(pathname);
    assert.equal(response.status, 200, `${pathname} should render`);
    const html = await response.text();
    assert.match(html, heading);
    assert.match(html, proof);
  }
});
