"use client";

import type { FormEvent } from "react";
import { useState } from "react";

import { siteConfig } from "@/lib/site";

type FormState = {
  status: "idle" | "sending" | "success" | "error";
  message: string;
};

export function ContactSection() {
  const [state, setState] = useState<FormState>({
    status: "idle",
    message: "I usually reply within two days.",
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState({
      status: "sending",
      message: "Sending your message...",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callsign: formData.get("callsign"),
          email: formData.get("email"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        message: string;
      };

      if (!response.ok || !result.ok) {
        setState({
          status: "error",
          message: result.message ?? "The message could not be sent.",
        });
        return;
      }

      setState({
        status: "success",
        message: "Thanks. Your message is on its way.",
      });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "The contact service is unavailable. Please try again shortly.",
      });
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="section-shell contact-grid">
        <div>
          <p className="section-kicker">Contact</p>
          <h2 className="contact-title">Let&apos;s build something useful.</h2>
          <p className="contact-copy">
            I&apos;m open to internships, engineering roles, and research
            collaborations — especially where software meets embedded systems,
            signal processing, simulation, or high-performance computing.
          </p>
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
              Find me on LinkedIn ↗
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="callsign">Name</label>
              <input
                id="callsign"
                name="callsign"
                type="text"
                minLength={2}
                maxLength={80}
                autoComplete="name"
                required
                placeholder="Your name"
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={160}
                autoComplete="email"
                required
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              minLength={10}
              maxLength={2000}
              required
              placeholder="What are you working on?"
            />
          </div>

          <div className="absolute -left-[10000px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="form-footer">
            <p
              className="form-status"
              data-state={state.status}
              aria-live="polite"
            >
              {state.message}
            </p>
            <button
              type="submit"
              className="contact-submit"
              disabled={state.status === "sending"}
            >
              {state.status === "sending" ? "Sending..." : "Send message"}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
