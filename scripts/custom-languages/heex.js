import elixirRegister from "highlight.js/lib/languages/elixir";
import html from "./html.js";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineHeex(hljs) {
  // Balances a bare `{...}` nested inside an already-open interpolation
  // (e.g. a `%{...}` map literal inside `{@value}` or `attr={...}`).
  // `subLanguage` must be repeated here: a nested `contains` mode does not
  // inherit the parent's `subLanguage`.
  const createNestedBraceBalancer = () => ({
    begin: /\{/,
    end: /\}/,
    subLanguage: "elixir",
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
    relevance: 0,
  });

  // `attr={expr}` / `:if={expr}` interpolation in attribute position. The
  // attribute name, `=`, and opening `{` are matched together as a single
  // multi-part `begin` so the embedded "html" subLanguage's own attribute
  // scanner never sees a bare `=` with nothing after it -- html's `=` mode
  // has no `end` of its own and only closes via a child string match, so if
  // this grammar intercepted just the `{...}` value and left `=` for html to
  // consume alone, html's attribute-value mode would never close and every
  // attribute for the rest of the document would be misparsed as still
  // being inside that stuck value.
  /**
   * @param {RegExp} namePattern
   * @param {string} nameScope
   */
  const createAttrInterpolation = (namePattern, nameScope) => ({
    begin: [namePattern, /=/, /\{/],
    beginScope: { 1: nameScope },
    end: /\}/,
    subLanguage: "elixir",
    contains: [createNestedBraceBalancer()],
    relevance: 10,
  });

  // `{expr}` interpolation in text/child position, e.g. `<p>{@count}</p>`.
  const CURLY_INTERPOLATION = {
    begin: /\{/,
    end: /\}/,
    subLanguage: "elixir",
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
    ]),
    relevance: 0,
  };

  // HEEx-specific comment, distinct from an HTML `<!-- -->` comment and the
  // older EEx `<%# ... %>` form. Must precede EEX_TAG below: both start at
  // the same `<` position for input like `<%!-- ... --%>`, and array order
  // is the tie-break when two begin matches start at the same index.
  const COMMENT = hljs.COMMENT(/<%!--/, /--%>/, { relevance: 10 });

  // `<%= expr %>` (output) and `<% expr %>` (statement, e.g. an `if`/`for`
  // block opener -- EEx blocks close via a separate `<% end %>` tag, not
  // brace-balancing, so a plain `end: /%>/` is sufficient here).
  const EEX_TAG = {
    begin: /<%=?/,
    end: /%>/,
    subLanguage: "elixir",
    relevance: 10,
  };

  // `<.component_name ...>`, `</.component_name>` (function components) and
  // `<:slot_name ...>`, `</:slot_name>` (named slots). html.js's own tag-name
  // pattern requires a leading letter/underscore, so it never matches these
  // leading-`.`/`:` forms -- dotted, capitalized *module* components
  // (`<MyAppWeb.CoreComponents.button>`) already start with a letter and are
  // handled by the "html" subLanguage without help.
  const TAG_INTERNALS = [
    createAttrInterpolation(/:[a-zA-Z_][\w-]*/, "keyword"),
    createAttrInterpolation(/[a-zA-Z_][\w-]*/, "attr"),
    {
      className: "string",
      variants: [
        { begin: /"/, end: /"/ },
        { begin: /'/, end: /'/ },
      ],
    },
    { className: "attr", begin: /[a-zA-Z_][\w-]*/, relevance: 0 },
  ];

  const COMPONENT_TAG = {
    className: "tag",
    begin: /<\/?[.:][A-Za-z_][\w.-]*/,
    end: /\/?>/,
    contains: TAG_INTERNALS,
    relevance: 10,
  };

  // `<script>` and `<style>` bodies are raw text to HEEx (LiveView 1.0):
  // `{ }` is not interpolation there, only `<%= %>` and `<%!-- --%>` still
  // are. Without these, every CSS rule block and JS function body was
  // highlighted as Elixir by CURLY_INTERPOLATION. Same two-stage shape as
  // html.js's own modes: the opener still takes `{...}` attribute values,
  // and `returnEnd` leaves the closing tag to the html sublanguage.
  /**
   * @param {string} name
   * @param {string} subLanguage
   */
  const createRawTextTag = (name, subLanguage) => ({
    className: "tag",
    begin: new RegExp(String.raw`<${name}(?=\s|>)`),
    end: />/,
    keywords: { name },
    contains: TAG_INTERNALS,
    starts: {
      end: new RegExp(`</${name}>`),
      returnEnd: true,
      subLanguage,
      contains: [COMMENT, EEX_TAG],
    },
  });

  return {
    name: "HEEx",
    aliases: ["heex"],
    subLanguage: "html",
    contains: [
      COMMENT,
      EEX_TAG,
      createRawTextTag("style", "css"),
      createRawTextTag("script", "javascript"),
      createAttrInterpolation(/:[a-zA-Z_][\w-]*/, "keyword"),
      createAttrInterpolation(/[a-zA-Z_][\w-]*/, "attr"),
      COMPONENT_TAG,
      CURLY_INTERPOLATION,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("elixir", elixirRegister);
  return defineHeex(hljs);
}

export const heex = { name: "heex", register };
export default heex;
