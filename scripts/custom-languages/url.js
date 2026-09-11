/** @param {import("highlight.js").HLJSApi} _hljs */
function defineUrl(_hljs) {
  // Scheme + separator ("https://", "mailto:", "urn:"), then the
  // userinfo/host, then an optional port, matched as one adjacent sequence
  // so this only fires once at the start of a URL -- a generic host-shaped
  // mode in the flat `contains` list below would otherwise also match
  // ordinary path segments further along.
  const URL_START = {
    begin: [
      /\b[a-zA-Z][a-zA-Z0-9+.-]*:(?:\/\/)?/,
      /(?:[^/\s?#@]+@)?[^/\s?#:]*/,
      // Ports are 1–5 digits. A longer `:`+digits run is a URN NSS
      // (`urn:isbn:0451450523`), not a TCP port.
      /(?::\d{1,5}(?!\d))?/,
    ],
    beginScope: { 1: "meta", 2: "link", 3: "number" },
    relevance: 5,
  };

  const QUERY_PAIR = {
    begin: [/[?&]/, /[^=&#\s]+/, /=/, /[^&#\s]*/],
    beginScope: { 1: "punctuation", 2: "attr", 3: "punctuation", 4: "string" },
    relevance: 0,
  };

  const QUERY_KEY_ONLY = {
    begin: [/[?&]/, /[^=&#\s]+/],
    beginScope: { 1: "punctuation", 2: "attr" },
    relevance: 0,
  };

  const FRAGMENT = {
    className: "symbol",
    begin: /#\S*/,
    relevance: 0,
  };

  return {
    name: "URL",
    disableAutodetect: true,
    contains: [URL_START, QUERY_PAIR, QUERY_KEY_ONLY, FRAGMENT],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineUrl(hljs);
}

export const url = { name: "url", register };
export default url;
