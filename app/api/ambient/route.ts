import {
  defaultAmbientConditions,
  getLocationCacheKey,
  normalizeOpenMeteoResponse,
  readCoarseLocation,
  type AmbientConditions,
  type OpenMeteoResponse,
} from "@/lib/ambient";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 20 * 60 * 1000;
const WEATHER_TIMEOUT_MS = 3500;
const DEFAULT_WEATHER_ENDPOINT =
  "https://api.open-meteo.com/v1/forecast";

type CacheEntry = {
  expiresAt: number;
  value: AmbientConditions;
};

const ambientCache = new Map<string, CacheEntry>();

function fallbackResponse(reason: string) {
  return Response.json(
    {
      ...defaultAmbientConditions,
      reason,
    },
    {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    },
  );
}

export async function GET(request: Request) {
  const location = readCoarseLocation(request.headers);

  if (!location) {
    return fallbackResponse("location_unavailable");
  }

  const cacheKey = getLocationCacheKey(location);
  const cached = ambientCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return Response.json(cached.value, {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Ambient-Cache": "hit",
      },
    });
  }

  const endpoint = new URL(
    process.env.AMBIENT_WEATHER_ENDPOINT || DEFAULT_WEATHER_ENDPOINT,
  );
  const parameters = {
    latitude: location.latitude.toFixed(1),
    longitude: location.longitude.toFixed(1),
    current: [
      "temperature_2m",
      "is_day",
      "precipitation",
      "rain",
      "showers",
      "snowfall",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
    ].join(","),
    daily: "sunrise,sunset",
    forecast_days: "1",
    timezone: "auto",
  };

  for (const [key, value] of Object.entries(parameters)) {
    endpoint.searchParams.set(key, value);
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "erenisiklab.com ambient weather",
      },
      signal: AbortSignal.timeout(WEATHER_TIMEOUT_MS),
    });

    if (!response.ok) {
      return fallbackResponse("weather_unavailable");
    }

    const payload = (await response.json()) as OpenMeteoResponse;
    const conditions = normalizeOpenMeteoResponse(payload, location);
    ambientCache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      value: conditions,
    });

    return Response.json(conditions, {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Ambient-Cache": "miss",
      },
    });
  } catch {
    return fallbackResponse("weather_unavailable");
  }
}
