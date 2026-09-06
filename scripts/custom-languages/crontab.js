import bashRegister from "highlight.js/lib/languages/bash";

const CRON_NICKNAMES =
  "reboot|yearly|annually|monthly|weekly|daily|midnight|hourly";

const CRON_NAME_ALT =
  "(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|SUN|MON|TUE|WED|THU|FRI|SAT)";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineCrontab(hljs) {
  const COMMAND = {
    begin: /\S/,
    end: /$/,
    subLanguage: "bash",
    relevance: 0,
  };

  const fieldContains = (stepRelevance) => [
    {
      className: "number",
      begin: /[*\d][\d,-]*\/\d+/,
      relevance: stepRelevance,
    },
    { className: "number", begin: /[*\d][\d,-]*/, relevance: 0 },
    {
      className: "built_in",
      begin: new RegExp(`${CRON_NAME_ALT}(?:-${CRON_NAME_ALT})?`),
      relevance: 0,
    },
  ];

  const field5 = {
    end: /\s+|$/,
    contains: fieldContains(5),
    starts: COMMAND,
    relevance: 0,
  };
  const field4 = {
    end: /\s+/,
    contains: fieldContains(0),
    starts: field5,
    relevance: 0,
  };
  const field3 = {
    end: /\s+/,
    contains: fieldContains(0),
    starts: field4,
    relevance: 0,
  };
  const field2 = {
    end: /\s+/,
    contains: fieldContains(0),
    starts: field3,
    relevance: 0,
  };
  const field1 = {
    begin: /^(?=[*\dA-Za-z])/,
    end: /\s+/,
    contains: fieldContains(0),
    starts: field2,
    relevance: 0,
  };

  const NICKNAME = {
    className: "keyword",
    begin: new RegExp(`^@(?:${CRON_NICKNAMES})\\b`),
    relevance: 10,
    starts: COMMAND,
  };

  const ENV_LINE = {
    beginScope: "variable",
    begin: /^[A-Za-z_][A-Za-z0-9_]*(?=\s*=)/,
    end: /$/,
    contains: [
      {
        className: "string",
        begin: /=/,
        end: /$/,
        excludeBegin: true,
        contains: [hljs.BACKSLASH_ESCAPE],
      },
    ],
    relevance: 0,
  };

  return {
    name: "crontab",
    aliases: ["cron"],
    contains: [hljs.HASH_COMMENT_MODE, ENV_LINE, NICKNAME, field1],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("bash", bashRegister);
  return defineCrontab(hljs);
}

export const crontab = { name: "crontab", register };
export default crontab;
