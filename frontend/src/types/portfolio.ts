export type ProjectCategory =
  | "fullstack"
  | "ecommerce"
  | "api"
  | "automation"
  | "security";

export type ProjectStatus = "completed" | "in-progress" | "maintained";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  stack: string[];
  category: ProjectCategory;
  status: ProjectStatus;
  featured?: boolean;
  demoUrl?: string;
  repoUrl?: string;
  year: string;
}

export type LabCategory =
  | "web-appsec"
  | "forensics"
  | "network"
  | "cloud-security"
  | "secure-coding";

export type LabSeverity = "low" | "medium" | "high" | "critical";

export interface CyberLab {
  id: string;
  title: string;
  description: string;
  category: LabCategory;
  focus: string;
  severity?: LabSeverity;
  tools: string[];
  methodology: string;
  outcome: string;
  featured?: boolean;
  year: string;
}

export type CertificationCategory =
  | "cybersecurity"
  | "cloud"
  | "development"
  | "academic";

export type CertificationStatus = "completed" | "in-progress" | "planned";

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  category: CertificationCategory;
  status: CertificationStatus;
  credentialId?: string;
  url?: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  period: string;
  focus: string;
  achievements: string[];
  status: "completed" | "in-progress";
}

export interface SkillGroup {
  category: string;
  skills: { name: string; level: "advanced" | "intermediate" | "foundational" }[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "linkedin" | "github" | "email";
}

export interface Metric {
  label: string;
  value: string;
  description: string;
}

export interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  icon: "code" | "shield" | "lock";
  highlights: string[];
}
