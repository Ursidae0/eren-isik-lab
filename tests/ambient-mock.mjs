import { createServer } from "node:http";

const payload = {
  current: {
    time: "2026-06-11T18:30",
    temperature_2m: 24.4,
    is_day: 1,
    precipitation: 0.4,
    rain: 0.4,
    showers: 0,
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
};

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://ambient-mock");
  const hasExpectedLocation =
    url.searchParams.get("latitude") === "41.0" &&
    url.searchParams.get("longitude") === "29.0";

  if (url.pathname !== "/v1/forecast" || !hasExpectedLocation) {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "unexpected_request" }));
    return;
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}).listen(4000, "0.0.0.0");
