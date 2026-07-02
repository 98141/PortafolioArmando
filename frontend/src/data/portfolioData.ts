import type {
  Certification,
  CyberLab,
  EducationEntry,
  ExpertiseArea,
  LegacyBlogPost,
  Metric,
  NavLink,
  Project,
  SkillGroup,
  SocialLink,
} from "@/src/types/portfolio";

export const profile = {
  name: "Armando Mora",
  title: "Software Developer | Cybersecurity Specialist | Secure Systems Builder",
  tagline: "Construyendo software robusto con mentalidad de seguridad desde el diseño.",
  email: "contacto@armandomora.dev",
  location: "Centroamérica",
  cvUrl: "#cv-download",
  summary:
    "Profesional enfocado en el desarrollo de soluciones digitales seguras, combinando ingeniería de software, arquitectura web moderna y ciberseguridad aplicada. Experiencia práctica en proyectos MERN, e-commerce, AppSec, laboratorios de seguridad, análisis forense y buenas prácticas de desarrollo seguro.",
  valueProposition:
    "Uno de los pocos perfiles que integra desarrollo full stack y ciberseguridad aplicada para entregar productos listos para producción, auditables y mantenibles.",
};

export const mainLines = [
  "Desarrollo Full Stack",
  "Ciberseguridad Aplicada",
  "Seguridad en Aplicaciones Web",
  "Laboratorios Técnicos",
  "Documentación Profesional",
  "Automatización y Mejora Continua",
];

export const navLinks: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/projects" },
  { label: "Ciberseguridad", href: "/cybersecurity" },
  { label: "Certificaciones", href: "/certifications" },
  { label: "Educación", href: "/education" },
  { label: "Blog", href: "/blog" },
  { label: "Sobre mí", href: "/about" },
  { label: "Contacto", href: "/contact" },
];

export const socialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://linkedin.com/in/armandomora", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com/armandomora", icon: "github" },
  { label: "Email", href: "mailto:contacto@armandomora.dev", icon: "email" },
];

export const metrics: Metric[] = [
  {
    label: "Full Stack Projects",
    value: "12+",
    description: "Aplicaciones web y APIs en producción o mantenimiento",
  },
  {
    label: "Cybersecurity Labs",
    value: "18+",
    description: "Laboratorios documentados con enfoque defensivo",
  },
  {
    label: "Certifications",
    value: "8+",
    description: "Formación continua en desarrollo y seguridad",
  },
  {
    label: "Academic Background",
    value: "3",
    description: "Programas y especializaciones en curso o completadas",
  },
];

export const expertiseAreas: ExpertiseArea[] = [
  {
    id: "software",
    title: "Software Development",
    description:
      "Arquitectura MERN, APIs REST, dashboards administrativos y experiencias web premium con TypeScript y buenas prácticas de ingeniería.",
    icon: "code",
    highlights: ["Next.js & React", "Node.js / Express", "MongoDB", "CI/CD básico"],
  },
  {
    id: "cyber",
    title: "Cybersecurity",
    description:
      "Análisis de vulnerabilidades, hardening, laboratorios controlados y documentación de hallazgos con enfoque profesional y ético.",
    icon: "shield",
    highlights: ["Web AppSec", "Threat modeling", "Forensics intro", "Secure SDLC"],
  },
  {
    id: "appsec",
    title: "AppSec / DevSecOps",
    description:
      "Integración de seguridad en el ciclo de desarrollo: validación de entrada, auth segura, revisión de dependencias y configuración defensiva.",
    icon: "lock",
    highlights: ["JWT + cookies httpOnly", "OWASP Top 10", "Secrets management", "Security headers"],
  },
];

