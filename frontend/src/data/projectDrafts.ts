import { defaultProjectFormValues } from "@/src/lib/projectForm";
import type { ProjectFormValues } from "@/src/types/project";

// Initial copy supplied by the owner. No inferred revenue, customers or performance claims.
export const tejiendoRaicesDraft: ProjectFormValues = {
  ...defaultProjectFormValues,
  title: "Tejiendo Raíces",
  subtitle: "Tienda online para un emprendimiento",
  shortDescription: "Tienda e-commerce construida desde cero con MERN e integración de la pasarela de pagos Wompi para el emprendimiento Tejiendo Raíces.",
  category: "ecommerce",
  status: "completed",
  isActive: false,
  isFeatured: true,
  technologiesInput: "MongoDB, Express, React, Node.js, Wompi",
  featuresInput: "Tienda e-commerce\nIntegración de pagos con Wompi",
  linksDemo: "https://tejiendoraices.com.co/",
  caseStudy: {
    role: "Construcción de la tienda e-commerce desde cero.",
    problem: "El emprendimiento Tejiendo Raíces necesitaba una tienda online.",
    solution: "Desarrollo de una tienda con MERN e integración de Wompi como pasarela de pagos.",
    architecture: "Aplicación basada en MongoDB, Express, React y Node.js, con integración de pagos mediante Wompi.",
    results: "La tienda está desplegada en tejiendoraices.com.co.",
  },
  gallery: [],
};
