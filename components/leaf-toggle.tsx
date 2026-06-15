"use client";

import { useLanguage, useLeaves } from "@/components/preferences-provider";

export function LeafToggle() {
  const { leavesEnabled, setLeavesEnabled } = useLeaves();
  const { content } = useLanguage();
  const ariaLabel = leavesEnabled
    ? content.controls.leafToggleOnAria
    : content.controls.leafToggleOffAria;

  return (
    <button
      type="button"
      className="leaf-toggle"
      data-active={leavesEnabled ? "true" : "false"}
      aria-pressed={leavesEnabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={() => setLeavesEnabled(!leavesEnabled)}
    >
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    </button>
  );
}
