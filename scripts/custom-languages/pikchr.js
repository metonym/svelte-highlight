const PIKCHR_KEYWORDS =
  "box arrow line circle ellipse oval arc spline dot text move cylinder file diamond " +
  "fit rad wid ht fill color at from to then with same behind bold italic dashed dotted solid invis chop close " +
  "right left up down";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePikchr(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const NUMBER = {
    className: "number",
    begin: /(?:\b\d+(?:\.\d+)?|\.\d+)(?:in|cm|px|pt|%)?/,
    relevance: 0,
  };

  return {
    name: "Pikchr",
    // Object names like box and arrow are ordinary words, so a fragment of
    // prose or another diagram can look like a statement.
    disableAutodetect: true,
    keywords: {
      keyword: PIKCHR_KEYWORDS,
    },
    contains: [hljs.HASH_COMMENT_MODE, STRING, NUMBER],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePikchr(hljs);
}

export const pikchr = { name: "pikchr", register };
export default pikchr;
