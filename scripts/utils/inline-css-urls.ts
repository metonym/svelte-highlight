import path from "node:path";

const RELATIVE_URL = /url\(\.\/([^)]+)\)/g;

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

export function mimeFromExt(ext: string): string {
  const mime = MIME_TYPES[ext.toLowerCase()];
  if (!mime) {
    throw new Error(`Unsupported image extension: ${ext}`);
  }
  return mime;
}

/**
 * Replaces relative `url(./filename)` references with base64 data URLs.
 * Reads assets from `baseDir` (the highlight.js styles directory for each theme).
 */
export async function inlineCssUrls(
  css: string,
  baseDir: string,
): Promise<string> {
  const matches = [...css.matchAll(RELATIVE_URL)];
  if (matches.length === 0) return css;

  const uniqueFilenames = [...new Set(matches.map((match) => match[1]))];
  const dataUrls = await Promise.all(
    uniqueFilenames.map(async (filename) => {
      const filePath = path.join(baseDir, filename);
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        throw new Error(`CSS references missing asset: ${filePath}`);
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const mime = mimeFromExt(path.extname(filename));
      return {
        filename,
        dataUrl: `url(data:${mime};base64,${base64})`,
      };
    }),
  );

  let result = css;
  for (const { filename, dataUrl } of dataUrls) {
    result = result.replaceAll(`url(./${filename})`, dataUrl);
  }

  return result;
}
