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
  type AmbientConditions,
} from "@/lib/ambient";

type AmbientStatus = "loading" | "live" | "fallback";

type AmbientContextValue = {
  conditions: AmbientConditions;
  status: AmbientStatus;
};

const REFRESH_INTERVAL_MS = 20 * 60 * 1000;
const AmbientContext = createContext<AmbientContextValue | null>(null);

export function AmbientProvider({ children }: { children: ReactNode }) {
  const [conditions, setConditions] = useState<AmbientConditions>(
    defaultAmbientConditions,
  );
  const [status, setStatus] = useState<AmbientStatus>("loading");

  useEffect(() => {
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

        if (payload.available) {
          setConditions(payload);
          setStatus("live");
        } else {
          setConditions({
            ...defaultAmbientConditions,
            phase: getBrowserTimePhase(),
          });
          setStatus("fallback");
        }
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
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.ambientPhase = conditions.phase;
    root.dataset.ambientWeather = conditions.weather;
    root.dataset.ambientSeason = conditions.season;
  }, [conditions]);

  const value = useMemo(
    () => ({
      conditions,
      status,
    }),
    [conditions, status],
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
