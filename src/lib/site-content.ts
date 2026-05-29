export type StatusItem = {
  label: string;
  value: string;
};

export type SiteProfile = {
  avatarUrl: string;
  welcomeLabel: string;
  heroTitle: [string, string, string];
  heroAccent: string;
  heroText: string;
  heroSubtext: string;
  goals: StatusItem[];
  summary: string;
  status: string;
  statusSubtext: string;
};

export type Project = {
  id: number;
  title: string;
  year: number;
  brief: string;
  desc: string;
  role?: string;
  status?: string;
  techStack: string[];
  features: string[];
  challenges: string[];
  lessons?: string;
  screenshots: string[];
  github?: string;
};

export type Article = {
  id: number;
  title: string;
  description: string[];
  startDate: string;
  endDate?: string;
  images: string[];
};

export type GachaGame = {
  id: number;
  title: string;
  year: number;
  pityNumStd: number;
  pityMaxStd: number;
  pityNumLim: number;
  pityMaxLim: number;
  guaranteedLimited: boolean;
  pityNumWep: number;
  pityMaxWep: number;
  guaranteedWeapon: boolean;
  bannerUrl?: string;
};

export type HistoryEntry = {
  period: string;
  title: string;
  subtitle: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

const screenshotOne =
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80";
const screenshotTwo =
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";
const screenshotThree =
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80";

export const siteProfile: SiteProfile = {
  avatarUrl:
    "https://thawxejtbmdrolimrprz.supabase.co/storage/v1/object/public/media/site/avatar.png",
  welcomeLabel: "// STATUS: ACTIVE / AVAILABLE",
  heroTitle: ["Software", "Engineering", "Graduate"],
  heroAccent: "Graduate",
  heroText: "Backend focused. Linux enthusiast.",
  heroSubtext: "Arch + Hyprland daily driver.",
  goals: [
    {
      label: "Goals",
      value: "Self Improvement, Getting an Internship",
    },
    {
      label: "Learning",
      value: "Backend systems, code quality, and AWS tooling.",
    },
    {
      label: "Volunteer Work",
      value: "Backend development, Next.js + AWS project",
    },
  ],
  summary:
    "Motivated Software Engineering Graduate focused on backend systems, Python, SQL, AWS, and Linux workflows.",
  status: "Seeking backend roles",
  statusSubtext: "Open to internships and junior engineering positions.",
};

export const projects: Project[] = [
  {
    id: 1,
    title: "IGComplex Portfolio",
    year: 2026,
    brief:
      "A personal portfolio and small internal tools app built with Next.js and Supabase.",
    desc:
      "A portfolio site focused on readable code, a compact content model, and a lightweight internal workspace.",
    role: "Solo",
    status: "Ongoing",
    techStack: ["Next.js 16", "React 19", "TypeScript", "Supabase", "Docker"],
    features: [
      "Uses the App Router and server-first pages for the public site.",
      "Keeps auth, storage, and small internal tools behind a focused protected surface.",
      "Prioritizes understandable code and a reduced backend surface area.",
    ],
    challenges: [
      "Reducing unnecessary complexity after earlier experimentation.",
      "Keeping content updates simple without turning the site into a full CMS.",
    ],
    lessons:
      "Small apps improve when the data model and editing flow stay easy to follow.",
    screenshots: [screenshotOne, screenshotTwo, screenshotThree],
    github: "https://github.com/",
  },
  {
    id: 2,
    title: "Backend Systems Practice",
    year: 2025,
    brief:
      "A backend-heavy project archive focused on APIs, relational data, and maintainability.",
    desc:
      "This work focuses on practical service design, database-backed features, and keeping the architecture small enough to maintain confidently.",
    role: "Backend",
    status: "Completed",
    techStack: ["Python", "Django", "PostgreSQL", "Redis", "AWS"],
    features: [
      "Modeled service boundaries around real maintenance cost.",
      "Documented local Docker workflows and deployment expectations.",
    ],
    challenges: [
      "Balancing straightforward implementation with enough structure for future extension.",
    ],
    lessons:
      "Operational clarity matters. The app you can understand and recover quickly is usually the right one.",
    screenshots: [screenshotTwo, screenshotThree],
    github: "https://github.com/",
  },
];

export const articles: Article[] = [
  {
    id: 1,
    title: "Why this portfolio is being simplified",
    startDate: "2026-05-20",
    endDate: "2026-05-24",
    description: [
      "A small portfolio site becomes harder to maintain when it keeps structure that no longer helps the product.",
      "The current reset focuses on clearer content, a smaller protected tool surface, and simpler public pages.",
    ],
    images: [screenshotOne, screenshotThree],
  },
  {
    id: 2,
    title: "Current learning track",
    startDate: "2026-05-10",
    description: [
      "Recent work is centered on backend quality, Supabase integration, AWS tooling, and incremental delivery.",
      "The frontend stays intentionally restrained while the main effort goes into reliability and structure.",
    ],
    images: [],
  },
];

export const academicHistory: HistoryEntry[] = [
  {
    period: "2021 - 2025",
    title: "SLIIT / University of Bedfordshire",
    subtitle: "BSc (Hons) in Software Engineering",
  },
  {
    period: "2004 - 2017",
    title: "Ananda College",
    subtitle: "Secondary education",
  },
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Languages",
    items: ["Python / Django", "NodeJS / NextJS", "C# / .NET MAUI"],
  },
  {
    title: "Infrastructure",
    items: ["PostgreSQL / MongoDB", "Docker / Terraform", "AWS / Supabase"],
  },
];

export function getCvDownloadUrl() {
  return process.env.NEXT_PUBLIC_CV_URL;
}
