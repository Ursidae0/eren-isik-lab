"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { useLanguage } from "@/components/preferences-provider";
import { buildContactMailto } from "@/lib/contact";
import { siteConfig } from "@/lib/site";

export function ContactSection() {
  const { content } = useLanguage();
  const contact = content.contact;
  const form = contact.form;
  const [status, setStatus] = useState<"idle" | "opening">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const href = buildContactMailto(siteConfig.email, {
      name: String(formData.get("callsign") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    });

    setStatus("opening");
    window.location.href = href;
  }

  const statusMessage =
    status === "opening"
      ? form.openingStatusTemplate.replace("{email}", siteConfig.email)
      : form.idleStatus;

  return (
    <section id="contact" className="contact-section">
      <div className="section-shell contact-grid">
        <div>
          <p className="section-kicker">{contact.kicker}</p>
          <h2 className="contact-title">{contact.title}</h2>
          <p className="contact-copy">{contact.copy}</p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "0.75rem",
              marginTop: "2rem",
            }}
          >
            <a
              href={`mailto:${siteConfig.email}`}
              className="contact-direct"
              style={{ marginTop: 0 }}
            >
              {siteConfig.email} ↗
            </a>
            <a
              href={siteConfig.linkedin}
              target="_blank"
              rel="noreferrer"
              className="contact-direct"
              style={{ marginTop: 0 }}
            >
              {contact.linkedinLabel} ↗
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="callsign">{form.nameLabel}</label>
              <input
                id="callsign"
                name="callsign"
                type="text"
                minLength={2}
                maxLength={80}
                autoComplete="name"
                required
                placeholder={form.namePlaceholder}
              />
            </div>

            <div className="field">
              <label htmlFor="email">{form.emailLabel}</label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={160}
                autoComplete="email"
                required
                placeholder={form.emailPlaceholder}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="message">{form.messageLabel}</label>
            <textarea
              id="message"
              name="message"
              minLength={10}
              maxLength={2000}
              required
              placeholder={form.messagePlaceholder}
            />
          </div>

          <div className="form-footer">
            <p className="form-status" data-state={status} aria-live="polite">
              {statusMessage}
            </p>
            <button type="submit" className="contact-submit">
              {form.submitLabel}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
