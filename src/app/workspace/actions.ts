"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  initialWorkspaceActionState,
  type WorkspaceActionState,
  type WorkspaceFieldErrors,
} from "./action-types";
import { requireWorkspaceUser } from "../../lib/auth";
import { appEnv } from "../../lib/env";
import type { Article, GachaGame, Project } from "../../lib/site-content";
import {
  cleanupStoragePaths,
  finalizePreparedAssets,
  type PreparedAssetMutation,
  prepareAssetMutation,
  rollbackPreparedAssets,
  uploadStorageFile,
} from "../../lib/storage-admin";
import { appendExtension, resolveStorageAsset } from "../../lib/storage";
import { createSupabaseAdminClient } from "../../lib/supabase/admin";

type SupabaseAdminClient = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;
type ProjectPayload = {
  brief: string;
  challenges: string[];
  currentImagePaths: string[];
  description: string | null;
  features: string[];
  files: [File | null, File | null, File | null];
  githubUrl: string | null;
  imageUploadPaths: [string, string, string];
  lessons: string | null;
  removeImages: [boolean, boolean, boolean];
  role: string | null;
  status: string | null;
  techStack: string[];
  title: string;
  year: number;
};

type ArticlePayload = {
  currentImagePaths: string[];
  description: string[];
  endDate: string | null;
  files: [File | null, File | null, File | null];
  imageUploadPaths: [string, string, string];
  removeImages: [boolean, boolean, boolean];
  startDate: string;
  title: string;
};

type TrackerPayload = {
  bannerFile: File | null;
  bannerUploadPath: string;
  currentBannerPath: string | null;
  guaranteedLim: boolean;
  guaranteedWep: boolean;
  pityLimMax: number;
  pityLimNum: number;
  pityStdMax: number;
  pityStdNum: number;
  pityWepMax: number;
  pityWepNum: number;
  removeBanner: boolean;
  title: string;
  year: number;
};

function toNullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

