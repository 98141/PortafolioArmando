import type { ContentMap, Resource } from "@/src/lib/publicContent";
import ProjectCard from "./ProjectCard";
import CyberLabCard from "./CyberLabCard";
import CertificationCard from "./CertificationCard";
import EducationEntryCard from "./EducationEntryCard";
import BlogCard from "@/src/components/blog/BlogCard";

export default function PublicContentCards({ resource, items }: { resource: Resource; items: ContentMap[Resource][] }) {
  return <div className={resource === "education" ? "mt-8 grid gap-6" : "mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
    {items.map(item => {
      switch (resource) {
        case "projects": return <ProjectCard key={item._id} project={item as ContentMap["projects"]} />;
        case "cybersecurity": return <CyberLabCard key={item._id} lab={item as ContentMap["cybersecurity"]} />;
        case "certifications": return <CertificationCard key={item._id} certification={item as ContentMap["certifications"]} />;
        case "education": return <EducationEntryCard key={item._id} entry={item as ContentMap["education"]} />;
        case "blog": return <BlogCard key={item._id} post={item as ContentMap["blog"]} />;
      }
    })}
  </div>;
}
