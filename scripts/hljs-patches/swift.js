import base from "highlight.js/lib/languages/swift";

/**
 * Patches for highlight.js's Swift grammar.
 *
 * - Swift 6 `sending` parameter/result modifier as a (contextual) keyword.
 * - `nonisolated(unsafe)` and `nonisolated(nonsending)` as whole keywords,
 *   the same way the stock grammar treats `unowned(unsafe)`.
 * - Freestanding macros that ship with the toolchain: SwiftUI's `#Preview`
 *   and Swift Testing's `#expect` / `#require`. `#Preview` needs a mode (not
 *   just a keyword entry) because the stock CamelCase type rule otherwise
 *   claims `Preview` on its own.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords = /** @type {{ keyword: string[]; literal: string[] }} */ (
    lang.keywords
  );

  // PLAIN_KEYWORDS.concat(numberSignKeywords) is built fresh per call.
  keywords.keyword.push("sending");

  const contains = /** @type {any[]} */ (lang.contains);

  // KEYWORD: `{ variants: [{ className: "keyword", match: "(?:\bas\?\B|...)" }] }`.
  // Shared by reference across every nested `contains`, so one edit suffices.
  const keywordMode = contains.find(
    (mode) =>
      Array.isArray(mode.variants) &&
      mode.variants.length === 1 &&
      mode.variants[0].className === "keyword" &&
      typeof mode.variants[0].match === "string" &&
      mode.variants[0].match.includes("fileprivate\\(set\\)"),
  );
  if (!keywordMode)
    throw new Error("swift patch: regex keyword mode not found");
  const variant = keywordMode.variants[0];
  if (!variant.match.startsWith("(?:"))
    throw new Error("swift patch: unexpected regex keyword shape");
  variant.match = variant.match.replace(
    "(?:",
    "(?:\\bnonisolated\\(unsafe\\)\\B|\\bnonisolated\\(nonsending\\)\\B|#(?:Preview|expect|require)\\b|",
  );

  // KEYWORD_GUARD: `\.(?:actor|any|...)` consumes `.keyword` so member access
  // isn't styled as a keyword. Keep `.sending` covered too.
  const keywordGuard = contains.find(
    (mode) =>
      mode.relevance === 0 &&
      mode.className === undefined &&
      typeof mode.match === "string" &&
      mode.match.startsWith("\\.(?:actor|"),
  );
  if (!keywordGuard)
    throw new Error("swift patch: keyword guard mode not found");
  keywordGuard.match = keywordGuard.match.replace("\\.(?:", "\\.(?:sending|");

  return lang;
}

export const swift = { name: "swift", register };
export default swift;