function toStringValue(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function toNumberValue(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? "").trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toBooleanValue(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function toStringList(value: FormDataEntryValue | null, mode: "csv" | "lines") {
  const text = toStringValue(value);

  if (!text) {
    return [] as string[];
  }

  const items = mode === "csv" ? text.split(",") : text.split(/\r?\n+/);
  return items.map((item) => item.replace(/^[-*•]\s*/, "").trim()).filter(Boolean);
}

function compactAssetValues(values: Array<string | null | undefined>) {
  return values.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function getOptionalFile(value: FormDataEntryValue | null) {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function buildProjectPayload(
  formData: FormData,
  currentAssets?: { screenshot1?: string | null; screenshot2?: string | null; screenshot3?: string | null },
): ProjectPayload {
  const title = toStringValue(formData.get("title"));
  const year = toNumberValue(formData.get("year"));
  const brief = toStringValue(formData.get("brief"));
  const slug = slugify(title || `project-${Date.now()}`);
  const timestamp = Date.now();
  const imageUploadPaths: [string, string, string] = [
    `projects/${slug}-${timestamp}-1`,
    `projects/${slug}-${timestamp}-2`,
    `projects/${slug}-${timestamp}-3`,
  ];

  return {
    brief,
    challenges: toStringList(formData.get("challenges"), "lines"),
    currentImagePaths: compactAssetValues([
      currentAssets?.screenshot1,
      currentAssets?.screenshot2,
      currentAssets?.screenshot3,
    ]),
    description: toNullableString(formData.get("desc")),
    features: toStringList(formData.get("features"), "lines"),
    files: [
      getOptionalFile(formData.get("screenshot1")),
      getOptionalFile(formData.get("screenshot2")),
      getOptionalFile(formData.get("screenshot3")),
    ],
    githubUrl: toNullableString(formData.get("github")),
    imageUploadPaths,
    lessons: toNullableString(formData.get("lessons")),
    removeImages: [
      toBooleanValue(formData.get("removeScreenshot1")),
      toBooleanValue(formData.get("removeScreenshot2")),
      toBooleanValue(formData.get("removeScreenshot3")),
    ],
    role: toNullableString(formData.get("role")),
    status: toNullableString(formData.get("status")),
    techStack: toStringList(formData.get("techStack"), "csv"),
    title,
    year,
  };
}

function buildArticlePayload(
  formData: FormData,
  currentAssets?: { image1?: string | null; image2?: string | null; image3?: string | null },
): ArticlePayload {
  const title = toStringValue(formData.get("title"));
  const slug = slugify(title || `article-${Date.now()}`);
  const timestamp = Date.now();
  const imageUploadPaths: [string, string, string] = [
    `articles/${slug}-${timestamp}-1`,
    `articles/${slug}-${timestamp}-2`,
    `articles/${slug}-${timestamp}-3`,
  ];

  return {
    currentImagePaths: compactAssetValues([currentAssets?.image1, currentAssets?.image2, currentAssets?.image3]),
    description: toStringList(formData.get("description"), "lines"),
    endDate: toNullableString(formData.get("endDate")),
    files: [
      getOptionalFile(formData.get("image1")),
      getOptionalFile(formData.get("image2")),
      getOptionalFile(formData.get("image3")),
    ],
    imageUploadPaths,
    removeImages: [
      toBooleanValue(formData.get("removeImage1")),
      toBooleanValue(formData.get("removeImage2")),
      toBooleanValue(formData.get("removeImage3")),
    ],
    startDate: toStringValue(formData.get("startDate")),
    title,
  };
}

function buildGachaPayload(formData: FormData, currentAssets?: { banner?: string | null }): TrackerPayload {
  const title = toStringValue(formData.get("title"));
  const slug = slugify(title || `tracker-${Date.now()}`);
  const timestamp = Date.now();

  return {
    bannerFile: getOptionalFile(formData.get("banner")),
    bannerUploadPath: `tracker/${slug}-${timestamp}`,
    currentBannerPath: toNullableString(currentAssets?.banner ?? null),
    guaranteedLim: toBooleanValue(formData.get("guaranteedLimited")),
    guaranteedWep: toBooleanValue(formData.get("guaranteedWeapon")),
    pityLimMax: toNumberValue(formData.get("pityMaxLim")),
    pityLimNum: toNumberValue(formData.get("pityNumLim")),
    pityStdMax: toNumberValue(formData.get("pityMaxStd")),
    pityStdNum: toNumberValue(formData.get("pityNumStd")),
    pityWepMax: toNumberValue(formData.get("pityMaxWep")),
    pityWepNum: toNumberValue(formData.get("pityNumWep")),
    removeBanner: toBooleanValue(formData.get("removeBanner")),
    title,
    year: toNumberValue(formData.get("year")),
  };
}

async function ensureAdminAccess(nextPath: string): Promise<SupabaseAdminClient> {
  await requireWorkspaceUser(nextPath);

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase service role env is not configured.");
  }

  return supabase;
}

function buildProjectItem(
  projectId: number,
  payload: ProjectPayload,
  imagePaths: Array<string | null | undefined>,
): Project {
  const bucket = appEnv.storageBuckets.media;
  const screenshots = imagePaths
    .map((p) => resolveStorageAsset(bucket, p))
    .filter((url): url is string => Boolean(url));

  return {
    id: projectId,
    title: payload.title,
    year: payload.year,
    brief: payload.brief,
    desc: payload.description ?? "",
    role: payload.role ?? undefined,
    status: payload.status ?? undefined,
    techStack: payload.techStack,
    features: payload.features,
    challenges: payload.challenges,
    lessons: payload.lessons ?? undefined,
    screenshots: screenshots.length > 0 ? screenshots : [],
    github: payload.githubUrl ?? undefined,
  };
}

function buildArticleItem(
  articleId: number,
  payload: ArticlePayload,
  imagePaths: Array<string | null | undefined>,
): Article {
  const bucket = appEnv.storageBuckets.media;
  const images = imagePaths
    .map((p) => resolveStorageAsset(bucket, p))
    .filter((url): url is string => Boolean(url));

  return {
    id: articleId,
    title: payload.title,
    description: payload.description,
    startDate: payload.startDate,
    endDate: payload.endDate ?? undefined,
    images,
  };
}

function buildGachaItem(
  gameId: number,
  payload: TrackerPayload,
  bannerPath: string | null,
): GachaGame {
  const bucket = appEnv.storageBuckets.media;

  return {
    id: gameId,
    title: payload.title,
    year: payload.year,
    pityNumStd: payload.pityStdNum,
    pityMaxStd: payload.pityStdMax,
    pityNumLim: payload.pityLimNum,
    pityMaxLim: payload.pityLimMax,
    guaranteedLimited: payload.guaranteedLim,
    pityNumWep: payload.pityWepNum,
    pityMaxWep: payload.pityWepMax,
    guaranteedWeapon: payload.guaranteedWep,
    bannerUrl: resolveStorageAsset(bucket, bannerPath),
  };
}

/**
 * Asset preparation helpers
 *
 * Current pattern (as of Phase 3/4 review):
 * - We prepare (upload or mark for deletion) assets *before* the database write.
 * - On successful DB write we call finalizePreparedAssets (cleanup old files).
 * - On any error we call rollbackPreparedAssets (remove newly uploaded files).
 *
 * This is a two-phase commit style approach inherited from earlier complexity.
 * See Phase 4 work for potential simplification to a simpler "upload on success,
 * best-effort cleanup on failure" model suitable for a personal portfolio.
 */
async function prepareArticleImageAssets(payload: ArticlePayload, preparedAssets: PreparedAssetMutation[]) {
  const imagePaths: string[] = [];

  for (const [index, file] of payload.files.entries()) {
    const mutation = await prepareAssetMutation({
      bucket: appEnv.storageBuckets.media,
      currentValue: payload.currentImagePaths[index] ?? null,
      newFile: file,
      removeCurrent: payload.removeImages[index],
      targetPath: payload.imageUploadPaths[index],
    });

    preparedAssets.push(mutation);

    if (mutation.nextValue) {
      imagePaths.push(mutation.nextValue);
    }
  }

  return imagePaths;
}

async function prepareTrackerBannerAsset(payload: TrackerPayload, preparedAssets: PreparedAssetMutation[]) {
  const mutation = await prepareAssetMutation({
    bucket: appEnv.storageBuckets.media,
    currentValue: payload.currentBannerPath,
    newFile: payload.bannerFile,
    removeCurrent: payload.removeBanner,
    targetPath: payload.bannerUploadPath,
  });

  preparedAssets.push(mutation);
  return mutation.nextValue;
}

function successState(
  message: string,
  mutation: WorkspaceActionState["mutation"] = null,
): WorkspaceActionState {
  return {
    ...initialWorkspaceActionState,
    message,
    mutation,
    refreshToken: crypto.randomUUID(),
    status: "success",
  };
}

function errorState(message: string, fieldErrors: WorkspaceFieldErrors = {}): WorkspaceActionState {
  return {
    ...initialWorkspaceActionState,
    fieldErrors,
    message,
    status: Object.keys(fieldErrors).length > 0 ? "validation" : "error",
  };
}

function isValidUrl(value: string | null) {
  if (!value) {
    return true;
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function validateProjectPayload(payload: ProjectPayload) {
  const fieldErrors: WorkspaceFieldErrors = {};

  if (!payload.title) {
    fieldErrors.title = "Title is required.";
  }
  if (payload.year < 1970 || payload.year > 2100) {
    fieldErrors.year = "Enter a valid year.";
  }
  if (!payload.brief) {
    fieldErrors.brief = "Brief is required.";
  }
  if (payload.techStack.length === 0) {
    fieldErrors.techStack = "Tech stack is required.";
  }
  if (!isValidUrl(payload.githubUrl)) {
    fieldErrors.github = "Enter a valid Github URL.";
  }

  return fieldErrors;
}

function validateArticlePayload(payload: ArticlePayload) {
  const fieldErrors: WorkspaceFieldErrors = {};

  if (!payload.title) {
    fieldErrors.title = "Title is required.";
  }
  if (!payload.startDate) {
    fieldErrors.startDate = "Start date is required.";
  }
  if (payload.endDate && payload.startDate && payload.endDate < payload.startDate) {
    fieldErrors.endDate = "End date cannot be earlier than start date.";
  }

  return fieldErrors;
}

function validateGachaPayload(payload: TrackerPayload) {
  const fieldErrors: WorkspaceFieldErrors = {};

  if (!payload.title) {
    fieldErrors.title = "Title is required.";
  }
  if (payload.year < 2000 || payload.year > 2100) {
    fieldErrors.year = "Enter a valid release year.";
  }

  const pairs: Array<[string, number, number]> = [
    ["pityNumStd", payload.pityStdNum, payload.pityStdMax],
    ["pityNumLim", payload.pityLimNum, payload.pityLimMax],
    ["pityNumWep", payload.pityWepNum, payload.pityWepMax],
  ];

  for (const [field, value, max] of pairs) {
    if (value < 0 || max < 0) {
      fieldErrors[field] = "Pity values must be zero or greater.";
    } else if (value > max) {
      fieldErrors[field] = "Soft pity cannot exceed hard pity.";
    }
  }

  return fieldErrors;
}

function revalidateProjectPaths(projectId?: number) {
  revalidateTag("projects", "max");
  revalidatePath("/projects");
  revalidatePath("/workspace");
  revalidatePath("/workspace/projects");

  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

function revalidateArticlePaths() {
  revalidateTag("articles", "max");
  revalidatePath("/blog");
  revalidatePath("/workspace");
  revalidatePath("/workspace/blog");
}

function revalidateGachaPaths() {
  revalidateTag("gacha", "max");
  revalidatePath("/hub");
  revalidatePath("/tracker");
  revalidatePath("/workspace");
  revalidatePath("/workspace/tracker");
}

export async function createProjectAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const payload = buildProjectPayload(formData);
  const fieldErrors = validateProjectPayload(payload);

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Fix the highlighted project fields.", fieldErrors);
  }

  const supabase = await ensureAdminAccess("/workspace/projects");
  const bucket = appEnv.storageBuckets.media;
  const uploadedPaths: string[] = [];

  try {
    // Simpler direct upload pattern (Phase 4 prototype for projects)
    for (const [index, file] of payload.files.entries()) {
      if (file) {
        const targetPath = appendExtension(payload.imageUploadPaths[index], file);
        await uploadStorageFile(bucket, targetPath, file, { upsert: false });
        uploadedPaths.push(targetPath);
      }
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({
        brief: payload.brief,
        challenges: payload.challenges,
        description: payload.description,
        features: payload.features,
        github_url: payload.githubUrl,
        image_paths: uploadedPaths,
        lessons: payload.lessons,
        role: payload.role,
        status: payload.status,
        tech_stack: payload.techStack,
        title: payload.title,
        year: payload.year,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error("Project ID was not returned.");
    }

    // For pure create there are no old assets to clean on success
    revalidateProjectPaths(data.id);
    return successState("Project created.", {
      entity: "project",
      item: buildProjectItem(data.id, payload, uploadedPaths),
      operation: "create",
    });
  } catch (error) {
    // Best-effort cleanup of anything we uploaded before the failure
    if (uploadedPaths.length > 0) {
      await cleanupStoragePaths(bucket, uploadedPaths);
    }
    return errorState(error instanceof Error ? error.message : "Failed to create project.");
  }
}

export async function updateProjectAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const projectId = toNumberValue(formData.get("id"));
  const payload = buildProjectPayload(formData, {
    screenshot1: toNullableString(formData.get("currentScreenshot1")),
    screenshot2: toNullableString(formData.get("currentScreenshot2")),
    screenshot3: toNullableString(formData.get("currentScreenshot3")),
  });
  const fieldErrors = validateProjectPayload(payload);

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Fix the highlighted project fields.", fieldErrors);
  }

  const supabase = await ensureAdminAccess("/workspace/projects");
  const bucket = appEnv.storageBuckets.media;
  const uploadedPaths: string[] = [];
  const oldPathsToCleanup: string[] = [];

  try {
    // Simpler direct pattern for project update (Phase 4 prototype)
    const finalImagePaths: string[] = [];

    for (const [index, file] of payload.files.entries()) {
      const current = payload.currentImagePaths[index];
      const remove = payload.removeImages[index];

      if (file) {
        // New file uploaded for this slot → upload it
        const targetPath = appendExtension(payload.imageUploadPaths[index], file);
        await uploadStorageFile(bucket, targetPath, file, { upsert: false });
        uploadedPaths.push(targetPath);
        finalImagePaths.push(targetPath);

        // Old image (if any) will be cleaned on success
        if (current) oldPathsToCleanup.push(current);
      } else if (remove && current) {
        // Explicitly removing this existing image
        finalImagePaths.push(""); // will be filtered below
        oldPathsToCleanup.push(current);
      } else if (current) {
        // Keeping the existing image
        finalImagePaths.push(current);
      }
    }

    // Filter out any empty slots from removals
    const cleanedImagePaths = finalImagePaths.filter(Boolean);

    const { error } = await supabase
      .from("projects")
      .update({
        brief: payload.brief,
        challenges: payload.challenges,
        description: payload.description,
        features: payload.features,
        github_url: payload.githubUrl,
        image_paths: cleanedImagePaths,
        lessons: payload.lessons,
        role: payload.role,
        status: payload.status,
        tech_stack: payload.techStack,
        title: payload.title,
        year: payload.year,
      })
      .eq("id", projectId);

    if (error) {
      throw error;
    }

    // Success: clean up any old images that were replaced or removed
    if (oldPathsToCleanup.length > 0) {
      await cleanupStoragePaths(bucket, oldPathsToCleanup);
    }

    revalidateProjectPaths(projectId);
    return successState("Project updated.", {
      entity: "project",
      item: buildProjectItem(projectId, payload, cleanedImagePaths),
      operation: "update",
    });
  } catch (error) {
    // Error: best-effort cleanup of anything we newly uploaded
    if (uploadedPaths.length > 0) {
      await cleanupStoragePaths(bucket, uploadedPaths);
    }
    return errorState(error instanceof Error ? error.message : "Failed to update project.");
  }
}

export async function deleteProjectAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const projectId = toNumberValue(formData.get("id"));
  const imagePaths = compactAssetValues([
    toNullableString(formData.get("currentScreenshot1")),
    toNullableString(formData.get("currentScreenshot2")),
    toNullableString(formData.get("currentScreenshot3")),
  ]);
  const supabase = await ensureAdminAccess("/workspace/projects");

  try {
    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      throw error;
    }

    await cleanupStoragePaths(appEnv.storageBuckets.media, imagePaths);
    revalidateProjectPaths(projectId);
    return successState("Project deleted.", {
      entity: "project",
      itemId: projectId,
      operation: "delete",
    });
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Failed to delete project.");
  }
}

export async function createArticleAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const payload = buildArticlePayload(formData);
  const fieldErrors = validateArticlePayload(payload);

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Fix the highlighted article fields.", fieldErrors);
  }

  const supabase = await ensureAdminAccess("/workspace/blog");
  const preparedAssets: PreparedAssetMutation[] = [];

  try {
    const imagePaths = await prepareArticleImageAssets(payload, preparedAssets);

    const { data, error } = await supabase
      .from("articles")
      .insert({
        description: payload.description,
        end_date: payload.endDate,
        image_paths: imagePaths,
        start_date: payload.startDate,
        title: payload.title,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error("Article ID was not returned.");
    }

    await finalizePreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    revalidateArticlePaths();
    return successState("Article created.", {
      entity: "article",
      item: buildArticleItem(data.id, payload, imagePaths),
      operation: "create",
    });
  } catch (error) {
    await rollbackPreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    return errorState(error instanceof Error ? error.message : "Failed to create article.");
  }
}

export async function updateArticleAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const articleId = toNumberValue(formData.get("id"));
  const payload = buildArticlePayload(formData, {
    image1: toNullableString(formData.get("currentImage1")),
    image2: toNullableString(formData.get("currentImage2")),
    image3: toNullableString(formData.get("currentImage3")),
  });
  const fieldErrors = validateArticlePayload(payload);

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Fix the highlighted article fields.", fieldErrors);
  }

  const supabase = await ensureAdminAccess("/workspace/blog");
  const preparedAssets: PreparedAssetMutation[] = [];

  try {
    const imagePaths = await prepareArticleImageAssets(payload, preparedAssets);

    const { error } = await supabase
      .from("articles")
      .update({
        description: payload.description,
        end_date: payload.endDate,
        image_paths: imagePaths,
        start_date: payload.startDate,
        title: payload.title,
      })
      .eq("id", articleId);

    if (error) {
      throw error;
    }

    await finalizePreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    revalidateArticlePaths();
    return successState("Article updated.", {
      entity: "article",
      item: buildArticleItem(articleId, payload, imagePaths),
      operation: "update",
    });
  } catch (error) {
    await rollbackPreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    return errorState(error instanceof Error ? error.message : "Failed to update article.");
  }
}

