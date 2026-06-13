import assert from "node:assert/strict";
import test from "node:test";

import {
  bareEmail,
  buildEnvelope,
  deliver,
  parseSubmission,
  selectProvider,
  sendViaCloudflare,
  sendViaResend,
  type MessageEnvelope,
} from "../lib/contact.ts";

type Recorded = { url: string; body: string };

// A fetch stub that records each call and returns a chosen status, so delivery
// can be asserted without contacting a real provider.
function recordingFetch(status: number, records: Recorded[]): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    records.push({ url: String(input), body: String(init?.body ?? "") });
    return new Response(JSON.stringify({ ok: true }), { status });
  }) as typeof fetch;
}

const SAMPLE_ENVELOPE: MessageEnvelope = {
  from: "Eren Isik Lab <contact@erenisiklab.com>",
  to: "owner@inbox.example",
  replyTo: "visitor@example.com",
  subject: "[Mission Control ABCD1234] Eren",
  text: "Callsign: Eren\nReturn channel: visitor@example.com",
};

test("parseSubmission rejects a short callsign", () => {
  const result = parseSubmission({ callsign: "a", email: "v@example.com", message: "a real message here" });
  assert.equal(result.kind, "invalid");
});

test("parseSubmission rejects an invalid email", () => {
  const result = parseSubmission({ callsign: "Eren", email: "not-an-email", message: "a real message here" });
  assert.equal(result.kind, "invalid");
});

test("parseSubmission rejects a short message", () => {
  const result = parseSubmission({ callsign: "Eren", email: "v@example.com", message: "short" });
  assert.equal(result.kind, "invalid");
});

test("parseSubmission flags a filled honeypot", () => {
  const result = parseSubmission({
    callsign: "Eren",
    email: "v@example.com",
    message: "a real message here",
    website: "http://spam.example",
  });
  assert.equal(result.kind, "honeypot");
});

test("parseSubmission accepts a valid submission", () => {
  const result = parseSubmission({ callsign: "Eren", email: "v@example.com", message: "a real message here" });
  assert.equal(result.kind, "valid");
});

test("selectProvider returns simulation without a recipient", () => {
  assert.equal(selectProvider({ resendApiKey: "re_x", cfAccountId: "a", cfEmailToken: "t" }), "simulation");
});

test("selectProvider prefers resend when both providers are set", () => {
  assert.equal(
    selectProvider({ contactToEmail: "owner@inbox.example", resendApiKey: "re_x", cfAccountId: "a", cfEmailToken: "t" }),
    "resend",
  );
});

test("selectProvider falls back to cloudflare", () => {
  assert.equal(
    selectProvider({ contactToEmail: "owner@inbox.example", cfAccountId: "a", cfEmailToken: "t" }),
    "cloudflare",
  );
});

test("buildEnvelope targets the server recipient and replies to the visitor", () => {
  const envelope = buildEnvelope(
    { callsign: "Eren", email: "visitor@example.com", message: "a real message here", website: "" },
    "ABCD1234",
    { contactToEmail: "owner@inbox.example", contactFromEmail: "Eren Isik Lab <contact@erenisiklab.com>" },
  );
  assert.equal(envelope.to, "owner@inbox.example");
  assert.equal(envelope.replyTo, "visitor@example.com");
  assert.equal(envelope.from, "Eren Isik Lab <contact@erenisiklab.com>");
  assert.match(envelope.subject, /ABCD1234/);
});

test("bareEmail strips a display name", () => {
  assert.equal(bareEmail("Eren Isik Lab <contact@erenisiklab.com>"), "contact@erenisiklab.com");
  assert.equal(bareEmail("plain@example.com"), "plain@example.com");
});

test("sendViaResend posts exactly one request to the owner inbox", async () => {
  const records: Recorded[] = [];
  const outcome = await sendViaResend("re_test", SAMPLE_ENVELOPE, recordingFetch(200, records));
  assert.equal(outcome.kind, "sent");
  assert.equal(records.length, 1);
  assert.match(records[0].url, /api\.resend\.com/);
  const body = JSON.parse(records[0].body);
  assert.deepEqual(body.to, ["owner@inbox.example"]);
  assert.equal(body.reply_to, "visitor@example.com");
  assert.equal(body.from, "Eren Isik Lab <contact@erenisiklab.com>");
});

test("sendViaCloudflare posts once with a bare sender and Reply-To header", async () => {
  const records: Recorded[] = [];
  const outcome = await sendViaCloudflare("acc123", "tok123", SAMPLE_ENVELOPE, recordingFetch(200, records));
  assert.equal(outcome.kind, "sent");
  assert.equal(records.length, 1);
  assert.match(records[0].url, /accounts\/acc123\/email\/sending\/send/);
  const body = JSON.parse(records[0].body);
  assert.equal(body.to, "owner@inbox.example");
  assert.equal(body.from, "contact@erenisiklab.com");
  assert.equal(body.headers["Reply-To"], "visitor@example.com");
});

test("a non-ok provider response yields a 502 failure", async () => {
  const outcome = await sendViaResend("re_test", SAMPLE_ENVELOPE, recordingFetch(401, []));
  assert.equal(outcome.kind, "failed");
  if (outcome.kind === "failed") {
    assert.equal(outcome.status, 502);
  }
});

test("deliver is simulation (null) without a provider", async () => {
  const outcome = await deliver({ contactToEmail: "owner@inbox.example" }, SAMPLE_ENVELOPE, recordingFetch(200, []));
  assert.equal(outcome, null);
});

test("deliver routes to resend and reaches the owner inbox exactly once", async () => {
  const records: Recorded[] = [];
  const config = {
    contactToEmail: "owner@inbox.example",
    contactFromEmail: "Eren Isik Lab <contact@erenisiklab.com>",
    resendApiKey: "re_x",
  };
  const envelope = buildEnvelope(
    { callsign: "Eren", email: "visitor@example.com", message: "a real message here", website: "" },
    "ABCD1234",
    config,
  );
  const outcome = await deliver(config, envelope, recordingFetch(200, records));
  assert.equal(outcome?.kind, "sent");
  assert.equal(records.length, 1);
  const body = JSON.parse(records[0].body);
  assert.deepEqual(body.to, ["owner@inbox.example"]);
});
