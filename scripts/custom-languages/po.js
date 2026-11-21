// GNU gettext PO and POT catalogs. Each entry is a set of `#` comments,
// then `msgctxt`, `msgid`, `msgid_plural`, and `msgstr` / `msgstr[N]`
// keywords followed by one or more C-style strings.

// Header fields that the `msgid ""` entry carries in its `msgstr`.
const HEADER_FIELDS =
  "Project-Id-Version|Report-Msgid-Bugs-To|POT-Creation-Date|" +
  "PO-Revision-Date|Last-Translator|Language-Team|Language|MIME-Version|" +
  "Content-Type|Content-Transfer-Encoding|Plural-Forms|X-[A-Za-z][\\w-]*";

/** @param {import("highlight.js").HLJSApi} hljs */
function definePo(hljs) {
  const ESCAPE = {
    className: "char.escape",
    begin: /\\(?:[\\"'?abfnrtv]|[0-7]{1,3}|x[0-9A-Fa-f]+)/,
    relevance: 0,
  };

  // printf-style (`%s`, `%1$d`, `%.2f`, `%%`), Python named (`%(count)d`),
  // and brace-format (`{name}`, `{0}`) placeholders. The space flag is
  // left out, so plain text like "50% done" stays plain.
  const PLACEHOLDER = {
    className: "template-variable",
    variants: [
      { begin: /%%/ },
      { begin: /%\([\w.]+\)[-+#0]*\d*(?:\.\d+)?[diouxXeEfFgGcrsa]/ },
      {
        begin:
          /%(?:\d+\$)?[-+#0]*(?:\d+|\*)?(?:\.(?:\d+|\*))?(?:hh|h|ll|l|L|j|z|t)?[diouxXeEfFgGaAcspn]/,
      },
      { begin: /\{[A-Za-z_]?\w*(?:![rsa])?(?::[^{}"\n]*)?\}/ },
    ],
    relevance: 0,
  };

  const STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [ESCAPE, PLACEHOLDER],
    relevance: 0,
  };

  // `"Content-Type: text/plain; charset=UTF-8\n"` in the header entry.
  const HEADER_STRING = {
    className: "string",
    begin: [/"/, new RegExp(`(?:${HEADER_FIELDS})(?=:)`)],
    beginScope: { 2: "attr" },
    end: /"/,
    illegal: /\n/,
    contains: [ESCAPE],
    relevance: 0,
  };

  // `#, fuzzy, c-format` marks the entry; each flag is a keyword.
  const FLAGS = {
    className: "meta",
    begin: /^#,/,
    end: /$/,
    contains: [{ className: "keyword", begin: /[A-Za-z][\w-]*/ }],
    relevance: 2,
  };

  // `#: src/main.c:42 src/util.c:108` lists source references.
  const REFERENCES = {
    className: "comment",
    begin: /^#:/,
    end: /$/,
    contains: [{ className: "symbol", begin: /[^\s,]+/, relevance: 0 }],
    relevance: 2,
  };

  // `#.` extracted comments, `#|` previous strings, `#~` obsolete entries,
  // and `#` translator comments all render as comments.
  const COMMENT = hljs.COMMENT(/^#/, /$/, { relevance: 0 });

  return {
    name: "gettext PO",
    aliases: ["pot", "gettext"],
    contains: [
      FLAGS,
      REFERENCES,
      COMMENT,
      {
        begin: [/^msgstr/, /\[/, /\d+/, /\]/],
        beginScope: { 1: "keyword", 3: "number" },
        relevance: 3,
      },
      {
        className: "keyword",
        begin: /^(?:msgctxt|msgid_plural|msgid|msgstr)\b/,
        relevance: 3,
      },
      HEADER_STRING,
      STRING,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  return definePo(hljs);
}

export const po = { name: "po", register };
export default po;
