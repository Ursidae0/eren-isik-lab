import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/footer";
import { ForestBackdrop } from "@/components/forest-backdrop";
import { LeafField } from "@/components/leaf-field";
import { Navigation } from "@/components/navigation";
import { ProjectDetail } from "@/components/project-detail";
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
      <ProjectDetail projectId={project.id} />
      <Footer />
    </div>
  );
}
