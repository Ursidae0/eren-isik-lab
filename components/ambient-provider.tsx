"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  defaultAmbientConditions,
  getBrowserTimePhase,
  isAmbientConditions,
  resolveAmbientPresentation,
  type AmbientConditions,
  type AmbientPreference,
} from "@/lib/ambient";

type AmbientStatus = "loading" | "live" | "fallback";

type AmbientContextValue = {
  conditions: AmbientConditions;
  preference: AmbientPreference;
  setPreference: (preference: AmbientPreference) => void;
  status: AmbientStatus;
};

const STORAGE_KEY = "eren-isik-atmosphere";
const REFRESH_INTERVAL_MS = 20 * 60 * 1000;

const AmbientContext = createContext<AmbientContextValue | null>(null);

function isAmbientPreference(value: string | null): value is AmbientPreference {
  return value === "local" || value === "default" || value === "off";
}

export function AmbientProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] =
    useState<AmbientPreference>("local");
  const [conditions, setConditions] = useState<AmbientConditions>(
    defaultAmbientConditions,
  );
  const [status, setStatus] = useState<AmbientStatus>("loading");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(STORAGE_KEY);
    if (isAmbientPreference(storedPreference)) {
      setPreferenceState(storedPreference);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || preference !== "local") {
      setStatus("fallback");
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadConditions = async () => {
      if (document.visibilityState !== "visible") {
        return;
      }

      setStatus((current) => (current === "live" ? current : "loading"));

      try {
        const response = await fetch("/api/ambient", {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        });
        const payload = (await response.json()) as unknown;

        if (!active || !response.ok || !isAmbientConditions(payload)) {
          throw new Error("Invalid ambient response");
        }

        setConditions(payload);
        setStatus(payload.available ? "live" : "fallback");
      } catch (error) {
        if (
          !active ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        setConditions({
          ...defaultAmbientConditions,
          phase: getBrowserTimePhase(),
        });
        setStatus("fallback");
      }
    };

    void loadConditions();
    const interval = window.setInterval(loadConditions, REFRESH_INTERVAL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void loadConditions();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [hydrated, preference]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const root = document.documentElement;
    const presentation = resolveAmbientPresentation(
      preference,
      conditions,
      getBrowserTimePhase(),
    );

    root.dataset.atmosphere = preference;
    root.dataset.ambientPhase = presentation.phase;
    root.dataset.ambientWeather = presentation.weather;
    root.dataset.ambientParticles = presentation.particlesEnabled
      ? "on"
      : "off";
  }, [conditions, hydrated, preference]);

  const setPreference = (nextPreference: AmbientPreference) => {
    setPreferenceState(nextPreference);
    window.localStorage.setItem(STORAGE_KEY, nextPreference);
  };

  const value = useMemo(
    () => ({
      conditions,
      preference,
      setPreference,
      status,
    }),
    [conditions, preference, status],
  );

  return (
    <AmbientContext.Provider value={value}>
      {children}
    </AmbientContext.Provider>
  );
}

export function useAmbient() {
  const context = useContext(AmbientContext);

  if (!context) {
    throw new Error("useAmbient must be used inside AmbientProvider");
  }

  return context;
}