export async function deleteArticleAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const articleId = toNumberValue(formData.get("id"));
  const imagePaths = compactAssetValues([
    toNullableString(formData.get("currentImage1")),
    toNullableString(formData.get("currentImage2")),
    toNullableString(formData.get("currentImage3")),
  ]);
  const supabase = await ensureAdminAccess("/workspace/blog");

  try {
    const { error } = await supabase.from("articles").delete().eq("id", articleId);

    if (error) {
      throw error;
    }

    await cleanupStoragePaths(appEnv.storageBuckets.media, imagePaths);
    revalidateArticlePaths();
    return successState("Article deleted.", {
      entity: "article",
      itemId: articleId,
      operation: "delete",
    });
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Failed to delete article.");
  }
}

export async function createGachaAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const payload = buildGachaPayload(formData);
  const fieldErrors = validateGachaPayload(payload);

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Fix the highlighted tracker fields.", fieldErrors);
  }

  const supabase = await ensureAdminAccess("/workspace/tracker");
  const preparedAssets: PreparedAssetMutation[] = [];

  try {
    const bannerPath = await prepareTrackerBannerAsset(payload, preparedAssets);

    const { data, error } = await supabase
      .from("tracker_games")
      .insert({
        banner_path: bannerPath,
        guaranteed_lim: payload.guaranteedLim,
        guaranteed_wep: payload.guaranteedWep,
        pity_lim_max: payload.pityLimMax,
        pity_lim_num: payload.pityLimNum,
        pity_std_max: payload.pityStdMax,
        pity_std_num: payload.pityStdNum,
        pity_wep_max: payload.pityWepMax,
        pity_wep_num: payload.pityWepNum,
        title: payload.title,
        year: payload.year,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    if (!data?.id) {
      throw new Error("Tracker entry ID was not returned.");
    }

    await finalizePreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    revalidateGachaPaths();
    return successState("Tracker entry created.", {
      entity: "gacha",
      item: buildGachaItem(data.id, payload, bannerPath),
      operation: "create",
    });
  } catch (error) {
    await rollbackPreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    return errorState(error instanceof Error ? error.message : "Failed to create tracker entry.");
  }
}

export async function updateGachaAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const gameId = toNumberValue(formData.get("id"));
  const payload = buildGachaPayload(formData, {
    banner: toNullableString(formData.get("currentBanner")),
  });
  const fieldErrors = validateGachaPayload(payload);

  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Fix the highlighted tracker fields.", fieldErrors);
  }

  const supabase = await ensureAdminAccess("/workspace/tracker");
  const preparedAssets: PreparedAssetMutation[] = [];

  try {
    const bannerPath = await prepareTrackerBannerAsset(payload, preparedAssets);

    const { error } = await supabase
      .from("tracker_games")
      .update({
        banner_path: bannerPath,
        guaranteed_lim: payload.guaranteedLim,
        guaranteed_wep: payload.guaranteedWep,
        pity_lim_max: payload.pityLimMax,
        pity_lim_num: payload.pityLimNum,
        pity_std_max: payload.pityStdMax,
        pity_std_num: payload.pityStdNum,
        pity_wep_max: payload.pityWepMax,
        pity_wep_num: payload.pityWepNum,
        title: payload.title,
        year: payload.year,
      })
      .eq("id", gameId);

    if (error) {
      throw error;
    }

    await finalizePreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    revalidateGachaPaths();
    return successState("Tracker entry updated.", {
      entity: "gacha",
      item: buildGachaItem(gameId, payload, bannerPath),
      operation: "update",
    });
  } catch (error) {
    await rollbackPreparedAssets(appEnv.storageBuckets.media, preparedAssets);
    return errorState(error instanceof Error ? error.message : "Failed to update tracker entry.");
  }
}

