import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const outputUrl = new URL("../out/", import.meta.url);
const { onRequest } = await import("../functions/api/contact.ts");

const VALID = {
  name: "Dana Levi",
  email: "dana@example.com",
  company: "Photon Works",
  stage: "Seed",
  message: "We build cryogenic control electronics for trapped-ion systems.",
};

function post(body, env = {}) {
  return onRequest({
    request: new Request("https://qfund.io/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    env,
  });
}

/** Captures what would have been handed to Resend. */
function stubResend(status = 200) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init, body: JSON.parse(init.body) });
    return new Response(JSON.stringify({ id: "test" }), { status });
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

test("the contact page no longer carries the retired investment line", async () => {
  const [contact, source] = await Promise.all([
    readFile(new URL("contact/index.html", outputUrl), "utf8"),
    readFile(new URL("../app/contact/page.tsx", import.meta.url), "utf8"),
  ]);
  const retired = /We invest from Pre-seed to Series A in Deep Tech startups/;
  assert.doesNotMatch(source, retired);
  assert.doesNotMatch(contact, retired);
  assert.match(contact, /Tell us what you are/);
});

test("the form submits to the endpoint rather than to a mail client", async () => {
  const contact = await readFile(new URL("contact/index.html", outputUrl), "utf8");
  assert.match(contact, /name="website"/, "the spam trap should ship with the form");
  assert.match(contact, /qf-contact-trap/);
  assert.doesNotMatch(contact, /Prepare email/, "the button should no longer promise a mail client");
  assert.match(contact, /Send message/);

  const form = await readFile(new URL("../app/contact/ContactForm.tsx", import.meta.url), "utf8");
  assert.match(form, /const ENDPOINT = "\/api\/contact"/);
  assert.match(form, /method: "POST"/);
  // The mail client stays as a fallback for an unreachable endpoint only.
  assert.match(form, /function prepareEmail/);
  assert.equal((form.match(/prepareEmail\(submission\)/g) ?? []).length, 2);
});

test("only POST is served", async () => {
  const res = await onRequest({ request: new Request("https://qfund.io/api/contact"), env: {} });
  assert.equal(res.status, 405);
  assert.equal(res.headers.get("allow"), "POST");
});

test("every missing field is reported at once", async () => {
  const res = await post({});
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.deepEqual(Object.keys(body.fields).sort(), ["company", "email", "message", "name", "stage"]);
});

test("a malformed address, an unlisted stage and an oversized message are refused", async () => {
  const bad = await post({ ...VALID, email: "dana@example", stage: "Series Z" });
  assert.equal(bad.status, 400);
  const fields = (await bad.json()).fields;
  assert.ok(fields.email);
  assert.ok(fields.stage);

  const long = await post({ ...VALID, message: "x".repeat(6001) });
  assert.equal(long.status, 400);
  assert.ok((await long.json()).fields.message);

  const garbage = await post("not json");
  assert.equal(garbage.status, 400);
});

test("no key bound means no send, and a signal the form can fall back on", async () => {
  const resend = stubResend();
  try {
    const res = await post(VALID);
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error, "unconfigured");
    assert.equal(resend.calls.length, 0);
  } finally {
    resend.restore();
  }
});

test("a valid submission reaches the configured recipient", async () => {
  const resend = stubResend();
  try {
    const res = await post(VALID, { RESEND_API_KEY: "re_test" });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });

    assert.equal(resend.calls.length, 1);
    const [call] = resend.calls;
    assert.equal(call.url, "https://api.resend.com/emails");
    assert.equal(call.init.headers.authorization, "Bearer re_test");
    assert.deepEqual(call.body.to, ["info@qfund.io"]);
    assert.equal(call.body.reply_to, "dana@example.com");
    assert.match(call.body.subject, /Photon Works/);
    assert.match(call.body.text, /Name: Dana Levi/);
    assert.match(call.body.text, /Stage: Seed/);
    assert.match(call.body.text, /cryogenic control electronics/);
  } finally {
    resend.restore();
  }
});

test("recipient and sender can be overridden by binding", async () => {
  const resend = stubResend();
  try {
    await post(VALID, {
      RESEND_API_KEY: "re_test",
      CONTACT_TO: "deals@qfund.io",
      CONTACT_FROM: "qFund <hello@qfund.io>",
    });
    assert.deepEqual(resend.calls[0].body.to, ["deals@qfund.io"]);
    assert.equal(resend.calls[0].body.from, "qFund <hello@qfund.io>");
  } finally {
    resend.restore();
  }
});

test("a trapped submission is answered normally but never delivered", async () => {
  const resend = stubResend();
  try {
    const res = await post({ ...VALID, website: "http://spam.example" }, { RESEND_API_KEY: "re_test" });
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
    assert.equal(resend.calls.length, 0);
  } finally {
    resend.restore();
  }
});

test("submitted markup cannot reach the message as markup", async () => {
  const resend = stubResend();
  try {
    await post(
      { ...VALID, name: '<img src=x onerror="alert(1)">', message: "5 < 6 & 7 > 2" },
      { RESEND_API_KEY: "re_test" },
    );
    const { html } = resend.calls[0].body;
    assert.ok(!html.includes("<img"));
    assert.ok(html.includes("&lt;img"));
    assert.ok(html.includes("5 &lt; 6 &amp; 7 &gt; 2"));
  } finally {
    resend.restore();
  }
});

test("submitted text cannot inject message headers", async () => {
  const resend = stubResend();
  try {
    await post({ ...VALID, company: "Acme\nBcc: victim@example.com" }, { RESEND_API_KEY: "re_test" });
    const { subject, reply_to: replyTo } = resend.calls[0].body;
    assert.ok(!subject.includes("\n"));
    assert.ok(!replyTo.includes("\n"));
  } finally {
    resend.restore();
  }
});

test("a provider failure is reported, never dressed up as success", async () => {
  const rejected = stubResend(422);
  try {
    const res = await post(VALID, { RESEND_API_KEY: "re_test" });
    assert.equal(res.status, 502);
    assert.equal((await res.json()).error, "provider");
  } finally {
    rejected.restore();
  }

  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("connection reset"); };
  try {
    const res = await post(VALID, { RESEND_API_KEY: "re_test" });
    assert.equal(res.status, 502);
    assert.equal((await res.json()).error, "provider");
  } finally {
    globalThis.fetch = original;
  }
});
