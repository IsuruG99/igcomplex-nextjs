import "server-only";

// This is the single source of public content for the site.
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { appEnv, hasSupabasePublicEnv, hasSupabaseServiceRoleEnv } from "./env";
import { resolveStorageAsset } from "./storage";
import { createSupabaseAdminClient } from "./supabase/admin";
import {
  academicHistory,
  type Article,
  type GachaGame,
  getCvDownloadUrl,
  type Project,
  siteProfile,
  skillGroups,
} from "./site-content";

function createSupabaseContentClient() {
  if (hasSupabaseServiceRoleEnv()) {
    return createSupabaseAdminClient();
  }

  if (!hasSupabasePublicEnv()) {
    return null;
  }

  return createClient(appEnv.nextPublicSupabaseUrl, appEnv.nextPublicSupabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type ProjectRow = {
  challenges: string[] | null;
  description: string | null;
  github_url: string | null;
  id: number;
  brief: string | null;
  image_paths: string[] | null;
  lessons: string | null;
  role: string | null;
  status: string | null;
  tech_stack: string[] | null;
  title: string;
  year: number;
  features: string[] | null;
};

type ArticleRow = {
  description: string[] | null;
  end_date: string | null;
  id: number;
  image_paths: string[] | null;
  start_date: string;
  title: string;
};

type GachaRow = {
  banner_path: string | null;
  guaranteed_lim: boolean;
  guaranteed_wep: boolean;
  id: number;
  pity_lim_max: number;
  pity_lim_num: number;
  pity_std_max: number;
  pity_std_num: number;
  pity_wep_max: number;
  pity_wep_num: number;
  title: string;
  year: number;
};

function mapProjectRow(row: ProjectRow): Project {
  const bucket = appEnv.storageBuckets.media;

  const screenshots = (row.image_paths ?? [])
    .map((path) => resolveStorageAsset(bucket, path))
    .filter((url): url is string => Boolean(url));

  return {
    id: row.id,
    title: row.title,
    year: row.year,
    brief: row.brief ?? "",
    desc: row.description ?? "",
    role: row.role ?? undefined,
    status: row.status ?? undefined,
    techStack: row.tech_stack ?? [],
    features: row.features ?? [],
    challenges: row.challenges ?? [],
    lessons: row.lessons ?? undefined,
    screenshots,
    github: row.github_url ?? undefined,
  };
}

function mapArticleRow(row: ArticleRow): Article {
  const bucket = appEnv.storageBuckets.media;

  const images = (row.image_paths ?? [])
    .map((path) => resolveStorageAsset(bucket, path))
    .filter((url): url is string => Boolean(url));

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? [],
    startDate: row.start_date,
    endDate: row.end_date ?? undefined,
    images,
  };
}

function mapGachaRow(row: GachaRow): GachaGame {
  const bucket = appEnv.storageBuckets.media;

  return {
    id: row.id,
    title: row.title,
    year: row.year,
    pityNumStd: row.pity_std_num,
    pityMaxStd: row.pity_std_max,
    pityNumLim: row.pity_lim_num,
    pityMaxLim: row.pity_lim_max,
    guaranteedLimited: row.guaranteed_lim,
    pityNumWep: row.pity_wep_num,
    pityMaxWep: row.pity_wep_max,
    guaranteedWeapon: row.guaranteed_wep,
    bannerUrl: resolveStorageAsset(bucket, row.banner_path),
  };
}

async function loadProjectsFromDatabase() {
  if (!hasSupabasePublicEnv() && !hasSupabaseServiceRoleEnv()) {
    return [] as Project[];
  }

  try {
    const supabase = createSupabaseContentClient();
    if (!supabase) {
      return [] as Project[];
    }

    const { data, error } = await supabase
      .from("projects")
      .select(
        "id, brief, description, tech_stack, features, challenges, image_paths, github_url, lessons, role, status, title, year",
      )
      .order("year", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data as ProjectRow[] | null) ?? [];
    return rows.map(mapProjectRow);
  } catch (error) {
    console.error("Failed to read projects from Supabase.", error);
    return [] as Project[];
  }
}

async function loadArticlesFromDatabase() {
  if (!hasSupabasePublicEnv() && !hasSupabaseServiceRoleEnv()) {
    return [] as Article[];
  }

  try {
    const supabase = createSupabaseContentClient();
    if (!supabase) {
      return [] as Article[];
    }

    const { data, error } = await supabase
      .from("articles")
      .select("id, description, end_date, image_paths, start_date, title")
      .order("start_date", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = (data as ArticleRow[] | null) ?? [];
    return rows.map(mapArticleRow);
  } catch (error) {
    console.error("Failed to read articles from Supabase.", error);
    return [] as Article[];
  }
}

async function loadGachaFromDatabase() {
  if (!hasSupabasePublicEnv() && !hasSupabaseServiceRoleEnv()) {
    return [] as GachaGame[];
  }

  try {
    const supabase = createSupabaseContentClient();
    if (!supabase) {
      return [] as GachaGame[];
    }

    const { data, error } = await supabase
      .from("tracker_games")
      .select(
        "banner_path, guaranteed_lim, guaranteed_wep, id, pity_lim_max, pity_lim_num, pity_std_max, pity_std_num, pity_wep_max, pity_wep_num, title, year",
      )
      .order("title", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data as GachaRow[] | null) ?? [];
    return rows.map(mapGachaRow);
  } catch (error) {
    console.error("Failed to read tracker games from Supabase.", error);
    return [] as GachaGame[];
  }
}

const getProjectsCached = unstable_cache(loadProjectsFromDatabase, ["content:projects"], {
  revalidate: 300,
  tags: ["projects"],
});

const getArticlesCached = unstable_cache(loadArticlesFromDatabase, ["content:articles"], {
  revalidate: 300,
  tags: ["articles"],
});

const getGachaGamesCached = unstable_cache(loadGachaFromDatabase, ["content:gacha"], {
  revalidate: 300,
  tags: ["gacha"],
});

export async function getProjects() {
  return getProjectsCached();
}

export async function getProjectById(projectId: number) {
  const projects = await getProjects();
  return projects.find((project) => project.id === projectId);
}

export async function getArticles() {
  return getArticlesCached();
}

export async function getGachaGames() {
  return getGachaGamesCached();
}

export function getSiteProfile() {
  return siteProfile;
}

export function getAcademicHistory() {
  return academicHistory;
}

export function getSkillGroups() {
  return skillGroups;
}

export function getCvUrl() {
  const envCvUrl = getCvDownloadUrl();

  if (envCvUrl) {
    return envCvUrl;
  }

  return resolveStorageAsset(appEnv.storageBuckets.media, "site/cv.pdf");
}