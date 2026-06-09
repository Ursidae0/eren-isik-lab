"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

const instruction =
  "Secure uplink ready. Identify your callsign, define a return channel, then enter mission coordinates.";

type TransmissionState =
  | { status: "idle"; message: string }
  | { status: "sending"; message: string }
  | {
      status: "success";
      message: string;
      transmissionId: string;
      mode: string;
    }
  | { status: "error"; message: string };

export function MissionControl() {
  const prefersReducedMotion = useReducedMotion();
  const [typedInstruction, setTypedInstruction] = useState(
    prefersReducedMotion ? instruction : "",
  );
  const [state, setState] = useState<TransmissionState>({
    status: "idle",
    message: "Awaiting transmission.",
  });

  useEffect(() => {
    if (prefersReducedMotion) {
      setTypedInstruction(instruction);
      return;
    }

    let characterIndex = 0;
    const timer = window.setInterval(() => {
      characterIndex += 1;
      setTypedInstruction(instruction.slice(0, characterIndex));

      if (characterIndex >= instruction.length) {
        window.clearInterval(timer);
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setState({
      status: "sending",
      message: "Encrypting packet and negotiating uplink...",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callsign: formData.get("callsign"),
          email: formData.get("email"),
          message: formData.get("message"),
          website: formData.get("website"),
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        message: string;
        transmissionId?: string;
        mode?: string;
      };

      if (!response.ok || !result.ok) {
        setState({
          status: "error",
          message: result.message ?? "Transmission failed.",
        });
        return;
      }

      setState({
        status: "success",
        message: result.message,
        transmissionId: result.transmissionId ?? "UNKNOWN",
        mode: result.mode ?? "unknown",
      });
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "Relay unavailable. Check the uplink and retry.",
      });
    }
  }

  return (
    <section
      id="mission-control"
      className="relative z-20 border-t border-white/[0.06] px-6 py-24 sm:px-10 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terminal">
            Mission Control
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-mist-100 sm:text-5xl">
            Establish a
            <span className="block text-mist-600">secure uplink.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-mist-300">
            Project inquiry, technical collaboration, or an interesting systems
            problem. Send the essential coordinates and I will respond through
            the supplied return channel.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-mist-600">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <span className="block text-terminal">TLS</span>
              encrypted route
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <span className="block text-terminal">&lt; 48H</span>
              response target
            </div>
          </div>
        </div>

        <motion.div
          initial={false}
          whileHover={{ borderColor: "rgba(0, 255, 65, 0.18)" }}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-forest-950/70 shadow-glass backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-mist-700" />
              <span className="size-2 rounded-full bg-mist-700" />
              <span className="size-2 rounded-full bg-terminal/70" />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist-600">
              mc://erenisiklab/contact
            </p>
          </div>

          <div className="p-5 sm:p-8">
            <div className="min-h-20 font-mono text-xs leading-6 text-mist-300">
              <p className="text-terminal">
                root@mission-control:~$ ./open_uplink
              </p>
              <p className="mt-2">
                {typedInstruction}
                <span className="terminal-cursor" aria-hidden="true">
                  _
                </span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="terminal-field">
                <label htmlFor="callsign" className="terminal-prompt">
                  callsign@
                </label>
                <input
                  id="callsign"
                  name="callsign"
                  type="text"
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  required
                  placeholder="name or organization"
                  className="terminal-input"
                />
              </div>

              <div className="terminal-field">
                <label htmlFor="email" className="terminal-prompt">
                  return_channel@
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={160}
                  autoComplete="email"
                  required
                  placeholder="operator@example.com"
                  className="terminal-input"
                />
              </div>

              <div className="terminal-field items-start">
                <label htmlFor="message" className="terminal-prompt pt-2">
                  coordinates@
                </label>
                <textarea
                  id="message"
                  name="message"
                  minLength={10}
                  maxLength={2000}
                  rows={7}
                  required
                  placeholder="mission objective, constraints, timeline..."
                  className="terminal-input resize-y leading-6"
                />
              </div>

              <div className="absolute -left-[10000px]" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div
                  className="min-h-10 font-mono text-[10px] uppercase tracking-[0.1em]"
                  aria-live="polite"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={state.status + state.message}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className={
                        state.status === "error"
                          ? "text-red-300"
                          : state.status === "success"
                            ? "text-terminal"
                            : "text-mist-600"
                      }
                    >
                      <p>{state.message}</p>
                      {state.status === "success" ? (
                        <p className="mt-1 text-mist-600">
                          ID: {state.transmissionId} / MODE: {state.mode}
                        </p>
                      ) : null}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  disabled={state.status === "sending"}
                  className="terminal-button justify-center disabled:cursor-wait disabled:opacity-60"
                >
                  {state.status === "sending"
                    ? "Transmitting..."
                    : "Transmit packet"}
                  <span aria-hidden="true">-&gt;</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