export const projects: Project[] = [
  {
    id: "portfolio-platform",
    title: "Portfolio Platform",
    description:
      "Plataforma profesional full stack con panel admin, autenticación segura y arquitectura modular MERN.",
    stack: ["Next.js", "TypeScript", "Express", "MongoDB", "TailwindCSS"],
    category: "fullstack",
    status: "in-progress",
    featured: true,
    demoUrl: "#",
    repoUrl: "#",
    year: "2026",
  },
  {
    id: "secure-ecommerce",
    title: "Secure E-Commerce",
    description:
      "Tienda en línea con carrito, pagos simulados y controles de seguridad en checkout y sesión.",
    stack: ["React", "Node.js", "Stripe API", "Redis", "JWT"],
    category: "ecommerce",
    status: "completed",
    featured: true,
    demoUrl: "#",
    repoUrl: "#",
    year: "2025",
  },
  {
    id: "inventory-api",
    title: "Inventory Management API",
    description:
      "API REST documentada con roles, validación Zod y rate limiting para gestión de inventario.",
    stack: ["Express", "MongoDB", "Zod", "Swagger"],
    category: "api",
    status: "maintained",
    demoUrl: "#",
    repoUrl: "#",
    year: "2025",
  },
  {
    id: "devops-dashboard",
    title: "DevOps Metrics Dashboard",
    description:
      "Dashboard de métricas de despliegue y salud de servicios con visualización en tiempo casi real.",
    stack: ["Next.js", "Chart.js", "WebSockets", "Docker"],
    category: "automation",
    status: "completed",
    demoUrl: "#",
    year: "2024",
  },
  {
    id: "auth-audit-tool",
    title: "Auth Flow Audit Tool",
    description:
      "Herramienta interna para revisar flujos de autenticación, cookies y políticas de sesión en apps web.",
    stack: ["TypeScript", "Playwright", "Node.js"],
    category: "security",
    status: "in-progress",
    featured: true,
    repoUrl: "#",
    year: "2026",
  },
  {
    id: "booking-system",
    title: "Booking System",
    description:
      "Sistema de reservas multi-tenant con calendario, notificaciones y panel administrativo.",
    stack: ["React", "Firebase", "TailwindCSS"],
    category: "fullstack",
    status: "completed",
    demoUrl: "#",
    year: "2024",
  },
];

export const projectCategories = [
  { id: "all", label: "Todos" },
  { id: "fullstack", label: "Full Stack" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "api", label: "APIs" },
  { id: "automation", label: "Automatización" },
  { id: "security", label: "Security" },
] as const;

export const cyberLabs: CyberLab[] = [
  {
    id: "jwt-session-lab",
    title: "Secure Session & JWT Lab",
    description:
      "Análisis comparativo de almacenamiento de tokens, rotación de refresh y mitigación de XSS/CSRF.",
    category: "web-appsec",
    focus: "Autenticación web",
    severity: "high",
    tools: ["Burp Suite", "OWASP ZAP", "Postman"],
    methodology: "Recon → Auth mapping → Token analysis → Remediation",
    outcome: "Implementación de cookies httpOnly y rotación de refresh documentada.",
    featured: true,
    year: "2026",
  },
  {
    id: "owasp-top10-review",
    title: "OWASP Top 10 Review",
    description:
      "Evaluación sistemática de una aplicación demo contra OWASP Top 10 con reporte ejecutivo.",
    category: "web-appsec",
    focus: "Vulnerabilidades web",
    severity: "critical",
    tools: ["Burp Suite", "nikto", "Manual testing"],
    methodology: "Scope definition → Testing → Risk rating → Fix validation",
    outcome: "Matriz de riesgos priorizada y plan de remediación por sprint.",
    featured: true,
    year: "2025",
  },
  {
    id: "forensics-intro",
    title: "Digital Forensics Intro Lab",
    description:
      "Cadena de custodia, adquisición de evidencia y análisis básico de artefactos en entorno controlado.",
    category: "forensics",
    focus: "Análisis forense",
    tools: ["Autopsy", "FTK Imager", "Volatility"],
    methodology: "Acquire → Preserve → Analyze → Report",
    outcome: "Informe forense con línea de tiempo de eventos reconstruida.",
    year: "2025",
  },
  {
    id: "network-segmentation",
    title: "Network Segmentation Lab",
    description:
      "Diseño de segmentación VLAN y reglas firewall para reducir superficie de ataque lateral.",
    category: "network",
    focus: "Defensa en profundidad",
    severity: "medium",
    tools: ["pfSense", "Wireshark", "Nmap"],
    methodology: "Architecture review → Rule design → Validation → Documentation",
    outcome: "Diagrama de zonas de confianza y políticas mínimas viables.",
    year: "2024",
  },
  {
    id: "cloud-misconfig",
    title: "Cloud Misconfiguration Audit",
    description:
      "Revisión de buckets, IAM y políticas públicas en entorno cloud de práctica.",
    category: "cloud-security",
    focus: "Cloud hardening",
    severity: "high",
    tools: ["AWS CLI", "ScoutSuite", "Prowler"],
    methodology: "Inventory → Misconfig scan → Risk assess → Harden",
    outcome: "Checklist de hardening alineado a CIS benchmarks básicos.",
    year: "2025",
  },
  {
    id: "secure-coding-review",
    title: "Secure Code Review Sprint",
    description:
      "Revisión estática y manual de módulos críticos: auth, uploads y validación de entrada.",
    category: "secure-coding",
    focus: "SDLC seguro",
    tools: ["Semgrep", "ESLint security plugins", "GitHub Actions"],
    methodology: "Threat model → SAST → Manual review → Fix tracking",
    outcome: "Backlog de seguridad integrado al flujo de desarrollo.",
    year: "2026",
  },
];

