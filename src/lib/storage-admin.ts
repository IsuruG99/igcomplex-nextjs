import "server-only";

import { createSupabaseAdminClient } from "./supabase/admin";
import { appendExtension, extractStoragePath } from "./storage";

export type PreparedAssetMutation = {
  nextValue: string | null;
  cleanupOnCommit: string[];
  cleanupOnRollback: string[];
};

type PrepareAssetMutationInput = {
  bucket: string;
  currentValue?: string | null;
  newFile?: File | null;
  removeCurrent?: boolean;
  targetPath: string;
  upsert?: boolean;
};

export async function cleanupStoragePaths(bucket: string, values: Array<string | null | undefined>) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return;
  }

  const paths = values
    .map((value) => extractStoragePath(bucket, value))
    .filter((value): value is string => Boolean(value));

  if (paths.length === 0) {
    return;
  }

  await supabase.storage.from(bucket).remove(paths);
}

export async function uploadStorageFile(bucket: string, path: string, file: File, options?: { upsert?: boolean }) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: options?.upsert ?? false,
  });

  if (error) {
    throw error;
  }

  return path;
}

export async function prepareAssetMutation({
  bucket,
  currentValue,
  newFile,
  removeCurrent,
  targetPath,
  upsert,
}: PrepareAssetMutationInput): Promise<PreparedAssetMutation> {
  const currentPath = extractStoragePath(bucket, currentValue ?? null);

  if (newFile) {
    const uploadedPath = await uploadStorageFile(bucket, appendExtension(targetPath, newFile), newFile, { upsert });

    return {
      nextValue: uploadedPath,
      cleanupOnCommit: currentPath ? [currentPath] : [],
      cleanupOnRollback: [uploadedPath],
    };
  }

  if (removeCurrent && currentPath) {
    return {
      nextValue: null,
      cleanupOnCommit: [currentPath],
      cleanupOnRollback: [],
    };
  }

  return {
    nextValue: currentValue ?? null,
    cleanupOnCommit: [],
    cleanupOnRollback: [],
  };
}

export async function finalizePreparedAssets(bucket: string, assets: PreparedAssetMutation[]) {
  await cleanupStoragePaths(
    bucket,
    assets.flatMap((asset) => asset.cleanupOnCommit),
  );
}

export async function rollbackPreparedAssets(bucket: string, assets: PreparedAssetMutation[]) {
  await cleanupStoragePaths(
    bucket,
    assets.flatMap((asset) => asset.cleanupOnRollback),
  );
}
