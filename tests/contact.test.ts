import assert from "node:assert/strict";
import test from "node:test";

import { buildContactMailto } from "../lib/contact.ts";

test("targets the configured address and encodes the subject", () => {
  const href = buildContactMailto("contact@erenisiklab.com", {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Let's talk.",
  });

  assert.ok(href.startsWith("mailto:contact@erenisiklab.com?"));
  assert.match(
    href,
    /[?&]subject=Portfolio%20inquiry%20from%20Ada%20Lovelace(&|$)/,
  );
});

test("encodes the message and appends a sender line", () => {
  const href = buildContactMailto("contact@erenisiklab.com", {
    name: "Ada",
    email: "ada@example.com",
    message: "Hello & welcome?",
  });

  assert.ok(
    href.includes(
      "body=Hello%20%26%20welcome%3F%0A%0AFrom%3A%20Ada%20%3Cada%40example.com%3E",
    ),
  );
});

test("trims input and uses a generic subject when no name is given", () => {
  const href = buildContactMailto("contact@erenisiklab.com", {
    name: "   ",
    email: "  x@y.com  ",
    message: "  hi  ",
  });

  assert.match(href, /[?&]subject=Portfolio%20inquiry(&|$)/);
  assert.ok(href.includes("body=hi%0A%0AFrom%3A%20%3Cx%40y.com%3E"));
});