export const labCategories = [
  { id: "all", label: "Todos" },
  { id: "web-appsec", label: "Web AppSec" },
  { id: "forensics", label: "Forensics" },
  { id: "network", label: "Network" },
  { id: "cloud-security", label: "Cloud" },
  { id: "secure-coding", label: "Secure Coding" },
] as const;

export const certifications: Certification[] = [
  {
    id: "comptia-sec",
    title: "CompTIA Security+ (en preparación)",
    issuer: "CompTIA",
    date: "2026",
    category: "cybersecurity",
    status: "in-progress",
  },
  {
    id: "owasp-fundamentals",
    title: "OWASP Web Security Fundamentals",
    issuer: "OWASP",
    date: "2025",
    category: "cybersecurity",
    status: "completed",
    url: "#",
  },
  {
    id: "mongodb-dev",
    title: "MongoDB Developer",
    issuer: "MongoDB University",
    date: "2025",
    category: "development",
    status: "completed",
    credentialId: "MDB-DEV-XXXX",
  },
  {
    id: "nodejs-backend",
    title: "Node.js Backend Development",
    issuer: "Platzi / Coursera",
    date: "2024",
    category: "development",
    status: "completed",
  },
  {
    id: "azure-fundamentals",
    title: "Microsoft Azure Fundamentals (AZ-900)",
    issuer: "Microsoft",
    date: "2024",
    category: "cloud",
    status: "completed",
    url: "#",
  },
  {
    id: "ethical-hacking-intro",
    title: "Ethical Hacking Introduction",
    issuer: "TryHackMe",
    date: "2025",
    category: "cybersecurity",
    status: "completed",
  },
  {
    id: "react-advanced",
    title: "Advanced React Patterns",
    issuer: "Frontend Masters",
    date: "2024",
    category: "development",
    status: "completed",
  },
  {
    id: "cs-degree",
    title: "Ingeniería en Sistemas / Computación",
    issuer: "Universidad (en curso)",
    date: "2023 — Presente",
    category: "academic",
    status: "in-progress",
  },
];

export const education: EducationEntry[] = [
  {
    id: "systems-engineering",
    degree: "Ingeniería en Sistemas / Computación",
    institution: "Universidad Centroamericana",
    period: "2022 — Presente",
    focus: "Desarrollo de software, redes, seguridad informática y arquitectura de sistemas.",
    achievements: [
      "Proyectos integradores full stack",
      "Participación en competencias de ciberseguridad estudiantil",
      "Documentación técnica y presentaciones ejecutivas",
    ],
    status: "in-progress",
  },
  {
    id: "cyber-specialization",
    degree: "Especialización en Ciberseguridad Aplicada",
    institution: "Programa técnico profesional",
    period: "2024 — 2025",
    focus: "AppSec, análisis de vulnerabilidades, hardening y respuesta a incidentes básica.",
    achievements: [
      "18+ laboratorios documentados",
      "Metodología OWASP en proyectos web",
      "Informes de hallazgos con rating de riesgo",
    ],
    status: "completed",
  },
  {
    id: "english-tech",
    degree: "English for Tech Professionals",
    institution: "Instituto de idiomas",
    period: "2023",
    focus: "Comunicación técnica, documentación y presentaciones en inglés.",
    achievements: ["Certificación intermedia B2+", "Documentación bilingüe de proyectos"],
    status: "completed",
  },
];

