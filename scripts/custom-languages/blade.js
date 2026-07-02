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
      { begin: /"/, end: /"/ },
      { begin: /'/, end: /'/ },
    ],
  };

  const DIRECTIVE = {
    className: "keyword",
    begin: /@[a-zA-Z]\w*/,
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

  // `@php ... @endphp` embeds a real PHP statement block. Highlight the
  // body with the full `php` grammar and hand `@endphp` back to DIRECTIVE
  // so it's styled the same as every other Blade directive.
  const PHP_BLOCK = {
    className: "keyword",
    begin: /@php\b/,
    starts: {
      end: /(?=@endphp\b)/,
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
      PHP_BLOCK,
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
