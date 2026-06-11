import type { Metadata } from "next";

import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { ForestBackdrop } from "@/components/forest-backdrop";
import { Hero } from "@/components/hero";
import { LeafField } from "@/components/leaf-field";
import { Navigation } from "@/components/navigation";
import { ProfileSnapshot } from "@/components/profile-snapshot";
import { ProjectGallery } from "@/components/project-gallery";
import { projects } from "@/lib/projects";
import { siteConfig } from "@/lib/site";

export function generateMetadata(): Metadata {
  return {
    title: {
      absolute: siteConfig.title,
    },
    description: siteConfig.description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      url: siteConfig.url,
      siteName: siteConfig.shortName,
      title: siteConfig.title,
      description: siteConfig.description,
      locale: siteConfig.locale,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "Eren Isik Lab - CUDA, robotics, and embedded systems",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.title,
      description: siteConfig.description,
      images: ["/opengraph-image"],
    },
  };
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    url: siteConfig.url,
    sameAs: [siteConfig.github, siteConfig.linkedin],
    jobTitle: "Robotics and CUDA Kernel Engineer",
    knowsAbout: [
      "CUDA",
      "GPU kernel optimization",
      "Robotics",
      "Computer vision",
      "Embedded systems",
      "NVIDIA Jetson",
    ],
  };

  return (
    <div className="site-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ForestBackdrop />
      <LeafField />
      <Navigation />
      <main>
        <Hero />
        <ProjectGallery projects={projects} />
        <ProfileSnapshot />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
