const RPMSPEC_TAGS = [
  "Name",
  "Version",
  "Release",
  "Summary",
  "License",
  "URL",
  "Source0",
  "Patch0",
  "BuildRequires",
  "Requires",
  "Provides",
  "Obsoletes",
  "Conflicts",
  "BuildArch",
  "Group",
  "Epoch",
  "ExclusiveArch",
  "Recommends",
  "Suggests",
  "Supplements",
  "Enhances",
];

const RPMSPEC_SECTIONS = [
  "description",
  "package",
  "prep",
  "build",
  "install",
  "check",
  "files",
  "changelog",
  "pre",
  "post",
  "preun",
  "postun",
  "pretrans",
  "posttrans",
  "generate_buildrequires",
];

const RPMSPEC_CONDITIONALS = [
  "if",
  "ifarch",
  "ifos",
  "else",
  "endif",
  "define",
  "global",
  "undefine",
  "bcond_with",
  "bcond_without",
  "dnl",
];

const RPMSPEC_FILE_ATTRS = [
  "defattr",
  "attr",
  "config",
  "doc",
  "license",
  "dir",
  "ghost",
  "exclude",
];

/** @param {import("highlight.js").HLJSApi} hljs */
function defineRpmspec(hljs) {
  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [hljs.BACKSLASH_ESCAPE],
  };

  const PREAMBLE_TAG = {
    className: "attr",
    begin: new RegExp(`^(?:${RPMSPEC_TAGS.join("|")})\\d*(?=\\s*:)`),
    relevance: 5,
  };

  const SECTION_HEADER = {
    className: "section",
    begin: new RegExp(`%(?:${RPMSPEC_SECTIONS.join("|")})\\b`),
    relevance: 10,
  };

  const CONDITIONAL = {
    className: "keyword",
    begin: new RegExp(`%(?:${RPMSPEC_CONDITIONALS.join("|")})\\b`),
    relevance: 0,
  };

  const FILE_ATTR = {
    className: "built_in",
    begin: new RegExp(`%(?:${RPMSPEC_FILE_ATTRS.join("|")})\\b`),
    relevance: 0,
  };

  const MACRO = {
    className: "template-variable",
    begin: /%\{[^}]*\}/,
    relevance: 0,
  };

  const MACRO_CALL = {
    className: "template-variable",
    begin: /%[A-Za-z_][\w]*/,
    relevance: 0,
  };

  const CHANGELOG_ENTRY = {
    className: "meta",
    begin: /^\*\s.*$/,
    relevance: 5,
  };

  return {
    name: "RPM spec",
    aliases: ["spec", "rpm-spec"],
    contains: [
      hljs.HASH_COMMENT_MODE,
      CHANGELOG_ENTRY,
      SECTION_HEADER,
      CONDITIONAL,
      FILE_ATTR,
      MACRO,
      MACRO_CALL,
      PREAMBLE_TAG,
      STRING,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return defineRpmspec(hljs);
}

export const rpmspec = { name: "rpmspec", register };
export default rpmspec;
