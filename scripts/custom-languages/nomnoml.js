const NOMNOML_CLASSIFIERS =
  "actor database abstract frame package start end state choice input sender receiver transceiver usecase note label hidden reference table instance";

/** @param {import("highlight.js").HLJSApi} _hljs */
function defineNomnoml(_hljs) {
  const DIRECTIVE = {
    className: "meta",
    begin: /#[A-Za-z][\w-]*:/,
    end: /$/,
    relevance: 0,
  };

  const CLASSIFIER = {
    className: "type",
    begin: new RegExp(
      String.raw`<(?:${NOMNOML_CLASSIFIERS.split(" ").join("|")})>`,
    ),
    relevance: 0,
  };

  // Longer arrows first so `->` does not consume the tail of `-->` or `<:--`.
  const ARROW = {
    className: "operator",
    begin: /<->|<:--|--:>|<:-|-->|<--|-:>|\+->|o->|->|<-|--/,
    relevance: 0,
  };

  const BRACKET = {
    className: "punctuation",
    begin: /[[\]|]/,
    relevance: 0,
  };

  return {
    name: "Nomnoml",
    // `[A]->[B]` is generic enough to appear in prose and other languages.
    disableAutodetect: true,
    contains: [DIRECTIVE, CLASSIFIER, ARROW, BRACKET],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineNomnoml(hljs);
}

export const nomnoml = { name: "nomnoml", register };
export default nomnoml;
