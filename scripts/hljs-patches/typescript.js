import base from "highlight.js/lib/languages/typescript";

/**
 * Patches for highlight.js's TypeScript grammar.
 *
 * - Type-level keywords the stock grammar leaves unstyled: `keyof`, `infer`,
 *   `asserts`, and the `accessor` class-member modifier (TS 4.9).
 * - Same runtime globals as the JavaScript patch: `globalThis` as a
 *   `variable.language`; `fetch`, `queueMicrotask`, `structuredClone` as
 *   built-ins. (typescript.js embeds its own copy of the JavaScript grammar,
 *   so the JavaScript patch doesn't carry over.)
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords =
    /** @type {{ keyword: string[]; type: string[]; literal: string[]; built_in: string[]; "variable.language": string[] }} */ (
      lang.keywords
    );

  // The stock arrays may be module-level constants shared across every call,
  // so replace them on the (per-call) keyword object rather than pushing.
  // Every nested mode shares this same object, so the replacement propagates.
  keywords.keyword = [
    ...keywords.keyword,
    "keyof",
    "infer",
    "asserts",
    "accessor",
  ];
  keywords["variable.language"] = [
    ...keywords["variable.language"],
    "globalThis",
  ];
  keywords.built_in = [
    ...keywords.built_in,
    "fetch",
    "queueMicrotask",
    "structuredClone",
  ];

  // The stock `title.function` call rule carries a negative lookahead listing
  // every built-in global (so `setTimeout(` styles as `built_in`, not as a
  // plain function call). Extend that list with the globals added above.
  const EXTRA_GLOBALS = ["fetch", "queueMicrotask", "structuredClone"];
  const contains = /** @type {any[]} */ (lang.contains);
  const functionCall = contains.find(
    (mode) =>
      mode.className === "title.function" &&
      typeof mode.match === "string" &&
      mode.match.startsWith("\\b(?!setInterval\\s*\\("),
  );
  if (!functionCall)
    throw new Error("typescript patch: function-call mode not found");
  functionCall.match = functionCall.match.replace(
    "(?!",
    `(?!${EXTRA_GLOBALS.map((name) => `${name}\\s*\\(|`).join("")}`,
  );

  return lang;
}

export const typescript = { name: "typescript", register };
export default typescript;
