import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { ForestBackdrop } from "@/components/forest-backdrop";
import { LeafField } from "@/components/leaf-field";
import { Navigation } from "@/components/navigation";
import { getProjectById, projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: `${project.summary} Built with ${project.technologies
      .slice(0, 3)
      .join(", ")}.`,
    alternates: {
      canonical: `/projects/${project.id}`,
    },
    openGraph: {
      type: "article",
      url: `/projects/${project.id}`,
      siteName: siteConfig.shortName,
      title: `${project.title} | ${siteConfig.shortName}`,
      description: project.summary,
      images: [
        {
          url: `/projects/${project.id}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${project.title} technical project`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | ${siteConfig.shortName}`,
      description: project.summary,
      images: [`/projects/${project.id}/opengraph-image`],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="detail-shell">
      <ForestBackdrop />
      <LeafField />
      <Navigation />

      <main>
        <header className="detail-hero">
          <div className="detail-hero-inner">
            <Link href="/#projects" className="detail-back">
              ← Back to selected work
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
                View repository <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </header>

        <div className="paper-section">
          <article className="detail-content">
            <section className="detail-metrics" aria-label="Measured results">
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
                <h2>Engineering record</h2>
                <ul>
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </section>

              <section className="detail-section">
                <h2>Technical specifications</h2>
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
              <p className="section-kicker">Tools and technologies</p>
              <div className="skill-list">
                {project.technologies.map((technology) => (
                  <span key={technology}>{technology}</span>
                ))}
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