export async function deleteGachaAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const gameId = toNumberValue(formData.get("id"));
  const currentBanner = toNullableString(formData.get("currentBanner"));
  const supabase = await ensureAdminAccess("/workspace/tracker");

  try {
    const { error } = await supabase.from("tracker_games").delete().eq("id", gameId);

    if (error) {
      throw error;
    }

    await cleanupStoragePaths(appEnv.storageBuckets.media, [currentBanner]);
    revalidateGachaPaths();
    return successState("Tracker entry deleted.", {
      entity: "gacha",
      itemId: gameId,
      operation: "delete",
    });
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Failed to delete tracker entry.");
  }
}

export async function uploadCvAction(
  _previousState: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  await ensureAdminAccess("/workspace/assets");
  const file = getOptionalFile(formData.get("cvFile"));
  const removeCurrentCv = toBooleanValue(formData.get("removeCurrentCv"));

  if (!file && !removeCurrentCv) {
    return errorState("Select a CV file or choose to remove the current one.", {
      cvFile: "Upload a PDF or remove the current CV.",
    });
  }

  const currentCvPath = "site/cv.pdf";

  try {
    if (removeCurrentCv) {
      await cleanupStoragePaths(appEnv.storageBuckets.media, [currentCvPath]);
    }

    if (file) {
      await uploadStorageFile(appEnv.storageBuckets.media, currentCvPath, file, { upsert: true });
    }

    revalidatePath("/cv");
    revalidatePath("/workspace/assets");
    return successState(file ? "CV uploaded." : "CV removed.", {
      cvUrl: file ? resolveStorageAsset(appEnv.storageBuckets.media, currentCvPath) ?? null : null,
      entity: "cv",
      operation: "update",
    });
  } catch (error) {
    return errorState(error instanceof Error ? error.message : "Failed to update CV asset.");
  }
}