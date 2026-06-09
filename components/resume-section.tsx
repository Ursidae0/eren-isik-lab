"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

type Skill = {
  name: string;
  domain: string;
  proficiency: string;
  evidence: string;
  signal: string;
};

const skills: Skill[] = [
  {
    name: "C / C++",
    domain: "Embedded control",
    proficiency: "Applied systems",
    evidence: "1 kHz rover control loop, Pico SDK firmware, safety layers.",
    signal: "REALTIME",
  },
  {
    name: "CUDA",
    domain: "Parallel compute",
    proficiency: "Performance engineering",
    evidence: "SpMM / SDDMM profiling with 7.8x measured speedup.",
    signal: "4.3 TFLOPs",
  },
  {
    name: "ROS 2",
    domain: "Robotics middleware",
    proficiency: "Systems integration",
    evidence: "Jetson host driver for a custom USB CDC binary protocol.",
    signal: "JETSON",
  },
  {
    name: "Python",
    domain: "Vision and tooling",
    proficiency: "Production research",
    evidence: "Model deployment, computer vision pipelines, and evaluation.",
    signal: "CV / ML",
  },
  {
    name: "TensorRT",
    domain: "Edge inference",
    proficiency: "Deployment and profiling",
    evidence: "Three optimized networks compared on Jetson Nano.",
    signal: "99.9% SM",
  },
  {
    name: "OpenCV",
    domain: "Computer vision",
    proficiency: "Applied pipelines",
    evidence: "Crowd estimation and retinal vessel extraction workflows.",
    signal: "92.6% PX",
  },
];

export function ResumeSection() {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  return (
    <section
      id="resume"
      className="relative z-20 px-6 pb-24 sm:px-10 lg:px-12"
    >
      <div className="mx-auto max-w-7xl rounded-3xl border border-white/[0.08] bg-forest-950/45 p-6 shadow-glass backdrop-blur-xl sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terminal">
              Technical dossier
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-mist-100 sm:text-5xl">
              Resume and
              <span className="text-mist-600"> capability matrix.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-mist-300">
              The full 2026 resume contains education, rover experience,
              measured GPU results, and computer-vision research reproductions.
            </p>
          </div>

          <motion.a
            href="/eren-isik-resume-2026.pdf"
            download
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="terminal-button shrink-0 justify-center px-6 py-4"
          >
            Download PDF
            <span aria-hidden="true">[160 KB]</span>
          </motion.a>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, index) => {
            const isActive = activeSkill === skill.name;

            return (
              <motion.button
                key={skill.name}
                type="button"
                aria-expanded={isActive}
                onMouseEnter={() => setActiveSkill(skill.name)}
                onMouseLeave={() => setActiveSkill(null)}
                onFocus={() => setActiveSkill(skill.name)}
                onBlur={() => setActiveSkill(null)}
                onClick={() =>
                  setActiveSkill(isActive ? null : skill.name)
                }
                whileHover={{
                  y: -6,
                  rotateX: 2,
                  rotateY: index % 2 === 0 ? -2 : 2,
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="skill-depth-card min-h-52 overflow-hidden p-5 text-left"
                style={{ transformPerspective: 900 }}
              >
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist-600">
                        {skill.domain}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-mist-100">
                        {skill.name}
                      </h3>
                    </div>
                    <span className="font-mono text-[10px] text-terminal">
                      {skill.signal}
                    </span>
                  </div>

                  <p className="mt-auto font-mono text-[10px] uppercase tracking-[0.12em] text-mist-600">
                    {isActive ? "Signal decoded" : "Hover / focus to decode"}
                  </p>

                  <AnimatePresence initial={false}>
                    {isActive ? (
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute inset-x-0 bottom-7 rounded-xl border border-terminal/15 bg-forest-950/95 p-4 shadow-terminal backdrop-blur"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-terminal">
                          {skill.proficiency}
                        </p>
                        <p className="mt-2 text-xs leading-5 text-mist-300">
                          {skill.evidence}
                        </p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

