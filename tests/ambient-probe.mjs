import assert from "node:assert/strict";

const baseUrl = process.argv[2];

if (!baseUrl) {
  throw new Error("Expected the application base URL");
}

async function waitForApplication() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) {
        return response.text();
      }
    } catch {
      // The production container is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error("Application did not become ready");
}

const html = await waitForApplication();
assert.match(html, /Atmosphere/);
assert.match(html, /Selected work/);

const fallbackResponse = await fetch(`${baseUrl}/api/ambient`);
const fallback = await fallbackResponse.json();
assert.equal(fallback.available, false);
assert.equal(fallback.reason, "location_unavailable");

const locationHeaders = {
  "cf-iplatitude": "41.0082",
  "cf-iplongitude": "28.9784",
  "cf-ipcity": "Istanbul",
  "cf-ipcountry": "TR",
};
const firstResponse = await fetch(`${baseUrl}/api/ambient`, {
  headers: locationHeaders,
});
const first = await firstResponse.json();

assert.equal(firstResponse.headers.get("x-ambient-cache"), "miss");
assert.equal(first.available, true);
assert.equal(first.weather, "rain");
assert.equal(first.locationLabel, "Istanbul, TR");
assert.equal(first.windDirectionDeg, 275);
assert.equal("latitude" in first, false);
assert.equal("longitude" in first, false);

const secondResponse = await fetch(`${baseUrl}/api/ambient`, {
  headers: locationHeaders,
});
const second = await secondResponse.json();

assert.equal(secondResponse.headers.get("x-ambient-cache"), "hit");
assert.deepEqual(second, first);

console.log("Ambient integration checks passed");
