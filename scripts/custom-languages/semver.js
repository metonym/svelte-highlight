/** @param {import("highlight.js").HLJSApi} _hljs */
function defineSemver(_hljs) {
  const BUILD_METADATA = {
    className: "meta",
    begin: /\+[0-9A-Za-z][0-9A-Za-z.-]*/,
    relevance: 0,
  };

  // Must be checked before a bare "-" range separator: this only matches
  // when the character right after "-" is alphanumeric (immediately
  // attached to the preceding version, no space), which a range separator
  // never is.
  const PRERELEASE = {
    className: "symbol",
    begin: /-[0-9A-Za-z][0-9A-Za-z.-]*/,
    relevance: 0,
  };

  // A "-" used as a range separator ("1.0.0 - 2.9.9") always has
  // whitespace on both sides; matched as three adjacent chunks so only the
  // dash itself gets styled.
  const RANGE_DASH = {
    begin: [/ /, /-/, / /],
    beginScope: { 2: "operator" },
    relevance: 0,
  };

  // Longer alternatives (">=", "<=", "||") must precede their single-char
  // prefixes so the alternation matches the full operator, not just ">"
  // or "<" with a trailing "=" left over.
  const COMPARATOR = {
    className: "operator",
    begin: /\^|~|>=|<=|\|\||>|<|=/,
    relevance: 0,
  };

  const WILDCARD = {
    className: "operator",
    begin: /[xX*]/,
    relevance: 0,
  };

  const NUMBER = {
    className: "number",
    begin: /\b\d+\b/,
    relevance: 0,
  };

  return {
    name: "Semver",
    disableAutodetect: true,
    contains: [
      BUILD_METADATA,
      PRERELEASE,
      RANGE_DASH,
      COMPARATOR,
      WILDCARD,
      NUMBER,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineSemver(hljs);
}

export const semver = { name: "semver", register };
export default semver;
