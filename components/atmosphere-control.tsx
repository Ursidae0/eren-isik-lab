"use client";

import { useAmbient } from "@/components/ambient-provider";
import { getAmbientStatusLabel } from "@/lib/ambient";

export function AtmosphereStatus() {
  const { conditions, status } = useAmbient();
  const label = status === "live" ? getAmbientStatusLabel(conditions) : "";

  return (
    <div
      className="atmosphere-status"
      aria-label={label ? `Current weather: ${label}` : "Weather unavailable"}
    >
      <span className="atmosphere-indicator" aria-hidden="true" />
      {label ? <span className="atmosphere-status-label">{label}</span> : null}
    </div>
  );
}
