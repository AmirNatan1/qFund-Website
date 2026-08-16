/**
 * Contact endpoint.
 *
 * A Cloudflare Pages Function, deployed alongside the static site: Pages picks
 * up this directory automatically, so `/api/contact` exists without the site
 * needing a build step or a server. The submission is validated here and handed
 * to Resend, which means the API key stays a Cloudflare secret and never
 * reaches the page source.
 *
 * Required binding
 *   RESEND_API_KEY   Resend API key, set as a secret on the Pages project.
 *
 * Optional bindings
 *   CONTACT_TO       Recipient. Defaults to info@qfund.io.
 *   CONTACT_FROM     Verified sender. Defaults to qFund <website@qfund.io>.
 *
 * Until RESEND_API_KEY is set the endpoint answers 503 `unconfigured`, which is
 * the signal the form uses to fall back to a prepared email rather than losing
 * the enquiry.
 */

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const DEFAULT_TO = "info@qfund.io";
const DEFAULT_FROM = "qFund Website <website@qfund.io>";
const STAGES = ["Pre-seed", "Seed", "Series A", "Other"];

const LIMITS = {
  name: 120,
  email: 200,
  company: 160,
  message: 6000,
} as const;

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    },
  });
}

function clean(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function cleanMultiline(value: unknown) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
}

/** Deliberately permissive: the shape is a sanity check, not an identity test. */
function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && value.length <= LIMITS.email;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Keeps submitted text out of the header block of the outgoing message. */
function headerSafe(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

type Submission = {
  name: string;
  email: string;
  company: string;
  stage: string;
  message: string;
};

function validate(payload: Record<string, unknown>) {
  const submission: Submission = {
    name: clean(payload.name),
    email: clean(payload.email).toLowerCase(),
    company: clean(payload.company),
    stage: clean(payload.stage),
    message: cleanMultiline(payload.message),
  };

  const fields: Record<string, string> = {};
  if (!submission.name) fields.name = "Please tell us your name.";
  else if (submission.name.length > LIMITS.name) fields.name = "That name is too long.";

  if (!submission.email) fields.email = "Please add an email address.";
  else if (!looksLikeEmail(submission.email)) fields.email = "That email address does not look right.";

  if (!submission.company) fields.company = "Please add your company.";
  else if (submission.company.length > LIMITS.company) fields.company = "That company name is too long.";

  if (!STAGES.includes(submission.stage)) fields.stage = "Please choose a stage.";

  if (!submission.message) fields.message = "Please tell us what you are building.";
  else if (submission.message.length > LIMITS.message) fields.message = "Please keep this under 6000 characters.";

  return { submission, fields };
}

function compose(submission: Submission) {
  const lines = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Company: ${submission.company}`,
    `Stage: ${submission.stage}`,
    "",
    submission.message,
  ];

  const html = [
    '<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#062b29">',
    '<p style="margin:0 0 1rem"><strong>New startup introduction from the qFund website.</strong></p>',
    "<table cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 1rem\">",
    `<tr><td style="padding:2px 16px 2px 0;color:#0d6f69">Name</td><td>${escapeHtml(submission.name)}</td></tr>`,
    `<tr><td style="padding:2px 16px 2px 0;color:#0d6f69">Email</td><td><a href="mailto:${escapeHtml(submission.email)}">${escapeHtml(submission.email)}</a></td></tr>`,
    `<tr><td style="padding:2px 16px 2px 0;color:#0d6f69">Company</td><td>${escapeHtml(submission.company)}</td></tr>`,
    `<tr><td style="padding:2px 16px 2px 0;color:#0d6f69">Stage</td><td>${escapeHtml(submission.stage)}</td></tr>`,
    "</table>",
    `<div style="white-space:pre-wrap">${escapeHtml(submission.message)}</div>`,
    "</div>",
  ].join("");

  return { text: lines.join("\n"), html };
}

async function handlePost({ request, env }: RequestContext): Promise<Response> {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  // Honeypot. Bots fill every field they find; people never see this one. The
  // answer is a plain success so the sender learns nothing from the difference.
  if (clean(payload.website)) return json({ ok: true }, 200);

  const { submission, fields } = validate(payload);
  if (Object.keys(fields).length > 0) {
    return json({ ok: false, error: "invalid", fields }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: "unconfigured" }, 503);
  }

  const { text, html } = compose(submission);
  const subject = headerSafe(`qFund introduction — ${submission.company || submission.name}`);

  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM || DEFAULT_FROM,
        to: [env.CONTACT_TO || DEFAULT_TO],
        reply_to: headerSafe(submission.email),
        subject,
        text,
        html,
      }),
    });
  } catch {
    return json({ ok: false, error: "provider" }, 502);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("resend rejected the message", response.status, detail.slice(0, 500));
    return json({ ok: false, error: "provider" }, 502);
  }

  return json({ ok: true }, 200);
}

export const onRequest = async (context: RequestContext): Promise<Response> => {
  if (context.request.method === "POST") return handlePost(context);
  // Anything else is not part of this endpoint's contract.
  return new Response(JSON.stringify({ ok: false, error: "method" }), {
    status: 405,
    headers: { "content-type": "application/json; charset=utf-8", allow: "POST" },
  });
};
