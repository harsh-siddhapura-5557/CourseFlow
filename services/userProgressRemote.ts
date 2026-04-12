import api from "@/services/api";
import { logger } from "@/utils/logger";

/**
 * FreeAPI has no dedicated "course bookmarks" endpoint for public random products.
 * We persist bookmark + enrolled product IDs in the authenticated user's social profile
 * `bio` field using a versioned prefix (data is user-scoped on the server).
 */
export const COURSEFLOW_BIO_PREFIX = "[[courseflow:v1]]";

export type RemoteUserProgress = {
  bookmarks: number[];
  enrolled: number[];
};

function uniqSorted(nums: number[]): number[] {
  return [...new Set(nums.filter((n) => typeof n === "number" && !Number.isNaN(n)))].sort(
    (a, b) => a - b,
  );
}

/** Split human-visible bio from embedded CourseFlow sync blob */
export function parseProgressFromBio(bio?: string | null): {
  humanBio: string;
  bookmarks: number[];
  enrolled: number[];
} {
  if (!bio || typeof bio !== "string") {
    return { humanBio: "", bookmarks: [], enrolled: [] };
  }
  const idx = bio.indexOf(COURSEFLOW_BIO_PREFIX);
  if (idx === -1) {
    return { humanBio: bio.trim(), bookmarks: [], enrolled: [] };
  }
  const humanBio = bio.slice(0, idx).trimEnd();
  const jsonPart = bio.slice(idx + COURSEFLOW_BIO_PREFIX.length).trim();
  try {
    const parsed = JSON.parse(jsonPart) as { b?: unknown; e?: unknown };
    const bookmarks = Array.isArray(parsed.b)
      ? uniqSorted(parsed.b.map((x) => Number(x)).filter((x) => !Number.isNaN(x)))
      : [];
    const enrolled = Array.isArray(parsed.e)
      ? uniqSorted(parsed.e.map((x) => Number(x)).filter((x) => !Number.isNaN(x)))
      : [];
    return { humanBio, bookmarks, enrolled };
  } catch {
    logger.warn("UserProgressRemote", "Failed to parse embedded progress JSON", {
      preview: jsonPart.slice(0, 80),
    });
    return { humanBio: bio.trim(), bookmarks: [], enrolled: [] };
  }
}

export function buildBioWithProgress(
  humanBio: string,
  progress: RemoteUserProgress,
): string {
  const payload = {
    b: uniqSorted(progress.bookmarks),
    e: uniqSorted(progress.enrolled),
  };
  const blob = `${COURSEFLOW_BIO_PREFIX}${JSON.stringify(payload)}`;
  const base = humanBio.trim();
  return base ? `${base}\n${blob}` : blob;
}

export async function fetchRemoteUserProgress(): Promise<RemoteUserProgress> {
  try {
    const res = await api.get("/social-media/profile");
    const profile = res.data?.data;
    const bio = profile?.bio;
    const parsed = parseProgressFromBio(bio);
    logger.info("UserProgressRemote", "Fetched remote progress", {
      bookmarks: parsed.bookmarks.length,
      enrolled: parsed.enrolled.length,
    });
    return { bookmarks: parsed.bookmarks, enrolled: parsed.enrolled };
  } catch (e: unknown) {
    const err = e as { response?: { status?: number }; message?: string };
    logger.error("UserProgressRemote", "fetchRemoteUserProgress failed", {
      status: err.response?.status,
      message: err.message,
    });
    throw e;
  }
}

export async function pushRemoteUserProgress(
  progress: RemoteUserProgress,
): Promise<void> {
  let humanBio = "";
  try {
    const res = await api.get("/social-media/profile");
    const bio = res.data?.data?.bio;
    humanBio = parseProgressFromBio(bio).humanBio;
  } catch (e: unknown) {
    const err = e as { message?: string };
    logger.warn("UserProgressRemote", "Could not read profile before push", {
      message: err.message,
    });
  }
  const newBio = buildBioWithProgress(humanBio, progress);
  await api.patch("/social-media/profile", { bio: newBio });
  logger.info("UserProgressRemote", "Pushed remote progress", {
    bookmarks: progress.bookmarks.length,
    enrolled: progress.enrolled.length,
  });
}

export function mergeIdLists(a: number[], b: number[]): number[] {
  return uniqSorted([...a, ...b]);
}
