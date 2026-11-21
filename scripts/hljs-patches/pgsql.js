import base from "highlight.js/lib/languages/pgsql";

/**
 * Patches for highlight.js's PostgreSQL grammar.
 *
 * - PostgreSQL 15 `MERGE`: `MERGE` joins the command keywords, and
 *   `WHEN [NOT] MATCHED` is one keyword phrase. PostgreSQL 17 adds
 *   `WHEN NOT MATCHED BY SOURCE` / `BY TARGET`. The phrase form keeps
 *   columns named `matched`, `source`, or `target` plain.
 * - PostgreSQL 17 SQL/JSON clauses (`JSON_TABLE`, `JSON_QUERY`, ...):
 *   `NESTED PATH`, `EXISTS PATH`, `KEEP` / `OMIT QUOTES`,
 *   `[UN]CONDITIONAL WRAPPER`, and `... ON ERROR` / `... ON EMPTY`. Before,
 *   `PATH` after `NESTED` or `EXISTS` was styled as the geometric type.
 *
 * Function names such as `merge_action()` and `JSON_TABLE(` stay plain: the
 * stock grammar styles no function calls (`count(`, `json_agg(` are plain
 * too).
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  const keywords = /** @type {{ keyword: string; built_in: string }} */ (
    lang.keywords
  );
  lang.keywords = { ...keywords, keyword: `${keywords.keyword.trim()} MERGE` };

  const contains = /** @type {any[]} */ (lang.contains);
  const phrases = contains.find(
    (mode) =>
      mode.className === "keyword" &&
      Array.isArray(mode.variants) &&
      mode.variants[0]?.begin?.source === "\\bTEXT\\s*SEARCH\\b",
  );
  if (!phrases) throw new Error("pgsql patch: keyword phrase mode not found");
  phrases.variants = [
    ...phrases.variants,
    { begin: /\bWHEN\s+(NOT\s+)?MATCHED(\s+BY\s+(SOURCE|TARGET))?\b/ },
    { begin: /\b(NESTED|EXISTS)\s+PATH\b/ },
    { begin: /\bNESTED(?=\s+')/ },
    { begin: /\b(KEEP|OMIT)\s+QUOTES(\s+ON\s+SCALAR\s+STRING)?\b/ },
    { begin: /\b(CONDITIONAL|UNCONDITIONAL)(\s+ARRAY)?\s+WRAPPER\b/ },
    { begin: /\b(ERROR|EMPTY(\s+(ARRAY|OBJECT))?)\s+ON\s+(ERROR|EMPTY)\b/ },
    { begin: /\bON\s+(ERROR|EMPTY)\b/ },
  ];

  return lang;
}

export const pgsql = { name: "pgsql", register };
export default pgsql;
