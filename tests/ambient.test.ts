import assert from "node:assert/strict";
import test from "node:test";

import {
  getAmbientPhase,
  getBrowserTimePhase,
  getLocationCacheKey,
  isAmbientConditions,
  normalizeOpenMeteoResponse,
  normalizeWeatherCode,
  readCoarseLocation,
  resolveAmbientPresentation,
} from "../lib/ambient.ts";

test("reads and rounds Cloudflare coordinates without retaining an IP", () => {
  const headers = new Headers({
    "cf-iplatitude": "41.0082376",
    "cf-iplongitude": "28.9783589",
    "cf-ipcity": "Istanbul",
    "cf-ipcountry": "TR",
  });
  const location = readCoarseLocation(headers);

  assert.deepEqual(location, {
    latitude: 41,
    longitude: 29,
    city: "Istanbul",
    country: "TR",
  });
  assert.equal(location ? getLocationCacheKey(location) : null, "41.0,29.0");
});

test("rejects missing or invalid coordinates", () => {
  assert.equal(readCoarseLocation(new Headers()), null);
  assert.equal(
    readCoarseLocation(
      new Headers({
        "cf-iplatitude": "200",
        "cf-iplongitude": "29",
      }),
    ),
    null,
  );
});

test("normalizes WMO weather codes into visual modes", () => {
  assert.equal(normalizeWeatherCode(0), "clear");
  assert.equal(normalizeWeatherCode(3), "cloudy");
  assert.equal(normalizeWeatherCode(45), "fog");
  assert.equal(normalizeWeatherCode(63), "rain");
  assert.equal(normalizeWeatherCode(75), "snow");
  assert.equal(normalizeWeatherCode(95), "rain");
});

test("derives dawn, day, dusk, and night from local solar times", () => {
  assert.equal(
    getAmbientPhase(
      "2026-06-11T05:25",
      "2026-06-11T05:15",
      "2026-06-11T20:35",
      true,
    ),
    "dawn",
  );
  assert.equal(
    getAmbientPhase(
      "2026-06-11T12:00",
      "2026-06-11T05:15",
      "2026-06-11T20:35",
      true,
    ),
    "day",
  );
  assert.equal(
    getAmbientPhase(
      "2026-06-11T20:20",
      "2026-06-11T05:15",
      "2026-06-11T20:35",
      true,
    ),
    "dusk",
  );
  assert.equal(
    getAmbientPhase(
      "2026-06-11T23:00",
      "2026-06-11T05:15",
      "2026-06-11T20:35",
      false,
    ),
    "night",
  );
});

test("provides a deterministic browser-time fallback", () => {
  assert.equal(getBrowserTimePhase(new Date(2026, 5, 11, 6, 0)), "dawn");
  assert.equal(getBrowserTimePhase(new Date(2026, 5, 11, 10, 0)), "day");
  assert.equal(getBrowserTimePhase(new Date(2026, 5, 11, 18, 30)), "dusk");
  assert.equal(getBrowserTimePhase(new Date(2026, 5, 11, 23, 0)), "night");
});

test("normalizes a weather response without exposing coordinates", () => {
  const conditions = normalizeOpenMeteoResponse(
    {
      current: {
        time: "2026-06-11T18:30",
        temperature_2m: 24.4,
        is_day: 1,
        precipitation: 0.4,
        snowfall: 0,
        weather_code: 61,
        cloud_cover: 82,
        wind_speed_10m: 18,
        wind_direction_10m: 275,
        wind_gusts_10m: 31,
      },
      daily: {
        sunrise: ["2026-06-11T05:15"],
        sunset: ["2026-06-11T20:35"],
      },
    },
    {
      latitude: 41,
      longitude: 29,
      city: "Istanbul",
      country: "TR",
    },
  );

  assert.deepEqual(conditions, {
    available: true,
    source: "local",
    weather: "rain",
    phase: "day",
    isDay: true,
    temperatureC: 24.4,
    windSpeedKmh: 18,
    windDirectionDeg: 275,
    windGustKmh: 31,
    precipitationMm: 0.4,
    cloudCoverPercent: 82,
    observedAt: "2026-06-11T18:30",
    locationLabel: "Istanbul, TR",
  });
  assert.equal("latitude" in conditions, false);
  assert.equal("longitude" in conditions, false);
  assert.equal(isAmbientConditions(conditions), true);
  assert.equal(isAmbientConditions({ weather: "clear" }), false);
});

test("resolves local, default, and off presentation modes", () => {
  const fallback = {
    available: false,
    source: "fallback" as const,
    weather: "clear" as const,
    phase: "day" as const,
    isDay: true,
    temperatureC: null,
    windSpeedKmh: 8,
    windDirectionDeg: 260,
    windGustKmh: 12,
    precipitationMm: 0,
    cloudCoverPercent: 20,
    observedAt: null,
    locationLabel: null,
  };

  assert.deepEqual(resolveAmbientPresentation("local", fallback, "dusk"), {
    phase: "dusk",
    weather: "clear",
    particlesEnabled: true,
  });
  assert.deepEqual(resolveAmbientPresentation("default", fallback, "night"), {
    phase: "default",
    weather: "clear",
    particlesEnabled: true,
  });
  assert.deepEqual(resolveAmbientPresentation("off", fallback, "night"), {
    phase: "default",
    weather: "clear",
    particlesEnabled: false,
  });
});
