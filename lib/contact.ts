// Provider-agnostic contact-form delivery.
//
// Kept free of `next/server` so it can be unit-tested under `node --test`; the
// route handler in app/api/contact/route.ts is a thin adapter over this module.
//
// Security model (anti-open-relay): the recipient is ALWAYS the server-side
// CONTACT_TO_EMAIL. The visitor's address is only ever used as a Reply-To,
// never as the From and never as the To. The client cannot choose a recipient.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SEND_TIMEOUT_MS = 10_000;

const TIMEOUT_OUTCOME: SendOutcome = {
  kind: "failed",
  status: 502,
  message: "Relay connection timed out. Retry the transmission.",
};

const UNCONFIRMED_OUTCOME: SendOutcome = {
  kind: "failed",
  status: 502,
  message: "Uplink reached the relay, but delivery was not confirmed.",
};

const DEFAULT_FROM = "Eren Isik Lab <onboarding@resend.dev>";

export type ContactFields = {
  callsign: string;
  email: string;
  message: string;
  website: string;
};

export type ParsedSubmission =
  | { kind: "honeypot" }
  | { kind: "invalid"; status: number; message: string }
  | { kind: "valid"; fields: ContactFields };

// Parse + validate a raw request body. Honeypot detection runs first so bots
// that fill the hidden field get a neutral path without any field feedback.
export function parseSubmission(body: Record<string, unknown>): ParsedSubmission {
  const callsign = typeof body.callsign === "string" ? body.callsign.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const website = typeof body.website === "string" ? body.website.trim() : "";

  if (website) {
    return { kind: "honeypot" };
  }
  if (callsign.length < 2 || callsign.length > 80) {
    return { kind: "invalid", status: 400, message: "Callsign must contain 2 to 80 characters." };
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 160) {
    return { kind: "invalid", status: 400, message: "Return channel is not a valid email address." };
  }
  if (message.length < 10 || message.length > 2_000) {
    return { kind: "invalid", status: 400, message: "Coordinates must contain 10 to 2,000 characters." };
  }
  return { kind: "valid", fields: { callsign, email, message, website } };
}

export type ProviderConfig = {
  contactToEmail?: string;
  contactFromEmail?: string;
  resendApiKey?: string;
  cfAccountId?: string;
  cfEmailToken?: string;
};

export type Provider = "resend" | "cloudflare" | "simulation";

// Provider selection is server-controlled. Without a configured recipient we
// never send. Resend wins when both providers are configured (it is the more
// robust default; Cloudflare Email Service is still beta).
export function selectProvider(config: ProviderConfig): Provider {
  if (!config.contactToEmail?.trim()) {
    return "simulation";
  }
  if (config.resendApiKey?.trim()) {
    return "resend";
  }
  if (config.cfAccountId?.trim() && config.cfEmailToken?.trim()) {
    return "cloudflare";
  }
  return "simulation";
}

export type MessageEnvelope = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};

export function buildEnvelope(
  fields: ContactFields,
  transmissionId: string,
  config: ProviderConfig,
): MessageEnvelope {
  return {
    from: config.contactFromEmail?.trim() || DEFAULT_FROM,
    to: config.contactToEmail?.trim() ?? "",
    replyTo: fields.email,
    subject: `[Mission Control ${transmissionId}] ${fields.callsign}`,
    text: [
      `Callsign: ${fields.callsign}`,
      `Return channel: ${fields.email}`,
      `Transmission ID: ${transmissionId}`,
      "",
      fields.message,
    ].join("\n"),
  };
}

// Reduce a "Display Name <addr@domain>" sender to the bare address. Resend
// accepts the display-name form; Cloudflare's REST sender expects a plain one.
export function bareEmail(address: string): string {
  const match = address.match(/<([^>]+)>/);
  return match ? match[1].trim() : address.trim();
}

export type SendOutcome =
  | { kind: "sent" }
  | { kind: "failed"; status: number; message: string };

type FetchImpl = typeof fetch;

// Resend (https://resend.com) — recommended default provider.
export async function sendViaResend(
  apiKey: string,
  envelope: MessageEnvelope,
  fetchImpl: FetchImpl = fetch,
): Promise<SendOutcome> {
  let response: Response;
  try {
    response = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: envelope.from,
        to: [envelope.to],
        reply_to: envelope.replyTo,
        subject: envelope.subject,
        text: envelope.text,
      }),
    });
  } catch {
    return TIMEOUT_OUTCOME;
  }
  return response.ok ? { kind: "sent" } : UNCONFIRMED_OUTCOME;
}

// Cloudflare Email Service REST API (beta). Free when CONTACT_TO_EMAIL is a
// verified destination already configured in Cloudflare Email Routing.
// Docs: https://developers.cloudflare.com/email-service/api/send-emails/rest-api/
export async function sendViaCloudflare(
  accountId: string,
  token: string,
  envelope: MessageEnvelope,
  fetchImpl: FetchImpl = fetch,
): Promise<SendOutcome> {
  let response: Response;
  try {
    response = await fetchImpl(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`,
      {
        method: "POST",
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: bareEmail(envelope.from),
          to: envelope.to,
          subject: envelope.subject,
          text: envelope.text,
          headers: { "Reply-To": envelope.replyTo },
        }),
      },
    );
  } catch {
    return TIMEOUT_OUTCOME;
  }
  return response.ok ? { kind: "sent" } : UNCONFIRMED_OUTCOME;
}

// Returns null when no provider is configured (simulation mode).
export async function deliver(
  config: ProviderConfig,
  envelope: MessageEnvelope,
  fetchImpl: FetchImpl = fetch,
): Promise<SendOutcome | null> {
  const provider = selectProvider(config);
  if (provider === "resend") {
    return sendViaResend((config.resendApiKey ?? "").trim(), envelope, fetchImpl);
  }
  if (provider === "cloudflare") {
    return sendViaCloudflare(
      (config.cfAccountId ?? "").trim(),
      (config.cfEmailToken ?? "").trim(),
      envelope,
      fetchImpl,
    );
  }
  return null;
}
