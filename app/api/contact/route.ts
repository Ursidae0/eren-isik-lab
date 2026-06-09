import { NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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
    rateLimitStore.set(address, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: Request) {
  const address = getClientAddress(request);

  if (isRateLimited(address)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Transmission window saturated. Retry in one minute.",
      },
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

  const body = payload as Record<string, unknown>;
  const callsign = typeof body.callsign === "string" ? body.callsign.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const website = typeof body.website === "string" ? body.website.trim() : "";

  // Honeypot submissions receive a neutral response without sending anything.
  if (website) {
    return NextResponse.json({
      ok: true,
      transmissionId: crypto.randomUUID().slice(0, 8).toUpperCase(),
      mode: "accepted",
      message: "Transmission acknowledged.",
    });
  }

  if (callsign.length < 2 || callsign.length > 80) {
    return NextResponse.json(
      { ok: false, message: "Callsign must contain 2 to 80 characters." },
      { status: 400 },
    );
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 160) {
    return NextResponse.json(
      { ok: false, message: "Return channel is not a valid email address." },
      { status: 400 },
    );
  }

  if (message.length < 10 || message.length > 2_000) {
    return NextResponse.json(
      { ok: false, message: "Coordinates must contain 10 to 2,000 characters." },
      { status: 400 },
    );
  }

  const transmissionId = crypto.randomUUID().slice(0, 8).toUpperCase();
  const resendApiKey = process.env.RESEND_API_KEY;
  const contactToEmail = process.env.CONTACT_TO_EMAIL;
  const contactFromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    "Eren Isik Lab <onboarding@resend.dev>";

  if (resendApiKey && contactToEmail) {
    let response: Response;

    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: contactFromEmail,
          to: [contactToEmail],
          reply_to: email,
          subject: `[Mission Control ${transmissionId}] ${callsign}`,
          text: [
            `Callsign: ${callsign}`,
            `Return channel: ${email}`,
            `Transmission ID: ${transmissionId}`,
            "",
            message,
          ].join("\n"),
        }),
      });
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "Relay connection timed out. Retry the transmission.",
        },
        { status: 502 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: "Uplink reached the relay, but delivery was not confirmed.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      transmissionId,
      mode: "live",
      message: "Transmission delivered. Return channel established.",
    });
  }

  return NextResponse.json({
    ok: true,
    transmissionId,
    mode: "simulation",
    message: "Transmission accepted in simulation mode.",
  });
}
