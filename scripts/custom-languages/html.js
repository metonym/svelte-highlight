import cssRegister from "highlight.js/lib/languages/css";
import javascriptRegister from "highlight.js/lib/languages/javascript";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHtml(hljs) {
  const regex = hljs.regex;
  const TagNameRe = regex.concat(
    /[\p{L}_]/u,
    regex.optional(/[\p{L}0-9_.-]*:/u),
    /[\p{L}0-9_.-]*/u,
  );
  const HtmlIdentRe = /[\p{L}0-9._:-]+/u;
  const HtmlEntities = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/,
  };
  const TagInternals = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: HtmlIdentRe,
        relevance: 0,
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [HtmlEntities],
              },
              {
                begin: /'/,
                end: /'/,
                contains: [HtmlEntities],
              },
              { begin: /[^\s"'=<>`]+/ },
            ],
          },
        ],
      },
    ],
  };

  return {
    name: "HTML",
    aliases: ["htm"],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: "meta",
        begin: /<!DOCTYPE/i,
        end: />/,
        relevance: 10,
      },
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      HtmlEntities,
      {
        className: "tag",
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [TagInternals],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: ["css"],
        },
      },
      {
        className: "tag",
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [TagInternals],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: ["javascript"],
        },
      },
      {
        className: "tag",
        begin: regex.concat(
          /</,
          regex.lookahead(
            regex.concat(TagNameRe, regex.either(/\/>/, />/, /\s/)),
          ),
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: TagNameRe,
            relevance: 0,
            starts: TagInternals,
          },
        ],
      },
      {
        className: "tag",
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(TagNameRe, />/)),
        ),
        contains: [
          {
            className: "name",
            begin: TagNameRe,
            relevance: 0,
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: true,
          },
        ],
      },
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("css", cssRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineHtml(hljs);
}

export const html = { name: "html", register };
export default html;
