"use client";

import { motion } from "framer-motion";

import { GlassCard } from "@/components/ui/glass-card";

const capabilities = [
  {
    index: "01",
    title: "Robotic Systems",
    description: "Perception, planning, and precise real-time control.",
  },
  {
    index: "02",
    title: "GPU Compute",
    description: "CUDA kernels shaped for throughput and low latency.",
  },
  {
    index: "03",
    title: "Embedded Edge",
    description: "Reliable firmware where compute meets the physical world.",
  },
];

export function Hero() {
  return (
    <section
      id="about"
      className="relative z-20 mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-6 pb-20 pt-32 sm:px-10 lg:px-12 lg:pt-36"
    >
      <div className="grid w-full items-center gap-16 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 flex items-center gap-3 font-mono text-[11px] tracking-[0.22em] text-terminal/80">
            <span className="status-dot" aria-hidden="true" />
            SYSTEMS ENGINEERING / ISTANBUL
          </div>

          <h1 className="max-w-4xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.055em] text-mist-100 sm:text-7xl lg:text-[5.6rem]">
            Intelligence,
            <span className="block text-mist-300">built closer to</span>
            <span className="text-terminal">the machine.</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-8 text-mist-300 sm:text-lg">
            I design high-performance systems across robotics, GPU computing,
            and embedded hardware, turning difficult constraints into precise,
            dependable technology.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="terminal-button"
            >
              Explore systems
              <span aria-hidden="true">-&gt;</span>
            </a>
            <a
              href="#mission-control"
              className="rounded-xl border border-white/10 px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-mist-300 transition-colors hover:border-terminal/30 hover:text-terminal"
            >
              Open channel
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.18,
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative"
        >
          <div className="absolute -inset-12 -z-10 rounded-full bg-terminal/[0.04] blur-3xl" />
          <GlassCard hover={false} className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="size-2 rounded-full bg-mist-700" />
                <span className="size-2 rounded-full bg-mist-700" />
                <span className="size-2 rounded-full bg-terminal/60" />
              </div>
              <span className="font-mono text-[10px] tracking-[0.16em] text-mist-600">
                LAB_STATUS.LOG
              </span>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <p className="font-mono text-xs leading-7 text-mist-300">
                <span className="text-terminal">&gt;</span> boot portfolio_core
                <br />
                <span className="text-terminal">&gt;</span> load robotics.stack
                <br />
                <span className="text-terminal">&gt;</span> mount cuda.kernels
                <br />
                <span className="text-terminal">&gt;</span> link embedded.io
              </p>

              <div className="h-px bg-gradient-to-r from-terminal/35 to-transparent" />

              <dl className="grid grid-cols-2 gap-5">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist-600">
                    Focus
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-mist-100">
                    Real-time compute
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-mist-600">
                    Runtime
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-mist-100">
                    Hardware aware
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-2 rounded-lg border border-terminal/10 bg-terminal/[0.035] px-4 py-3 font-mono text-[10px] tracking-[0.12em] text-terminal">
                <span className="status-dot" aria-hidden="true" />
                ALL SYSTEMS NOMINAL
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      <div
        className="absolute inset-x-6 bottom-7 hidden grid-cols-3 gap-3 xl:grid"
      >
        {capabilities.map((capability, index) => (
          <motion.div
            key={capability.index}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + index * 0.1, duration: 0.55 }}
          >
            <GlassCard className="h-full px-5 py-4">
              <div className="flex items-start gap-4">
                <span className="font-mono text-[10px] text-terminal/70">
                  {capability.index}
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-mist-100">
                    {capability.title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-mist-600">
                    {capability.description}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
