/** File extensions (and a few bare names) to language names. */
const BY_EXTENSION = /** @type {const} */ ({
  astro: "astro",
  bash: "bash",
  c: "c",
  cc: "cpp",
  cjs: "javascript",
  cpp: "cpp",
  cs: "csharp",
  css: "css",
  cts: "typescript",
  diff: "diff",
  go: "go",
  gql: "graphql",
  graphql: "graphql",
  h: "c",
  hpp: "cpp",
  htm: "html",
  html: "html",
  ini: "ini",
  java: "java",
  js: "javascript",
  json: "json",
  jsx: "javascript",
  kt: "kotlin",
  less: "less",
  lock: "json",
  md: "markdown",
  mdx: "markdown",
  mjs: "javascript",
  mts: "typescript",
  patch: "diff",
  php: "php",
  py: "python",
  rb: "ruby",
  rs: "rust",
  scss: "scss",
  sh: "bash",
  sql: "sql",
  svelte: "svelte",
  swift: "swift",
  toml: "toml",
  ts: "typescript",
  tsx: "typescript",
  vue: "vue",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
});

/** @type {Map<string, import("./languages").LanguageName>} */
const BY_NAME = new Map([
  ["Dockerfile", "dockerfile"],
  ["Makefile", "makefile"],
]);

/**
 * A language name for a file path, from its name or extension.
 * @param {string} path
 * @returns {import("./languages").LanguageName | undefined}
 */
export function languageNameForPath(path) {
  const name = path.slice(path.lastIndexOf("/") + 1);
  const named = BY_NAME.get(name);
  if (named) return named;
  const dot = name.lastIndexOf(".");
  if (dot <= 0) return undefined;
  const ext = name.slice(dot + 1).toLowerCase();
  return /** @type {Record<string, import("./languages").LanguageName>} */ (
    BY_EXTENSION
  )[ext];
}
