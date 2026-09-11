import phpRegister from "highlight.js/lib/languages/php";
import xmlRegister from "highlight.js/lib/languages/xml";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineBlade(hljs) {
  const VARIABLE = {
    className: "variable",
    begin: /\$+[A-Za-z_]\w*/,
    relevance: 0,
  };

  const STRING = {
    className: "string",
    variants: [
      { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
      { begin: /'/, end: /'/, contains: [hljs.BACKSLASH_ESCAPE] },
    ],
  };

  // A directive only counts if the `@` isn't glued to a preceding word
  // character -- otherwise plain markup text containing an email address
  // (`foo@example.com`) gets its domain mistaken for a directive. Lookbehind
  // isn't an option, so the preceding character is captured and consumed
  // (but left unstyled) instead of asserted with a zero-width check.
  const DIRECTIVE = {
    begin: [/(?:^|[^\w@])/, /@[a-zA-Z]\w*/],
    beginScope: { 2: "keyword" },
    relevance: 10,
  };

  const COMMENT = hljs.COMMENT(/\{\{--/, /--\}\}/);

  const RAW_ECHO = {
    className: "template-variable",
    begin: /\{!!/,
    end: /!!\}/,
    contains: [VARIABLE, STRING, hljs.NUMBER_MODE],
  };

  const ECHO = {
    className: "template-variable",
    begin: /\{\{-?/,
    end: /-?\}\}/,
    contains: [VARIABLE, STRING, hljs.NUMBER_MODE],
  };

  // `@{{ ... }}` is Blade's escape hatch for emitting a literal `{{ }}`
  // (used when the surrounding template is also processed by a JS
  // framework like Vue). It must be consumed as plain text before ECHO's
  // `{{` rule gets a chance to treat it as a real Blade expression.
  const ESCAPED_ECHO = {
    className: "meta",
    begin: /@\{\{/,
    end: /\}\}/,
    relevance: 10,
  };

  // `@@if` is the same escape hatch for a directive name: it renders a
  // literal `@if`, so style it like ESCAPED_ECHO rather than as a keyword.
  const ESCAPED_DIRECTIVE = {
    begin: [/(?:^|[^\w@])/, /@@[a-zA-Z]\w*/],
    beginScope: { 2: "meta" },
    relevance: 0,
  };

  // `@verbatim ... @endverbatim` emits its body untouched, so the `{{ }}`
  // inside it is plain markup, not a Blade echo. Same prefix-capture shape as
  // PHP_BLOCK, for the same reason.
  const VERBATIM_BLOCK = {
    begin: [/(?:^|[^\w@])/, /@verbatim\b/],
    beginScope: { 2: "keyword" },
    starts: {
      end: /@endverbatim\b/,
      endScope: "keyword",
      subLanguage: "xml",
    },
  };

  // `@php ... @endphp` embeds a real PHP statement block. Highlight the
  // body with the full `php` grammar and style the `@endphp` closer here:
  // handing it back to DIRECTIVE only worked when it sat at a line start,
  // because a same-line `; @endphp` had its prefix space eaten by the block.
  //
  // Must consume the same optional prefix character as DIRECTIVE below: both
  // match `@php`, so without this, DIRECTIVE's match (which starts one
  // character earlier whenever `@php` isn't at the very start of the file)
  // would win by earliest-start-position and this mode would never fire.
  //
  // The lookahead keeps the inline `@php($x = 1)` form out: it is a single
  // directive, not a block opener, and without the check it swallowed
  // everything up to the next `@endphp` in the file.
  const PHP_BLOCK = {
    begin: [/(?:^|[^\w@])/, /@php\b(?![ \t]*\()/],
    beginScope: { 2: "keyword" },
    starts: {
      end: /@endphp\b/,
      endScope: "keyword",
      subLanguage: "php",
    },
  };

  return {
    name: "Blade",
    aliases: ["blade"],
    subLanguage: "xml",
    contains: [
      COMMENT,
      ESCAPED_ECHO,
      ESCAPED_DIRECTIVE,
      PHP_BLOCK,
      VERBATIM_BLOCK,
      DIRECTIVE,
      RAW_ECHO,
      ECHO,
      VARIABLE,
      STRING,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("xml", xmlRegister);
  hljs.registerLanguage("php", phpRegister);
  return defineBlade(hljs);
}

export const blade = { name: "blade", register };
export default blade;
