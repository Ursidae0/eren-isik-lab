"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultLocale,
  getContent,
  isLocale,
  type Content,
  type Locale,
} from "@/lib/content";

const LANG_STORAGE_KEY = "eil:lang";
const LEAVES_STORAGE_KEY = "eil:leaves";

type PreferencesContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  content: Content;
  leavesEnabled: boolean;
  setLeavesEnabled: (enabled: boolean) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  // The server and the first client (hydration) render both use the defaults so
  // the markup matches. The pre-hydration script (see PreferencesScript) has
  // already resolved the real values onto <html> from localStorage/navigator;
  // the effect below syncs React state to them right after mount.
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [leavesEnabled, setLeavesEnabledState] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isLocale(root.dataset.lang)) {
      setLocaleState(root.dataset.lang);
    }
    if (root.dataset.leaves === "off") {
      setLeavesEnabledState(false);
    }
  }, []);

  // Reflect the active locale onto the document (CSS / a11y / hydration parity).
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dataset.lang = locale;
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.leaves = leavesEnabled ? "on" : "off";
  }, [leavesEnabled]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode); preference is session-only.
    }
  }, []);

  const setLeavesEnabled = useCallback((next: boolean) => {
    setLeavesEnabledState(next);
    try {
      window.localStorage.setItem(LEAVES_STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Ignore storage failures; preference is session-only.
    }
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      locale,
      setLocale,
      content: getContent(locale),
      leavesEnabled,
      setLeavesEnabled,
    }),
    [locale, setLocale, leavesEnabled, setLeavesEnabled],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used inside PreferencesProvider");
  }
  return context;
}

export function useLanguage() {
  const { locale, setLocale, content } = usePreferences();
  return { locale, setLocale, content };
}

export function useLeaves() {
  const { leavesEnabled, setLeavesEnabled } = usePreferences();
  return { leavesEnabled, setLeavesEnabled };
}
