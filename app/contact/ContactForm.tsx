"use client";

import type { FormEvent } from "react";

export default function ContactForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const company = String(data.get("company") ?? "");
    const stage = String(data.get("stage") ?? "");
    const message = String(data.get("message") ?? "");
    const subject = encodeURIComponent(`qFund startup introduction — ${company || name}`);
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company}`,
        `Stage: ${stage}`,
        "",
        message,
      ].join("\n"),
    );

    window.location.href = `mailto:info@qfund.io?subject=${subject}&body=${body}`;
  };

  return (
    <form className="contact-form qf-contact-form qf-reveal" onSubmit={handleSubmit}>
      <div className="contact-form-heading">
        <p className="qf-kicker">STARTUP INTRODUCTION</p>
        <h2>Your company,<br />in your words.</h2>
      </div>

      <div className="contact-field-row">
        <label>
          <span>Full name</span>
          <input name="name" type="text" autoComplete="name" required />
          <i aria-hidden="true" />
        </label>
        <label>
          <span>Email address</span>
          <input name="email" type="email" autoComplete="email" required />
          <i aria-hidden="true" />
        </label>
      </div>

      <div className="contact-field-row">
        <label>
          <span>Company</span>
          <input name="company" type="text" autoComplete="organization" required />
          <i aria-hidden="true" />
        </label>
        <label>
          <span>Stage</span>
          <select name="stage" defaultValue="" required>
            <option value="" disabled>Select stage</option>
            <option value="Pre-seed">Pre-seed</option>
            <option value="Seed">Seed</option>
            <option value="Series A">Series A</option>
            <option value="Other">Other</option>
          </select>
          <i aria-hidden="true" />
        </label>
      </div>

      <label className="contact-message">
        <span>What are you building?</span>
        <textarea name="message" rows={6} required />
        <i aria-hidden="true" />
      </label>

      <div className="contact-form-action">
        <p>Your details open as a prepared email to qFund.</p>
        <button type="submit">
          <span>Prepare email</span><span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}
