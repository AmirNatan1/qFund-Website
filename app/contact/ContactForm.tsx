"use client";

import { useRef, useState, type FormEvent } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const ENDPOINT = "/api/contact";

type Submission = {
  name: string;
  email: string;
  company: string;
  stage: string;
  message: string;
  website: string;
};

function read(data: FormData): Submission {
  const value = (key: string) => String(data.get(key) ?? "").trim();
  return {
    name: value("name"),
    email: value("email"),
    company: value("company"),
    stage: value("stage"),
    message: value("message"),
    website: value("website"),
  };
}

/**
 * Last resort only. If the endpoint cannot be reached - not yet configured, the
 * network dropped, the provider is down - the enquiry is handed to the visitor's
 * mail client rather than lost. On the ordinary path this never runs.
 */
function prepareEmail(submission: Submission) {
  const subject = encodeURIComponent(
    `qFund startup introduction - ${submission.company || submission.name}`,
  );
  const body = encodeURIComponent(
    [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Company: ${submission.company}`,
      `Stage: ${submission.stage}`,
      "",
      submission.message,
    ].join("\n"),
  );
  window.location.href = `mailto:info@qfund.io?subject=${subject}&body=${body}`;
}

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const submission = read(new FormData(form));

    setStatus("sending");
    setFieldErrors({});
    setNotice("");

    let response: Response;
    try {
      response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(submission),
      });
    } catch {
      // Never reached the endpoint at all.
      setStatus("error");
      setNotice("We could not reach the server, so we have opened this as an email instead.");
      prepareEmail(submission);
      return;
    }

    if (response.ok) {
      setStatus("sent");
      form.reset();
      return;
    }

    if (response.status === 400) {
      const body = await response.json().catch(() => ({}));
      const fields = (body as { fields?: Record<string, string> }).fields ?? {};
      setFieldErrors(fields);
      setStatus("error");
      setNotice(
        Object.keys(fields).length > 0
          ? "Please check the highlighted fields."
          : "Something in that submission was not accepted. Please check and try again.",
      );
      const firstInvalid = Object.keys(fields)[0];
      if (firstInvalid) {
        form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      }
      return;
    }

    // The endpoint answered, but could not send: fall back rather than lose it.
    setStatus("error");
    setNotice("We could not send that automatically, so we have opened it as an email instead.");
    prepareEmail(submission);
  };

  if (status === "sent") {
    return (
      <div className="qf-contact-form qf-contact-sent qf-reveal is-visible" role="status">
        <h2>Thank you.</h2>
        <p>
          Your introduction is with the qFund team at <strong>info@qfund.io</strong>. We read every
          submission and will come back to you directly.
        </p>
        <button type="button" onClick={() => setStatus("idle")}>
          <span>Send another</span><span aria-hidden="true">↗</span>
        </button>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <form
      className="contact-form qf-contact-form qf-reveal"
      onSubmit={handleSubmit}
      ref={formRef}
      noValidate={false}
    >
      <div className="contact-form-heading">
        <h2>Your company,<br />in your words.</h2>
      </div>

      <div className="contact-field-row">
        <label>
          <span>Full name</span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            maxLength={120}
            required
            aria-invalid={Boolean(fieldErrors.name)}
          />
          <i aria-hidden="true" />
          {fieldErrors.name ? <em className="qf-field-error">{fieldErrors.name}</em> : null}
        </label>
        <label>
          <span>Email address</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={200}
            required
            aria-invalid={Boolean(fieldErrors.email)}
          />
          <i aria-hidden="true" />
          {fieldErrors.email ? <em className="qf-field-error">{fieldErrors.email}</em> : null}
        </label>
      </div>

      <div className="contact-field-row">
        <label>
          <span>Company</span>
          <input
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={160}
            required
            aria-invalid={Boolean(fieldErrors.company)}
          />
          <i aria-hidden="true" />
          {fieldErrors.company ? <em className="qf-field-error">{fieldErrors.company}</em> : null}
        </label>
        <label>
          <span>Stage</span>
          <select name="stage" defaultValue="" required aria-invalid={Boolean(fieldErrors.stage)}>
            <option value="" disabled>Select stage</option>
            <option value="Pre-seed">Pre-seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Other">Other</option>
          </select>
          <i aria-hidden="true" />
          {fieldErrors.stage ? <em className="qf-field-error">{fieldErrors.stage}</em> : null}
        </label>
      </div>

      <label className="contact-message">
        <span>What are you building?</span>
        <textarea
          name="message"
          rows={6}
          maxLength={6000}
          required
          aria-invalid={Boolean(fieldErrors.message)}
        />
        <i aria-hidden="true" />
        {fieldErrors.message ? <em className="qf-field-error">{fieldErrors.message}</em> : null}
      </label>

      {/* Seen only by bots, which fill in everything they find. */}
      <div className="qf-contact-trap" aria-hidden="true">
        <label>
          Do not fill this in
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="contact-form-action">
        <p role={notice ? "alert" : undefined}>
          {notice || "Sent straight to the qFund team at info@qfund.io."}
        </p>
        <button type="submit" disabled={sending} aria-busy={sending}>
          <span>{sending ? "Sending…" : "Send message"}</span>
          <span aria-hidden="true">{sending ? "…" : "↗"}</span>
        </button>
      </div>
    </form>
  );
}
