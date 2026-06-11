export const ambientWeatherModes = [
  "clear",
  "cloudy",
  "fog",
  "rain",
  "snow",
] as const;

export const ambientPhases = ["dawn", "day", "dusk", "night"] as const;

export type AmbientWeatherMode = (typeof ambientWeatherModes)[number];
export type AmbientPhase = (typeof ambientPhases)[number];
export type AmbientPreference = "local" | "default" | "off";

export type AmbientParticleProfile = {
  leafFactor: number;
  rainDensity: number;
  snowDensity: number;
  turbulence: number;
};

export type AmbientConditions = {
  available: boolean;
  source: "local" | "fallback";
  weather: AmbientWeatherMode;
  phase: AmbientPhase;
  isDay: boolean;
  temperatureC: number | null;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windGustKmh: number;
  precipitationMm: number;
  cloudCoverPercent: number;
  observedAt: string | null;
  locationLabel: string | null;
};

export type CoarseLocation = {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
};

export type OpenMeteoResponse = {
  current?: {
    time?: string;
    temperature_2m?: number;
    is_day?: number;
    precipitation?: number;
    rain?: number;
    showers?: number;
    snowfall?: number;
    weather_code?: number;
    cloud_cover?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
};

export const defaultAmbientConditions: AmbientConditions = {
  available: false,
  source: "fallback",
  weather: "clear",
  phase: "day",
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getWindVector(directionDeg: number, speedKmh: number) {
  const towardRadians = ((directionDeg + 180) * Math.PI) / 180;
  const strength = clamp(speedKmh / 35, 0, 1.4);

  return {
    x: Math.sin(towardRadians) * strength,
    y: -Math.cos(towardRadians) * strength,
    strength,
  };
}

export function getParticleProfile(
  weather: AmbientWeatherMode,
  precipitationMm: number,
  windGustKmh: number,
): AmbientParticleProfile {
  const precipitation = clamp(precipitationMm, 0, 4);
  const turbulence = clamp(windGustKmh / 45, 0.18, 1.35);

  if (weather === "rain") {
    return {
      leafFactor: 0.58,
      rainDensity: Math.round(14 + precipitation * 8),
      snowDensity: 0,
      turbulence,
    };
  }

  if (weather === "snow") {
    return {
      leafFactor: 0.38,
      rainDensity: 0,
      snowDensity: Math.round(13 + precipitation * 6),
      turbulence: turbulence * 0.7,
    };
  }

  return {
    leafFactor: weather === "fog" ? 0.72 : 1,
    rainDensity: 0,
    snowDensity: 0,
    turbulence,
  };
}

export function resolveAmbientPresentation(
  preference: AmbientPreference,
  conditions: AmbientConditions,
  browserPhase: AmbientPhase,
) {
  if (preference === "off") {
    return {
      phase: "default" as const,
      weather: "clear" as const,
      particlesEnabled: false,
    };
  }

  if (preference === "default") {
    return {
      phase: "default" as const,
      weather: "clear" as const,
      particlesEnabled: true,
    };
  }

  return {
    phase: conditions.available ? conditions.phase : browserPhase,
    weather: conditions.available ? conditions.weather : ("clear" as const),
    particlesEnabled: true,
  };
}

export function isAmbientConditions(value: unknown): value is AmbientConditions {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AmbientConditions>;
  return (
    typeof candidate.available === "boolean" &&
    (candidate.source === "local" || candidate.source === "fallback") &&
    ambientWeatherModes.includes(candidate.weather as AmbientWeatherMode) &&
    ambientPhases.includes(candidate.phase as AmbientPhase) &&
    typeof candidate.isDay === "boolean" &&
    typeof candidate.windSpeedKmh === "number" &&
    typeof candidate.windDirectionDeg === "number" &&
    typeof candidate.windGustKmh === "number" &&
    typeof candidate.precipitationMm === "number" &&
    typeof candidate.cloudCoverPercent === "number"
  );
}

function finiteNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : fallback;
}

function optionalFiniteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function parseCoordinate(value: string | null, min: number, max: number) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? parsed
    : null;
}

