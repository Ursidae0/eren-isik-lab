import portfolioData from "@/data/projects.json";
import { defaultLocale, type Locale } from "@/lib/content";

export type ProjectMetric = {
  value: string;
  label: string;
  context: string;
};

export type TechnicalSpec = {
  label: string;
  value: string;
};

export type Project = {
  id: string;
  title: string;
  period: string;
  categories: string[];
  technologies: string[];
  repository: string;
  summary: string;
  metrics: ProjectMetric[];
  highlights: string[];
  technicalSpecs: TechnicalSpec[];
};

type PortfolioData = (typeof portfolioData)["en"];
export type Experience = PortfolioData["experience"][number];
export type Education = PortfolioData["education"][number];
export type TechnicalSkills = PortfolioData["technicalSkills"];

export function getProjects(locale: Locale): Project[] {
  return portfolioData[locale].projects as Project[];
}

export function getProjectById(id: string, locale: Locale = defaultLocale) {
  return getProjects(locale).find((project) => project.id === id);
}

export function getExperience(locale: Locale): Experience[] {
  return portfolioData[locale].experience as Experience[];
}

export function getEducation(locale: Locale): Education[] {
  return portfolioData[locale].education as Education[];
}

export function getTechnicalSkills(locale: Locale): TechnicalSkills {
  return portfolioData[locale].technicalSkills as TechnicalSkills;
}

// English data for server-rendered / static surfaces: sitemap, OG images,
// generateStaticParams, and page metadata (the canonical language).
export const projects = getProjects(defaultLocale);
