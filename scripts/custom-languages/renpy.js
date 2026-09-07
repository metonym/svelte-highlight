import pythonRegister from "highlight.js/lib/languages/python";

const RENPY_KEYWORDS =
  "label|5 menu|5 jump|5 call return scene|5 show hide with at as behind onlayer zorder play stop queue pause voice window nvl define default image transform screen style init python early translate strings old new layeredimage attribute group always if elif else while for in pass expression from fadein fadeout loop noloop volume channel music sound movie audio dissolve fade move ease pixellate vpunch hpunch zoom xalign yalign xpos ypos xanchor yanchor align pos anchor rotate alpha linear easein easeout repeat parallel choice block on event contains function time animation clockwise counterclockwise circles knot warp subpixel crop size offset text textbutton imagebutton button frame vbox hbox fixed grid viewport side input key timer bar vbar hotspot hotbar imagemap use has add action hovered unhovered sensitive modal tag variant layer properties xfill yfill spacing xsize ysize background padding margin";

const RENPY_SCREEN_ACTIONS =
  "Return Jump Call Show Hide SetVariable ToggleVariable Function NullAction Quit ShowMenu Start MainMenu Rollback Skip Preference Notify";

const RENPY_LITERALS = "True False None";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRenpy(hljs) {
  const LABEL_DECL = {
    begin: [/\blabel\b/, /\s+/, /[\w.]+/],
    beginScope: { 1: "keyword", 3: "title.function" },
    relevance: 0,
  };

  const DOLLAR_LINE = {
    begin: /^\s*\$/,
    end: /$/,
    beginScope: "meta",
    subLanguage: "python",
    relevance: 10,
  };

  const DIALOGUE_SPEAKER = {
    className: "title class_",
    begin: /^\s*[A-Za-z_]\w*(?=\s+")/,
    relevance: 0,
  };

  const TEXT_TAG = {
    className: "tag",
    begin: /\{\/?[a-zA-Z]+(?:=[^}\n]*)?\}/,
    relevance: 0,
  };

  const INTERPOLATION = {
    className: "template-variable",
    begin: /\[[\w.]+\]/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE, TEXT_TAG, INTERPOLATION],
  };

  return {
    name: "Ren'Py",
    aliases: ["rpy"],
    keywords: {
      keyword: RENPY_KEYWORDS,
      built_in: RENPY_SCREEN_ACTIONS,
      literal: RENPY_LITERALS,
    },
    contains: [
      hljs.HASH_COMMENT_MODE,
      LABEL_DECL,
      DOLLAR_LINE,
      DIALOGUE_SPEAKER,
      STRING,
      TEXT_TAG,
      INTERPOLATION,
      hljs.C_NUMBER_MODE,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("python", pythonRegister);
  return defineRenpy(hljs);
}

export const renpy = { name: "renpy", register };
export default renpy;