export const skillGroups: SkillGroup[] = [
  {
    category: "Desarrollo Full Stack",
    skills: [
      { name: "TypeScript / JavaScript", level: "advanced" },
      { name: "React / Next.js", level: "advanced" },
      { name: "Node.js / Express", level: "advanced" },
      { name: "MongoDB / Mongoose", level: "advanced" },
      { name: "REST API Design", level: "advanced" },
    ],
  },
  {
    category: "Ciberseguridad",
    skills: [
      { name: "OWASP Top 10", level: "advanced" },
      { name: "Web AppSec Testing", level: "intermediate" },
      { name: "Threat Modeling", level: "intermediate" },
      { name: "Digital Forensics (intro)", level: "foundational" },
      { name: "Network Security Basics", level: "intermediate" },
    ],
  },
  {
    category: "DevSecOps & Herramientas",
    skills: [
      { name: "JWT / Session Security", level: "advanced" },
      { name: "Docker", level: "intermediate" },
      { name: "Git / GitHub Actions", level: "advanced" },
      { name: "Burp Suite / ZAP", level: "intermediate" },
      { name: "Semgrep / SAST basics", level: "foundational" },
    ],
  },
];

export const aboutStory = {
  intro:
    "Soy Armando Mora, ingeniero en formación con pasión por construir software que no solo funcione, sino que resista el escrutinio de seguridad y el tiempo.",
  software:
    "En desarrollo, me enfoco en arquitecturas claras, código mantenible y experiencias de usuario premium. Domino el stack MERN y Next.js con TypeScript, priorizando validación, testing razonable y documentación.",
  cyber:
    "En ciberseguridad, aplico un enfoque defensivo y profesional: laboratorios documentados, análisis de riesgo priorizado y remediación alineada al negocio — sin sensacionalismo.",
  closing:
    "Mi propuesta de valor es cerrar la brecha entre desarrollo y seguridad para que los equipos entreguen productos confiables desde el primer sprint.",
};

export const blogPosts: LegacyBlogPost[] = [
  {
    id: "secure-jwt-cookies",
    title: "JWT en cookies httpOnly: guía práctica para MERN",
    excerpt:
      "Patrones de autenticación segura con access/refresh tokens, rotación y mitigación de XSS en aplicaciones full stack modernas.",
    content:
      "## Contexto\n\nEn aplicaciones MERN, almacenar tokens en `localStorage` expone la sesión a XSS.\n\n## Recomendación\n\nUsar cookies **httpOnly**, **Secure** y **SameSite** con refresh rotation.\n\n```js\nres.cookie('accessToken', token, { httpOnly: true, secure: true });\n```\n\n## Conclusión\n\nLa seguridad de sesión empieza en el diseño, no en parches tardíos.",
    category: "appsec",
    tags: ["jwt", "mern", "auth"],
    date: "2026-03-01",
    readingTime: 8,
    featured: true,
  },
  {
    id: "owasp-top10-review",
    title: "OWASP Top 10 en revisión de código",
    excerpt:
      "Checklist accionable para code reviews orientados a AppSec sin frenar la entrega del equipo de desarrollo.",
    content:
      "## Enfoque\n\nPriorizar hallazgos por impacto y explotabilidad.\n\n- Validación de entrada\n- Control de acceso\n- Gestión de secretos\n\n## Cierre\n\nIntegrar seguridad en el SDLC reduce costo de remediación.",
    category: "cybersecurity",
    tags: ["owasp", "code-review"],
    date: "2026-02-15",
    readingTime: 6,
    featured: true,
  },
  {
    id: "nextjs-app-router-cms",
    title: "Arquitectura CMS con Next.js App Router",
    excerpt:
      "Cómo estructurar un knowledge hub técnico con API REST, React Query y panel admin modular.",
    content:
      "## Capas\n\n1. API Express + MongoDB\n2. Servicios tipados en frontend\n3. Admin CRUD con validación Zod\n\n## Resultado\n\nPlataforma mantenible tipo engineering blog enterprise.",
    category: "development",
    tags: ["nextjs", "cms", "architecture"],
    date: "2026-01-20",
    readingTime: 10,
  },
];

export const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
export const featuredLabs = cyberLabs.filter((l) => l.featured).slice(0, 3);
export const featuredCertifications = certifications.slice(0, 4);
export const featuredBlogPosts = blogPosts.filter((p) => p.featured).slice(0, 3);
