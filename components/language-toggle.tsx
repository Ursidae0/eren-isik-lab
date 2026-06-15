"use client";

import { useLanguage } from "@/components/preferences-provider";
import { locales } from "@/lib/content";

export function LanguageToggle() {
  const { locale, setLocale, content } = useLanguage();

  return (
    <div
      className="lang-toggle"
      role="group"
      aria-label={content.controls.languageToggleAria}
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          className="lang-toggle-option"
          data-active={code === locale ? "true" : "false"}
          aria-pressed={code === locale}
          onClick={() => setLocale(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
