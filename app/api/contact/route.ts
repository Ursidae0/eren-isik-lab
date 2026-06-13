import { NextResponse } from "next/server";

import {
  buildEnvelope,
  deliver,
  parseSubmission,
  type ProviderConfig,
} from "@/lib/contact";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

type RateEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateEntry>();

function getClientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

function isRateLimited(address: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(address);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(address, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

function newTransmissionId() {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

function readProviderConfig(): ProviderConfig {
  return {
    contactToEmail: process.env.CONTACT_TO_EMAIL,
    contactFromEmail: process.env.CONTACT_FROM_EMAIL,
    resendApiKey: process.env.RESEND_API_KEY,
    cfAccountId: process.env.CF_ACCOUNT_ID,
    cfEmailToken: process.env.CF_EMAIL_TOKEN,
  };
}

export async function POST(request: Request) {
  const address = getClientAddress(request);

  if (isRateLimited(address)) {
    return NextResponse.json(
      { ok: false, message: "Transmission window saturated. Retry in one minute." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Malformed transmission packet." },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { ok: false, message: "Transmission payload is missing." },
      { status: 400 },
    );
  }

  const submission = parseSubmission(payload as Record<string, unknown>);

  // Honeypot submissions receive a neutral success without sending anything.
  if (submission.kind === "honeypot") {
    return NextResponse.json({
      ok: true,
      transmissionId: newTransmissionId(),
      mode: "accepted",
      message: "Transmission acknowledged.",
    });
  }

  if (submission.kind === "invalid") {
    return NextResponse.json(
      { ok: false, message: submission.message },
      { status: submission.status },
    );
  }

  const transmissionId = newTransmissionId();
  const config = readProviderConfig();
  const envelope = buildEnvelope(submission.fields, transmissionId, config);
  const outcome = await deliver(config, envelope);

  if (outcome?.kind === "failed") {
    // Minimal, PII-free server log for observability.
    console.warn(`contact: delivery failed (status ${outcome.status})`);
    return NextResponse.json(
      { ok: false, message: outcome.message },
      { status: outcome.status },
    );
  }

  const mode = outcome?.kind === "sent" ? "live" : "simulation";

  return NextResponse.json({
    ok: true,
    transmissionId,
    mode,
    message:
      mode === "live"
        ? "Transmission delivered. Return channel established."
        : "Transmission accepted in simulation mode.",
  });
}
