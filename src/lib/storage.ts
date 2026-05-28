import { appEnv, hasSupabasePublicEnv } from "./env";

export function resolveStorageAsset(bucket: string, assetPath: string | null | undefined) {
  if (!assetPath) {
    return undefined;
  }

  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  if (!hasSupabasePublicEnv()) {
    return undefined;
  }

  const normalizedPath = assetPath.replace(/^\/+/, "");
  return `${appEnv.nextPublicSupabaseUrl}/storage/v1/object/public/${bucket}/${normalizedPath}`;
}

export function extractStoragePath(bucket: string, value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return value;
  }

  try {
    const parsed = new URL(value);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const markerIndex = parsed.pathname.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(parsed.pathname.slice(markerIndex + marker.length));
  } catch {
    return null;
  }
}

export function appendExtension(path: string, file: File) {
  const extension = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
  return `${path}${extension.toLowerCase()}`;
}
