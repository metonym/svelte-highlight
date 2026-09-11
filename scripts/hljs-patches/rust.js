import base from "highlight.js/lib/languages/rust";

/**
 * Patches for highlight.js's Rust grammar.
 *
 * - The stock built-in list spells the `drop` function as `"drop "` (trailing
 *   space), so it never matched. Trimmed.
 * - Common std macros missing from the built-in list: `dbg!`, `todo!`,
 *   `matches!`, `eprint!`, `include!`, `compile_error!`, `thread_local!`.
 * - Rust 1.77 C-string literals: `c"..."` and `cr#"..."#`, alongside the
 *   existing `b"..."` / `br#"..."#` forms.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  const EXTRA_MACROS = [
    "dbg!",
    "todo!",
    "matches!",
    "eprint!",
    "include!",
    "compile_error!",
    "thread_local!",
  ];

  /**
   * The stock grammar's `BUILTINS` is a module-level constant shared by the
   * root keyword table and the `Foo::` path mode, so replace (never mutate)
   * on every keyword table that references it.
   * @param {string[]} list
   */
  const fixBuiltins = (list) => [
    ...list.map((keyword) => keyword.trim()),
    ...EXTRA_MACROS,
  ];

  const rootKeywords =
    /** @type {{ keyword: string[]; type: string[]; literal: string[]; built_in: string[]; "variable.language": string[] }} */ (
      lang.keywords
    );
  rootKeywords.built_in = fixBuiltins(rootKeywords.built_in);

  const contains = /** @type {any[]} */ (lang.contains);
  const pathMode = contains.find((mode) => mode.begin === `${hljs.IDENT_RE}::`);
  if (!pathMode) throw new Error("rust patch: path mode not found");
  pathMode.keywords.built_in = fixBuiltins(pathMode.keywords.built_in);

  const quoteString = contains.find(
    (mode) => mode.begin instanceof RegExp && mode.begin.source === 'b?"',
  );
  if (!quoteString) throw new Error("rust patch: quote string mode not found");
  quoteString.begin = /[bc]?"/;

  const rawString = contains
    .flatMap((mode) => mode.variants ?? [])
    .find(
      (variant) =>
        variant.begin instanceof RegExp &&
        variant.begin.source.startsWith('b?r(#*)"'),
    );
  if (!rawString) throw new Error("rust patch: raw string mode not found");
  rawString.begin = /[bc]?r(#*)"(.|\n)*?"\1(?!#)/;

  return lang;
}

export const rust = { name: "rust", register };
export default rust;
