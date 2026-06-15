"use client";

import { useAmbient } from "@/components/ambient-provider";
import { useLanguage } from "@/components/preferences-provider";

export function AtmosphereStatus() {
  const { conditions, status } = useAmbient();
  const { content } = useLanguage();
  const atmosphere = content.atmosphere;

  // Mirrors getAmbientStatusLabel() in lib/ambient.ts, but with localized labels.
  // The pure function stays English (it is unit-tested); the UI label is built here.
  const label =
    status === "live" && conditions.available
      ? [
          atmosphere.weatherLabels[conditions.weather],
          atmosphere.phaseLabels[conditions.phase],
          conditions.temperatureC === null
            ? null
            : `${Math.round(conditions.temperatureC)}°C`,
        ]
          .filter(Boolean)
          .join(" · ")
      : "";

  return (
    <div
      className="atmosphere-status"
      aria-label={
        label
          ? `${atmosphere.weatherPrefix}: ${label}`
          : atmosphere.weatherUnavailable
      }
    >
      <span className="atmosphere-indicator" aria-hidden="true" />
      {label ? <span className="atmosphere-status-label">{label}</span> : null}
    </div>
  );
}
