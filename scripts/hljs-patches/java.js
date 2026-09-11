import base from "highlight.js/lib/languages/java";

/**
 * Patches for highlight.js's Java grammar.
 *
 * - The stock keyword list spells `const` as `"const "` (trailing space), so
 *   it never matched. Trimmed. (`const` is a reserved word in Java.)
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords =
    /** @type {{ keyword: string[]; literal: string[]; type: string[]; built_in: string[] }} */ (
      lang.keywords
    );

  // Replace rather than mutate in place; the keyword object itself is shared
  // with every nested mode, so the replacement propagates.
  keywords.keyword = keywords.keyword.map((keyword) => keyword.trim());

  return lang;
}

export const java = { name: "java", register };
export default java;
