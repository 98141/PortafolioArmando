import type { Project, ProjectFormValues } from "@/src/types/project";

export const parseCommaList = (value: string): string[] =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const parseLines = (value: string): string[] =>
  value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

export const joinCommaList = (items: string[] = []): string => items.join(", ");

export const joinLines = (items: string[] = []): string => items.join("\n");

export const formValuesToPayload = (values: ProjectFormValues) => {
  const payload: Record<string, unknown> = {
    title: values.title,
    subtitle: values.subtitle || undefined,
    shortDescription: values.shortDescription,
    longDescription: values.longDescription || undefined,
    category: values.category,
    status: values.status,
    technologies: parseCommaList(values.technologiesInput),
    features: parseLines(values.featuresInput),
    challenges: parseLines(values.challengesInput),
    learnings: parseLines(values.learningsInput),
    isFeatured: values.isFeatured,
    isActive: values.isActive,
    priority: values.priority,
    links: {
      demo: values.linksDemo || undefined,
      github: values.linksGithub || undefined,
      documentation: values.linksDocumentation || undefined,
      caseStudy: values.linksCaseStudy || undefined,
    },
  };

  if (values.imageUrl) {
    payload.image = {
      url: values.imageUrl,
      alt: values.imageAlt || values.title,
    };
  }

  if (values.startedAt) {
    payload.startedAt = new Date(values.startedAt).toISOString();
  }
  if (values.completedAt) {
    payload.completedAt = new Date(values.completedAt).toISOString();
  }

  return payload;
};

export const projectToFormValues = (project: Project): ProjectFormValues => ({
  title: project.title,
  subtitle: project.subtitle ?? "",
  shortDescription: project.shortDescription,
  longDescription: project.longDescription ?? "",
  category: project.category,
  status: project.status,
  technologiesInput: joinCommaList(project.technologies),
  featuresInput: joinLines(project.features),
  challengesInput: joinLines(project.challenges),
  learningsInput: joinLines(project.learnings),
  imageUrl: project.image?.url ?? "",
  imageAlt: project.image?.alt ?? "",
  linksDemo: project.links?.demo ?? "",
  linksGithub: project.links?.github ?? "",
  linksDocumentation: project.links?.documentation ?? "",
  linksCaseStudy: project.links?.caseStudy ?? "",
  isFeatured: project.isFeatured,
  isActive: project.isActive,
  priority: project.priority,
  startedAt: project.startedAt ? project.startedAt.slice(0, 10) : "",
  completedAt: project.completedAt ? project.completedAt.slice(0, 10) : "",
});

export const defaultProjectFormValues: ProjectFormValues = {
  title: "",
  subtitle: "",
  shortDescription: "",
  longDescription: "",
  category: "fullstack",
  status: "planned",
  technologiesInput: "",
  featuresInput: "",
  challengesInput: "",
  learningsInput: "",
  imageUrl: "",
  imageAlt: "",
  linksDemo: "",
  linksGithub: "",
  linksDocumentation: "",
  linksCaseStudy: "",
  isFeatured: false,
  isActive: true,
  priority: 100,
  startedAt: "",
  completedAt: "",
};