function normalizeHeaderLabel(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed && trimmed.length <= 120 ? trimmed : null;
}

export function readCoarseLocation(headers: Headers): CoarseLocation | null {
  const latitude = parseCoordinate(headers.get("cf-iplatitude"), -90, 90);
  const longitude = parseCoordinate(headers.get("cf-iplongitude"), -180, 180);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    latitude: Math.round(latitude * 10) / 10,
    longitude: Math.round(longitude * 10) / 10,
    city: normalizeHeaderLabel(headers.get("cf-ipcity")),
    country: normalizeHeaderLabel(headers.get("cf-ipcountry")),
  };
}

export function getLocationCacheKey(location: CoarseLocation) {
  return `${location.latitude.toFixed(1)},${location.longitude.toFixed(1)}`;
}

export function normalizeWeatherCode(code: number): AmbientWeatherMode {
  if ([45, 48].includes(code)) {
    return "fog";
  }

  if (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  ) {
    return "rain";
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return "snow";
  }

  if (code === 2 || code === 3) {
    return "cloudy";
  }

  return "clear";
}

function parseLocalMinutes(value: string | undefined) {
  if (!value) {
    return null;
  }

  const match = value.match(/T(\d{2}):(\d{2})/);
  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

export function getAmbientPhase(
  currentTime: string | undefined,
  sunrise: string | undefined,
  sunset: string | undefined,
  isDay: boolean,
): AmbientPhase {
  const currentMinutes = parseLocalMinutes(currentTime);
  const sunriseMinutes = parseLocalMinutes(sunrise);
  const sunsetMinutes = parseLocalMinutes(sunset);

  if (
    currentMinutes === null ||
    sunriseMinutes === null ||
    sunsetMinutes === null
  ) {
    return isDay ? "day" : "night";
  }

  if (
    currentMinutes >= sunriseMinutes - 45 &&
    currentMinutes < sunriseMinutes + 35
  ) {
    return "dawn";
  }

  if (
    currentMinutes >= sunsetMinutes - 45 &&
    currentMinutes < sunsetMinutes + 45
  ) {
    return "dusk";
  }

  return currentMinutes >= sunriseMinutes + 35 &&
    currentMinutes < sunsetMinutes - 45
    ? "day"
    : "night";
}

export function getBrowserTimePhase(date = new Date()): AmbientPhase {
  const hour = date.getHours() + date.getMinutes() / 60;

  if (hour >= 5 && hour < 7) {
    return "dawn";
  }

  if (hour >= 7 && hour < 17.5) {
    return "day";
  }

  if (hour >= 17.5 && hour < 20) {
    return "dusk";
  }

  return "night";
}

export function normalizeOpenMeteoResponse(
  response: OpenMeteoResponse,
  location: CoarseLocation,
): AmbientConditions {
  const current = response.current ?? {};
  const isDay = current.is_day === 1;
  const weatherCode = finiteNumber(current.weather_code, 0);
  const precipitation =
    finiteNumber(current.precipitation, 0) +
    finiteNumber(current.snowfall, 0) * 0.7;
  const locationLabel =
    location.city && location.country
      ? `${location.city}, ${location.country}`
      : location.city ?? location.country;

  return {
    available: true,
    source: "local",
    weather: normalizeWeatherCode(weatherCode),
    phase: getAmbientPhase(
      current.time,
      response.daily?.sunrise?.[0],
      response.daily?.sunset?.[0],
      isDay,
    ),
    isDay,
    temperatureC: optionalFiniteNumber(current.temperature_2m),
    windSpeedKmh: Math.max(0, finiteNumber(current.wind_speed_10m, 8)),
    windDirectionDeg:
      ((finiteNumber(current.wind_direction_10m, 260) % 360) + 360) % 360,
    windGustKmh: Math.max(
      0,
      finiteNumber(current.wind_gusts_10m, current.wind_speed_10m ?? 12),
    ),
    precipitationMm: Math.max(0, precipitation),
    cloudCoverPercent: Math.min(
      100,
      Math.max(0, finiteNumber(current.cloud_cover, 20)),
    ),
    observedAt: current.time ?? null,
    locationLabel,
  };
}
