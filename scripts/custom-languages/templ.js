import cssRegister from "highlight.js/lib/languages/css";
import goRegister from "highlight.js/lib/languages/go";
import javascriptRegister from "highlight.js/lib/languages/javascript";
import html from "./html.js";

const TEMPL_CONTROL_FLOW_KEYWORDS =
  "if else for range switch case default break continue fallthrough return";

const TEMPL_TOP_LEVEL_KEYWORDS =
  "package import func var const type struct interface";

/** @param {import("highlight.js").HLJSApi} hljs */
function defineTempl(hljs) {
  // A minimal HTML tag matcher (mirrors razor.js's TAG mode) so markup
  // nested inside a Go-flavored region (a `{ }` expression, or a
  // control-flow block body) still renders as a tag instead of escaped
  // plain text.
  const TAG = {
    className: "tag",
    begin: /<\/?[a-zA-Z][\w-]*/,
    end: />/,
    relevance: 0,
  };

  // `{ expr }` inside templ markup renders a Go expression, e.g. `{ name }`,
  // `{ user.Name }`, or the special `{ children... }` slot. It has its own
  // `begin`, so it can safely self-recurse (via the *string* "self", which
  // highlight.js clones per nesting level — a direct object self-reference
  // would reuse a single compiled instance and silently stop matching
  // siblings after the first nested close).
  //
  // This is a factory, not a shared constant: highlight.js compiles each
  // mode *object* exactly once and caches its resolved parent on it, so
  // reusing one GO_EXPRESSION instance at two different contains-array call
  // sites (TEMPL_BODY and CONTROL_FLOW_BODY) leaves the second site's parent
  // pointing at whichever site compiled first — corrupting the mode stack
  // for everything scanned after that first use. A fresh object per call
  // site avoids the collision.
  const createGoExpression = () => ({
    begin: /\{/,
    end: /\}/,
    subLanguage: "go",
    contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
      "self",
      TAG,
    ]),
    relevance: 0,
  });

  // `@component(...)`, `@templ.Join(...)`, and bare `@contents` calls
  // compose other templ components from within markup. The argument list
  // is matched up to the first `)` (not recursively brace/paren-balanced —
  // combining "self" recursion with subLanguage + excludeBegin/excludeEnd
  // here confuses highlight.js's end-matching and corrupts parsing of
  // everything that follows). Component call arguments are rarely deeply
  // nested, so this is an acceptable simplification.
  //
  // Also a factory, for the same shared-instance reason as GO_EXPRESSION
  // above: it's used from both TEMPL_BODY and CONTROL_FLOW_BODY.
  const createComponentCall = () => ({
    className: "template-variable",
    begin: /@[A-Za-z_][\w.]*/,
    relevance: 0,
    starts: {
      begin: /\(/,
      end: /\)/,
      subLanguage: "go",
      excludeBegin: true,
      excludeEnd: true,
      relevance: 0,
    },
  });

  // The body of a Go control-flow block (`if cond { ... }`, `for ... { ... }`).
  // Reached only via CONTROL_FLOW's `starts`, so its opening `{` is already
  // consumed by CONTROL_FLOW's own `end` — this mode has no `begin` of its
  // own. Nested control-flow blocks' braces still need to balance, but this
  // mode can't self-recurse (a beginless mode has nothing to re-match), so a
  // separate NESTED_BRACE mode — an anonymous `{ }` balancer with a real
  // `begin`/`end` pair — handles that instead. A nested `if`'s keyword won't
  // be separately classed as `keyword`, but its braces still balance.
  //
  // This is a factory, not a shared constant, for the same reason as
  // createGoExpression/createComponentCall above: highlight.js compiles each
  // mode *object* once and caches its resolved parent on it, so a single
  // shared instance reused at a second call site would desync the mode
  // stack for everything scanned after that first use. CONTROL_FLOW is only
  // ever placed once (in TEMPL_BODY.contains), but it's still safest to
  // treat its `starts` target as call-site-local.
  const createControlFlowBody = () => ({
    end: /\}/,
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      createComponentCall(),
      createGoExpression(),
      { begin: /\{/, end: /\}/, contains: ["self"] },
    ],
  });

  // Go control-flow keywords (if/else/for/switch/...) open a block, e.g.
  // `if isLoggedIn {` or `for _, item := range items {`. The keyword and
  // condition are highlighted as a standalone token; `end` consumes through
  // the opening `{` itself (rather than a zero-width lookahead) so the
  // control-flow body (handed off via `starts`) begins with a clean slate —
  // a lookahead `end` paired with `starts` leaves highlight.js unable to
  // resolve the parent scope once the started mode closes, silently
  // corrupting highlighting for everything scanned afterward (verified by
  // isolating the two `end` forms against a minimal repro grammar).
  const CONTROL_FLOW = {
    className: "keyword",
    begin: new RegExp(
      `\\b(?:${TEMPL_CONTROL_FLOW_KEYWORDS.split(" ").join("|")})\\b`,
    ),
    end: /\{/,
    relevance: 10,
    starts: createControlFlowBody(),
  };

  // The markup body of a `templ Name(...) { ... }` component. This mode is
  // only ever reached via TEMPL_BLOCK's `starts` (a single usage site) and
  // has no `begin` of its own — TEMPL_BLOCK's `end` already consumed the
  // opening `{` — so it must NOT self-reference (a beginless mode has no
  // way to consume characters, which makes "self" recursion loop forever).
  // Nested braces are instead delegated entirely to CONTROL_FLOW,
  // COMPONENT_CALL, and GO_EXPRESSION, each of which owns a real `begin`.
  const TEMPL_BODY = {
    end: /\}/,
    subLanguage: "html",
    contains: [
      hljs.COMMENT(/<!--/, /-->/, { relevance: 10 }),
      CONTROL_FLOW,
      createComponentCall(),
      createGoExpression(),
    ],
  };

  // `templ Name(params) { ... }` declares a component. The `templ` keyword
  // and Go-flavored signature are highlighted; the body is delegated to
  // TEMPL_BODY.
  const TEMPL_BLOCK = {
    className: "keyword",
    begin: /\btempl\b/,
    end: /\{/,
    relevance: 10,
    contains: [
      {
        className: "title.function",
        begin: /[A-Za-z_]\w*/,
        relevance: 0,
      },
      {
        begin: /\(/,
        end: /\)/,
        subLanguage: "go",
        excludeBegin: true,
        excludeEnd: true,
        contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
          "self",
        ]),
        relevance: 0,
      },
    ],
    starts: TEMPL_BODY,
  };

  // `css Name(params) { ... }` declares a CSS component; its entire body is
  // CSS (with `{ goExpr }` interpolation for dynamic property values).
  // `begin` matches only through the `css` keyword; `end` scans past the
  // name/params to the opening `{` (mirroring TEMPL_BLOCK) so the `{` is
  // consumed exactly once, by `end`, rather than duplicated between
  // `begin` and `end`.
  const CSS_BLOCK = {
    className: "keyword",
    begin: /\bcss\b/,
    end: /\{/,
    relevance: 10,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        subLanguage: "go",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 0,
      },
    ],
    starts: {
      end: /\}/,
      subLanguage: "css",
      contains: [createGoExpression()],
      relevance: 0,
    },
  };

  // `script Name(params) { ... }` declares a legacy script component; its
  // body is plain JavaScript.
  const SCRIPT_BLOCK = {
    className: "keyword",
    begin: /\bscript\b/,
    end: /\{/,
    relevance: 10,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        subLanguage: "go",
        excludeBegin: true,
        excludeEnd: true,
        relevance: 0,
      },
    ],
    starts: {
      end: /\}/,
      subLanguage: "javascript",
      // Balances nested `{...}` in the JS body (e.g. an `if`/function
      // block) so the outer `end` doesn't match the nested block's own
      // closing brace and cut the script body short. `subLanguage` must be
      // repeated here (and again via "self" for deeper nesting): a nested
      // `contains` mode doesn't inherit the parent's subLanguage, so
      // without it the nested block's own content would fall back to
      // templ's (mostly empty) rules instead of JS tokenization.
      contains: /** @type {(import("highlight.js").Mode | "self")[]} */ ([
        {
          begin: /\{/,
          end: /\}/,
          subLanguage: "javascript",
          contains: ["self"],
        },
      ]),
      relevance: 0,
    },
  };

  // Outside of templ/css/script blocks, a `.templ` file is ordinary Go code
  // (package declaration, imports, plain functions, variables).
  const GO_TOP_LEVEL_KEYWORDS = {
    className: "keyword",
    begin: new RegExp(
      `\\b(?:${TEMPL_TOP_LEVEL_KEYWORDS.split(" ").join("|")})\\b`,
    ),
    relevance: 0,
  };

  return {
    name: "templ",
    aliases: ["templ"],
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,
      CSS_BLOCK,
      SCRIPT_BLOCK,
      TEMPL_BLOCK,
      GO_TOP_LEVEL_KEYWORDS,
    ],
  };
}

/** @type {import("highlight.js").LanguageFn} */
function register(hljs) {
  hljs.registerLanguage("html", html.register);
  hljs.registerLanguage("go", goRegister);
  hljs.registerLanguage("css", cssRegister);
  hljs.registerLanguage("javascript", javascriptRegister);
  return defineTempl(hljs);
}

export const templ = { name: "templ", register };
export default templ;
