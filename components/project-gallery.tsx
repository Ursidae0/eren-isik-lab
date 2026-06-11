"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { Project } from "@/lib/projects";

type ProjectGalleryProps = {
  projects: Project[];
};

const treePaths = [
  "M64 1185C49 1070 72 970 57 853C44 750 70 644 59 531C49 426 71 320 62 210C57 143 62 86 60 14",
  "M60 180C39 153 22 136 7 126M61 365C79 333 93 307 113 287M59 554C37 526 21 501 4 478M58 749C80 717 96 689 115 666M57 941C37 915 21 888 4 861",
  "M59 1183C39 1190 23 1196 8 1200M61 1183C81 1190 98 1196 114 1200",
];

const cardBounds = new WeakMap<HTMLAnchorElement, DOMRect>();

function TreeSvg({ progress = false }: { progress?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 1200"
      preserveAspectRatio="none"
      className={progress ? "project-tree-svg-progress" : undefined}
    >
      {treePaths.map((path, index) => (
        <path
          key={path}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={index === 0 ? 9 : index === 1 ? 4 : 5}
        />
      ))}
    </svg>
  );
}

function handleCardPointerMove(event: ReactPointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse") {
    return;
  }

  const card = event.currentTarget;
  const bounds = cardBounds.get(card) ?? card.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;

  card.style.setProperty("--card-rotate-x", `${(0.5 - y) * 5}deg`);
  card.style.setProperty("--card-rotate-y", `${(x - 0.5) * 6}deg`);
  card.style.setProperty("--card-glow-x", `${x * 100}%`);
  card.style.setProperty("--card-glow-y", `${y * 100}%`);
}

function cacheCardBounds(event: ReactPointerEvent<HTMLAnchorElement>) {
  if (event.pointerType === "mouse") {
    cardBounds.set(
      event.currentTarget,
      event.currentTarget.getBoundingClientRect(),
    );
  }
}

function resetCardTilt(event: ReactPointerEvent<HTMLAnchorElement>) {
  const card = event.currentTarget;
  cardBounds.delete(card);
  card.style.setProperty("--card-rotate-x", "0deg");
  card.style.setProperty("--card-rotate-y", "0deg");
  card.style.setProperty("--card-glow-x", "50%");
  card.style.setProperty("--card-glow-y", "50%");
}

export function ProjectGallery({ projects }: ProjectGalleryProps) {
  const treeRef = useRef<HTMLDivElement>(null);
  const growthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tree = treeRef.current;
    const growth = growthRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!tree || !growth || reducedMotion.matches) {
      return;
    }

    tree.classList.add("timeline-enhanced");
    const rows = Array.from(
      tree.querySelectorAll<HTMLElement>(".project-row"),
    );
    const rowObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            rowObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -16% 0px", threshold: 0.16 },
    );

    rows.forEach((row) => rowObserver.observe(row));

    let frame = 0;
    const updateGrowth = () => {
      const bounds = tree.getBoundingClientRect();
      const start = window.innerHeight * 0.75;
      const end = window.innerHeight * 0.25;
      const distance = bounds.height + start - end;
      const progress = Math.min(
        1,
        Math.max(0, (start - bounds.top) / Math.max(distance, 1)),
      );

      growth.style.clipPath = `inset(0 0 ${(1 - progress) * 100}% 0)`;
      frame = 0;
    };

    const requestGrowthUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateGrowth);
      }
    };

    updateGrowth();
    window.addEventListener("scroll", requestGrowthUpdate, { passive: true });
    window.addEventListener("resize", requestGrowthUpdate, { passive: true });

    return () => {
      window.cancelAnimationFrame(frame);
      rowObserver.disconnect();
      window.removeEventListener("scroll", requestGrowthUpdate);
      window.removeEventListener("resize", requestGrowthUpdate);
    };
  }, []);

  return (
    <section id="projects" className="paper-section">
      <div className="section-shell">
        <div className="section-intro">
          <p className="section-kicker">Selected work</p>
          <div>
            <h2 className="section-title">
              A growing record of things built and measured.
            </h2>
            <p className="section-copy">
              Each branch follows a project from constraint to evidence:
              embedded control, parallel compute, and computer vision.
            </p>
          </div>
        </div>

        <div ref={treeRef} className="project-tree">
          <div className="project-tree-trunk" aria-hidden="true">
            <TreeSvg />
            <div ref={growthRef} className="project-tree-growth">
              <TreeSvg progress />
            </div>
          </div>

          {projects.map((project, index) => (
            <div className="project-row" key={project.id}>
              <div className="project-branch" aria-hidden="true" />
              <div className="project-node" aria-hidden="true">
                <span>0{index + 1}</span>
              </div>

              <Link
                href={`/projects/${project.id}`}
                className="project-card"
                aria-label={`Read about ${project.title}`}
                onPointerEnter={cacheCardBounds}
                onPointerMove={handleCardPointerMove}
                onPointerLeave={resetCardTilt}
              >
                <div className="project-image">
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    fill
                    loading="lazy"
                    decoding="async"
                    unoptimized
                    sizes="(min-width: 901px) 42vw, 82vw"
                  />
                </div>

                <div className="project-card-body">
                  <div className="project-meta">
                    <span>{project.categories.join(" / ")}</span>
                    <span>{project.period}</span>
                  </div>

                  <h3>{project.title}</h3>
                  <p className="project-card-summary">{project.summary}</p>

                  <div className="project-metrics">
                    {project.metrics.slice(0, 2).map((metric) => (
                      <div
                        className="project-metric"
                        key={`${project.id}-${metric.label}`}
                      >
                        <strong>{metric.value}</strong>
                        <span>{metric.label}</span>
                      </div>
                    ))}
                  </div>

                  <span className="project-link">
                    View project <span aria-hidden="true">↗</span>
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
