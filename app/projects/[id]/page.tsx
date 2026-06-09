import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { ForestBackdrop } from "@/components/forest-backdrop";
import { Navigation } from "@/components/navigation";
import { RainCanvas } from "@/components/rain-canvas";
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
    <div className="site-shell relative isolate min-h-screen overflow-hidden">
      <ForestBackdrop />
      <RainCanvas />
      <Navigation />

      <main className="relative z-20 px-6 pb-24 pt-32 sm:px-10 lg:px-12 lg:pt-40">
        <article className="mx-auto max-w-7xl">
          <Link
            href="/#projects"
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist-600 transition-colors hover:text-terminal"
          >
            &lt;- Project index
          </Link>

          <header className="mt-10 grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                {project.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-terminal/20 bg-terminal/[0.05] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-terminal"
                  >
                    {category}
                  </span>
                ))}
              </div>
              <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.14em] text-mist-600">
                {project.period}
              </p>
              <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-mist-100 sm:text-7xl">
                {project.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-mist-300">
                {project.summary}
              </p>
            </div>

            <a
              href={project.repository}
              target="_blank"
              rel="noreferrer"
              className="terminal-button w-fit"
            >
              Open repository
              <span aria-hidden="true">-&gt;</span>
            </a>
          </header>

          <section
            aria-label="Measured results"
            className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {project.metrics.map((metric) => (
              <div key={metric.label} className="glass-card p-5">
                <p className="font-mono text-2xl font-semibold text-terminal">
                  {metric.value}
                </p>
                <h2 className="mt-2 text-sm font-semibold text-mist-100">
                  {metric.label}
                </h2>
                <p className="mt-2 text-xs leading-5 text-mist-600">
                  {metric.context}
                </p>
              </div>
            ))}
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="glass-card p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal">
                Engineering record
              </p>
              <ul className="mt-6 space-y-5">
                {project.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex gap-4 text-sm leading-7 text-mist-300"
                  >
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-terminal shadow-terminal" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </section>

            <section className="glass-card p-6 sm:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal">
                Technical specifications
              </p>
              <dl className="mt-6 divide-y divide-white/[0.07]">
                {project.technicalSpecs.map((spec) => (
                  <div
                    key={spec.label}
                    className="grid gap-2 py-4 sm:grid-cols-[8rem_1fr]"
                  >
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-mist-600">
                      {spec.label}
                    </dt>
                    <dd className="text-sm leading-6 text-mist-300">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <section className="mt-5 glass-card p-6 sm:p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal">
              Stack
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-mist-300"
                >
                  {technology}
                </span>
              ))}
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
