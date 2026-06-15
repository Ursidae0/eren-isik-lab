"use client";

import Link from "next/link";

import { useLanguage } from "@/components/preferences-provider";
import type { Project } from "@/lib/projects";

export function ProjectDetail({ project }: { project: Project }) {
  const { content } = useLanguage();
  const labels = content.projectDetail;

  return (
    <main>
      <header className="detail-hero">
        <div className="detail-hero-inner">
          <Link href="/#projects" className="detail-back">
            <span aria-hidden="true">←</span> {labels.backLabel}
          </Link>

          <div className="detail-heading">
            <p className="detail-period">
              {project.categories.join(" / ")} · {project.period}
            </p>
            <h1>{project.title}</h1>
            <p className="detail-summary">{project.summary}</p>
            <a
              href={project.repository}
              target="_blank"
              rel="noreferrer"
              className="button-primary detail-repository"
            >
              {labels.viewRepositoryLabel} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </header>

      <div className="paper-section">
        <article className="detail-content">
          <section
            className="detail-metrics"
            aria-label={labels.measuredResultsLabel}
          >
            {project.metrics.map((metric) => (
              <div className="detail-metric" key={metric.label}>
                <strong>{metric.value}</strong>
                <h2>{metric.label}</h2>
                <p>{metric.context}</p>
              </div>
            ))}
          </section>

          <div className="detail-grid">
            <section className="detail-section">
              <h2>{labels.engineeringRecordLabel}</h2>
              <ul>
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>

            <section className="detail-section">
              <h2>{labels.technicalSpecsLabel}</h2>
              <dl className="spec-list">
                {project.technicalSpecs.map((spec) => (
                  <div className="spec-row" key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <section className="detail-stack">
            <p className="section-kicker">{labels.toolsLabel}</p>
            <div className="skill-list">
              {project.technologies.map((technology) => (
                <span key={technology}>{technology}</span>
              ))}
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
