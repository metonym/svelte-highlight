import pythonRegister from "highlight.js/lib/languages/python";

const KV_STYLE_KEYS =
  "canvas canvas.before canvas.after on_press on_release on_touch_down on_touch_up id size_hint pos_hint size pos orientation spacing padding text";

const KV_LITERALS = "root self app True False None";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineKv(hljs) {
  const DIRECTIVE = {
    className: "meta",
    begin: /^#:\w+/,
    relevance: 5,
  };

  const RULE_HEADER = {
    className: "title.class",
    begin: /<[\w.]+(?:@[\w.]+)?>/,
    relevance: 10,
  };

  const WIDGET_CHILD = {
    className: "title.class",
    begin: /^\s*[A-Z]\w*(?=\s*:\s*$)/,
    relevance: 0,
  };

  const KNOWN_KEY = {
    className: "attr",
    begin: new RegExp(
      `^\\s*(?:${KV_STYLE_KEYS.split(" ").join("|").replace(/\./g, "\\.")})(?=\\s*:)`,
    ),
    relevance: 5,
  };

  const GENERIC_KEY = {
    className: "attr",
    begin: /^\s*[a-z_][\w.]*(?=\s*:)/,
    relevance: 0,
  };

  const PROPERTY_VALUE = {
    begin: /:(?=[ \t]*\S)/,
    end: /$/,
    excludeBegin: true,
    subLanguage: "python",
    relevance: 0,
  };

  return {
    name: "KV",
    aliases: ["kivy"],
    keywords: {
      literal: KV_LITERALS,
    },
    contains: [
      DIRECTIVE,
      hljs.HASH_COMMENT_MODE,
      RULE_HEADER,
      WIDGET_CHILD,
      KNOWN_KEY,
      GENERIC_KEY,
      PROPERTY_VALUE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("python", pythonRegister);
  return defineKv(hljs);
}

export const kv = { name: "kv", register };
export default kv;
