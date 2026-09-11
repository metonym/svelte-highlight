import base from "highlight.js/lib/languages/python";

/**
 * Patches for highlight.js's Python grammar.
 *
 * - Python 3.12 `type` alias statements (PEP 695): `type Point = tuple[float,
 *   float]` and `type ListOrSet[T] = list[T] | set[T]` now style `type` as a
 *   keyword and the alias name as a class title. Elsewhere (`type(x)`) the
 *   stock built-in styling is unchanged.
 * - The `typing` names list only covered a dozen generics. Extended with the
 *   rest of the commonly imported names (protocols, special forms, ABCs),
 *   at relevance 0 so they don't skew auto-detection.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);
  const keywords =
    /** @type {{ keyword: string[]; type: string[]; literal: string[]; built_in: string[]; "variable.language": string[] }} */ (
      lang.keywords
    );

  // Same identifier pattern as the stock grammar (which doesn't export it).
  const IDENT_RE = /[\p{XID_Start}_]\p{XID_Continue}*/u;

  const EXTRA_TYPES = [
    "Annotated",
    "AnyStr",
    "AsyncGenerator",
    "AsyncIterable",
    "AsyncIterator",
    "Awaitable",
    "ClassVar",
    "Concatenate",
    "Final",
    "FrozenSet",
    "Generator",
    "Hashable",
    "Iterable",
    "Iterator",
    "LiteralString",
    "Mapping",
    "MutableMapping",
    "MutableSequence",
    "MutableSet",
    "NamedTuple",
    "Never",
    "NoReturn",
    "NotRequired",
    "ParamSpec",
    "Protocol",
    "ReadOnly",
    "Required",
    "Self",
    "Sized",
    "TypeAlias",
    "TypedDict",
    "TypeGuard",
    "TypeIs",
    "TypeVar",
    "TypeVarTuple",
    "Unpack",
  ];
  keywords.type.push(...EXTRA_TYPES.map((name) => `${name}|0`));

  const TYPE_ALIAS = {
    match: [/\btype/, /\s+/, IDENT_RE, /\s*/, /(?=\[|=(?!=))/],
    scope: {
      1: "keyword",
      3: "title.class",
    },
  };

  const contains = /** @type {any[]} */ (lang.contains);
  const defIndex = contains.findIndex(
    (mode) => Array.isArray(mode.match) && String(mode.match[0]) === "/\\bdef/",
  );
  if (defIndex === -1) throw new Error("python patch: def mode not found");
  contains.splice(defIndex, 0, TYPE_ALIAS);

  return lang;
}

export const python = { name: "python", register };
export default python;
