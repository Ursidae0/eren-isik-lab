import portfolioData from "@/data/projects.json";

export const projectCategories = [
  "All",
  "Robotics",
  "CUDA",
  "Computer Vision",
] as const;

export type ProjectCategory = (typeof projectCategories)[number];
export type FilterableProjectCategory = Exclude<ProjectCategory, "All">;

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
  subtitle: string;
  period: string;
  categories: FilterableProjectCategory[];
  technologies: string[];
  repository: string;
  summary: string;
  metrics: ProjectMetric[];
  highlights: string[];
  technicalSpecs: TechnicalSpec[];
};

export type Experience = (typeof portfolioData.experience)[number];

export const projects = portfolioData.projects as Project[];
export const experience = portfolioData.experience;
export const technicalSkills = portfolioData.technicalSkills;
export const education = portfolioData.education;

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id);
}

