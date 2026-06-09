import { Footer } from "@/components/footer";
import { ForestBackdrop } from "@/components/forest-backdrop";
import { Hero } from "@/components/hero";
import { MissionControl } from "@/components/mission-control";
import { Navigation } from "@/components/navigation";
import { ProfileSnapshot } from "@/components/profile-snapshot";
import { ProjectGallery } from "@/components/project-gallery";
import { RainCanvas } from "@/components/rain-canvas";
import { ResumeSection } from "@/components/resume-section";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <div id="top" className="site-shell relative isolate min-h-screen overflow-hidden">
      <ForestBackdrop />
      <RainCanvas />
      <Navigation />
      <main>
        <Hero />
        <ProjectGallery projects={projects} />
        <ProfileSnapshot />
        <ResumeSection />
        <MissionControl />
      </main>
      <Footer />
    </div>
  );
}
