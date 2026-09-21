const CASBIN_BUILT_INS =
  "keyMatch keyMatch2 keyMatch3 keyMatch4 keyMatch5 regexMatch ipMatch " +
  "ipMatch2 globMatch some where priority subjectPriority sod sodMax " +
  "roleMax rolePre";

const CASBIN_LITERALS = "allow deny";

const CASBIN_SECTIONS = [
  "request_definition",
  "policy_definition",
  "policy_effect",
  "role_definition",
  "matchers",
  "constraint_definition",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCasbin(hljs) {
  // `[matchers]`, `[role_definition]`, and numbered variants like `[p2]`'s
  // sibling `[matchers2]` -- a closed allowlist, same shape as systemd.js's
  // SECTION mode, so a generic INI `[general]` header doesn't match.
  const SECTION = {
    className: "section",
    begin: new RegExp(`^\\[(?:${CASBIN_SECTIONS.join("|")})\\d*\\]`),
    relevance: 10,
  };

  // The leading identifier of a definition line: `r = sub, obj, act`,
  // `p2 = sub, obj, act`, `g = _, _`, `e = some(...)`, `m = ...`.
  const DEFINITION_NAME = {
    className: "attr",
    begin: /^[a-z]\w*(?=\s*=)/,
    relevance: 0,
  };

  // Field references used inside matchers: `r.sub`, `p.obj`, `p.eft`.
  const FIELD_REFERENCE = {
    className: "variable",
    begin: /\b[rpg]\d*\.\w+/,
    relevance: 0,
  };

  // Longest first: `&&`/`||`/`==`/`!=` before the bare `!`/`=`.
  const OPERATOR = {
    className: "operator",
    begin: /&&|\|\||==|!=|!|\+|-|\*|\/|=/,
    relevance: 0,
  };

  return {
    name: "Casbin",
    aliases: ["casbin"],
    keywords: {
      built_in: CASBIN_BUILT_INS,
      literal: CASBIN_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      SECTION,
      DEFINITION_NAME,
      FIELD_REFERENCE,
      OPERATOR,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineCasbin(hljs);
}

export const casbin = { name: "casbin", register };
export default casbin;
