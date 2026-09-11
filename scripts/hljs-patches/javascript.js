import base from "highlight.js/lib/languages/javascript";

/**
 * Patches for highlight.js's JavaScript grammar.
 *
 * - `globalThis` (ES2020) joins `window` / `global` / `self` as a
 *   `variable.language`.
 * - `fetch`, `queueMicrotask`, and `structuredClone` join the built-in
 *   globals, matching `setTimeout` and friends that are already listed.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords =
    /** @type {{ keyword: string[]; type: string[]; literal: string[]; built_in: string[]; "variable.language": string[] }} */ (
      lang.keywords
    );

  // The stock arrays are module-level constants shared across every call,
  // so replace them on the (per-call) keyword object rather than pushing.
  // Every nested mode shares this same object, so the replacement propagates.
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
    throw new Error("javascript patch: function-call mode not found");
  functionCall.match = functionCall.match.replace(
    "(?!",
    `(?!${EXTRA_GLOBALS.map((name) => `${name}\\s*\\(|`).join("")}`,
  );

  return lang;
}

export const javascript = { name: "javascript", register };
export default javascript;
