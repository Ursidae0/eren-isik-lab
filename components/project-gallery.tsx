"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  projectCategories,
  type Project,
  type ProjectCategory,
} from "@/lib/projects";

type ProjectGalleryProps = {
  projects: Project[];
};

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const [activeCategory, setActiveCategory] =
    useState<ProjectCategory>("All");

  const visibleProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((project) =>
            project.categories.includes(activeCategory),
          ),
    [activeCategory, projects],
  );

  return (
    <section
      id="projects"
      className="relative z-20 border-t border-white/[0.06] px-6 py-24 sm:px-10 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-terminal">
              Selected engineering work
            </p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] text-mist-100 sm:text-5xl">
              Projects measured in evidence,
              <span className="text-mist-600"> not adjectives.</span>
            </h2>
          </div>

          <div
            className="flex flex-wrap gap-2"
            aria-label="Filter projects by category"
          >
            {projectCategories.map((category) => {
              const isActive = category === activeCategory;

              return (
                <button
                  key={category}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${
                    isActive
                      ? "border-terminal/40 bg-terminal/10 text-terminal"
                      : "border-white/10 bg-white/[0.025] text-mist-600 hover:border-terminal/20 hover:text-mist-100"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <motion.div layout className="mt-12 grid gap-5 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleProjects.map((project, index) => (
              <motion.article
                layout
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{
                  duration: 0.28,
                  delay: index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="glass-card group flex min-h-[31rem] flex-col overflow-hidden p-6 transition-colors hover:border-terminal/20"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex flex-wrap gap-2">
                    {project.categories.map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-terminal/15 bg-terminal/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-terminal/80"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] text-mist-600">
                    0{index + 1}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mist-600">
                    {project.period}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-mist-100">
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-mist-300">
                    {project.summary}
                  </p>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-2">
                  {project.metrics.slice(0, 2).map((metric) => (
                    <div
                      key={`${project.id}-${metric.label}`}
                      className="rounded-xl border border-white/[0.06] bg-forest-950/35 p-3"
                    >
                      <p className="font-mono text-lg font-semibold text-terminal">
                        {metric.value}
                      </p>
                      <p className="mt-1 text-[10px] leading-4 text-mist-600">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <div className="mb-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-mist-600">
                    {project.technologies.slice(0, 4).map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between border-t border-white/[0.07] pt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-mist-300 transition-colors group-hover:text-terminal"
                  >
                    Read technical brief
                    <span aria-hidden="true">-&gt;</span>
                  </Link>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>

        <p
          className="mt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-mist-600"
          aria-live="polite"
        >
          Showing {visibleProjects.length} of {projects.length} projects
        </p>
      </div>
    </section>
  );
}

