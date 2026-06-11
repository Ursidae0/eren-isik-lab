"use client";

import { useRef } from "react";

import { useAmbient } from "@/components/ambient-provider";
import type { AmbientPreference } from "@/lib/ambient";

const options: Array<{
  value: AmbientPreference;
  label: string;
  description: string;
}> = [
  {
    value: "local",
    label: "Local",
    description: "Follow local daylight and weather.",
  },
  {
    value: "default",
    label: "Default",
    description: "Use the portfolio's original forest.",
  },
  {
    value: "off",
    label: "Off",
    description: "Keep the layout and remove particles.",
  },
];

const weatherLabels = {
  clear: "Clear",
  cloudy: "Cloudy",
  fog: "Fog",
  rain: "Rain",
  snow: "Snow",
} as const;

export function AtmosphereControl() {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const { conditions, preference, setPreference, status } = useAmbient();
  const activeLabel =
    options.find((option) => option.value === preference)?.label ?? "Local";
  const localStatus =
    status === "loading"
      ? "Reading the local atmosphere..."
      : conditions.available
        ? [
            conditions.locationLabel,
            weatherLabels[conditions.weather],
            conditions.temperatureC === null
              ? null
              : `${Math.round(conditions.temperatureC)}°C`,
          ]
            .filter(Boolean)
            .join(" · ")
        : "Local clock active. Weather is unavailable.";

  const selectPreference = (nextPreference: AmbientPreference) => {
    setPreference(nextPreference);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  return (
    <details ref={detailsRef} className="atmosphere-control">
      <summary
        className="atmosphere-summary"
        aria-label={`Atmosphere: ${activeLabel}`}
      >
        <span className="atmosphere-indicator" aria-hidden="true" />
        <span className="atmosphere-summary-label">
          Atmosphere · {activeLabel}
        </span>
        <span className="atmosphere-summary-compact" aria-hidden="true">
          {activeLabel}
        </span>
      </summary>

      <div className="atmosphere-panel">
        <p className="atmosphere-panel-title">Atmosphere</p>
        <p className="atmosphere-panel-status">{localStatus}</p>

        <div className="atmosphere-options" role="group" aria-label="Atmosphere">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="atmosphere-option"
              aria-pressed={preference === option.value}
              onClick={() => selectPreference(option.value)}
            >
              <span>{option.label}</span>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
      </div>
    </details>
  );
}
