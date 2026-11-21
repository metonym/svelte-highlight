import base from "highlight.js/lib/languages/php";

/**
 * Patches for highlight.js's PHP grammar.
 *
 * - PHP 8.4 property hooks: `get` and `set` inside a property's hook block
 *   (`get => ...`, `get { ... }`, `set(string $v) { ... }`, `&get`) are
 *   keywords. The stock grammar left `get` plain and styled `set(` as a
 *   function call. A hook is told apart from a call by what follows it:
 *   `=>`, `{`, or a parameter list and then `=>` or `{`. Ordinary
 *   `get()` / `set()` calls and methods named `get` / `set` are unchanged.
 * - PHP 8.4 asymmetric visibility: the `set` in `private(set)`,
 *   `protected(set)`, and `public(set)` is a keyword.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  const contains = /** @type {any[]} */ (lang.contains);
  const invokeIndex = contains.findIndex(
    (mode) =>
      mode.scope &&
      typeof mode.scope === "object" &&
      mode.scope[3] === "title.function.invoke",
  );
  if (invokeIndex === -1)
    throw new Error("php patch: function invoke mode not found");

  // Both modes must sit before the function-invoke mode, which would
  // otherwise claim `set(` first.
  contains.splice(
    invokeIndex,
    0,
    {
      match: [/\b(?:public|protected|private)/, /\(/, /set/, /\)/],
      scope: { 1: "keyword", 3: "keyword" },
      relevance: 0,
    },
    {
      match: /\b(?:get|set)(?=\s*(?:=>|\{|\([^()]*\)\s*(?:=>|\{)))/,
      scope: "keyword",
      relevance: 0,
    },
  );

  return lang;
}

export const php = { name: "php", register };
export default php;
