// Theme colors for Highlight's "css-highlights" engine, resolved per text
// run the way the browser cascade resolves them for the "dom" engine's
// `<span>` markup. Each run's full scope chain is matched against the
// theme's rules (compound, descendant and child selectors, specificity,
// source order, `!important`, `var()`, inheritance), so colors match the
// "dom" engine. Only `color` and `background-color` carry over; the CSS
// Custom Highlight API can't change font weight or style.

import {
  forEachRule,
  shorthandBackgroundColor,
  splitTopLevel,
  substituteVars,
} from "./css-walk.js";
import { CLOSE, OPEN, scopeToCssClass } from "./engine.js";
import { BASE_CSS } from "./themes/_base-css.js";

/**
 * @typedef {{ tag: string | null; classes: string[] }} Compound
 * @typedef {{ compounds: Compound[]; combinators: string[]; specificity: number }} Selector
 * @typedef {{ prop: string; value: string; important: boolean; order: number }} Declaration
 * @typedef {{ selectors: Selector[]; declarations: Declaration[] }} Rule
 * @typedef {{ tag: string; classes: Set<string> }} ElementShape
 * @typedef {{ key: string; color?: string; background?: string }} RunStyle
 * @typedef {{
 *   parent: CascadeNode | null;
 *   element: ElementShape | null;
 *   isToken: boolean;
 *   color: string | null;
 *   background: string | null;
 *   effectiveBackground: string | null;
 *   custom: Record<string, string>;
 *   children: Map<string, CascadeNode>;
 *   style: RunStyle | null | undefined;
 * }} CascadeNode
 */

const COMPOUND = /^(\*|[a-zA-Z][\w-]*)?((?:\.[\w-]+)*)$/;
const IMPORTANT = /\s*!\s*important\s*$/i;
const CHILD_COMBINATOR = /\s*>\s*/g;
const WHITESPACE = /\s+/;
const CLASS_WEIGHT = 256;

// Above this many cached scope chains, the cache restarts.
const NODE_LIMIT = 4096;

/**
 * `null` for selectors this model can't match exactly (pseudo-classes,
 * pseudo-elements, attributes, ids, sibling combinators). Pseudo-elements
 * such as `::selection` never style plain token text anyway.
 * @param {string} text
 * @returns {Selector | null}
 */
export function parseSelector(text) {
  const normalized = text.replace(CHILD_COMBINATOR, " > ").trim();
  if (normalized === "") return null;
  /** @type {Compound[]} */
  const compounds = [];
  /** @type {string[]} */
  const combinators = [];
  let pending = " ";
  let specificity = 0;
  for (const part of normalized.split(WHITESPACE)) {
    if (part === ">") {
      if (compounds.length === 0 || pending === ">") return null;
      pending = ">";
      continue;
    }
    const match = COMPOUND.exec(part);
    if (!match) return null;
    const tagText = match[1];
    const classes = match[2] ? match[2].slice(1).split(".") : [];
    if (tagText === undefined && classes.length === 0) return null;
    const tag =
      tagText === undefined || tagText === "*" ? null : tagText.toLowerCase();
    if (compounds.length > 0) combinators.push(pending);
    pending = " ";
    compounds.push({ tag, classes });
    specificity += classes.length * CLASS_WEIGHT + (tag === null ? 0 : 1);
  }
  if (pending === ">") return null;
  return { compounds, combinators, specificity };
}

/**
 * Declarations that affect color: `color`, `background-color`, the
 * `background` shorthand, and custom properties (for `var()`).
 * @param {string} body
 * @param {{ order: number }} counter
 * @returns {Declaration[]}
 */
function colorDeclarations(body, counter) {
  /** @type {Declaration[]} */
  const declarations = [];
  for (const part of splitTopLevel(body, ";")) {
    const colon = part.indexOf(":");
    if (colon === -1) continue;
    const rawProp = part.slice(0, colon).trim();
    const prop = rawProp.startsWith("--") ? rawProp : rawProp.toLowerCase();
    if (
      prop !== "color" &&
      prop !== "background-color" &&
      prop !== "background" &&
      !prop.startsWith("--")
    ) {
      continue;
    }
    let value = part.slice(colon + 1);
    const important = IMPORTANT.test(value);
    if (important) value = value.replace(IMPORTANT, "");
    value = prop.startsWith("--") ? value : value.trim();
    if (value === "" && !prop.startsWith("--")) continue;
    declarations.push({ prop, value, important, order: counter.order++ });
  }
  return declarations;
}

/**
 * The theme's style rules, in source order, keeping only declarations and
 * selectors that bear on token colors.
 * @param {string} css
 * @returns {Rule[]}
 */
export function parseThemeRules(css) {
  /** @type {Rule[]} */
  const rules = [];
  const counter = { order: 0 };
  forEachRule(css, (prelude, body) => {
    const declarations = colorDeclarations(body, counter);
    if (declarations.length === 0) return;
    const selectors = splitTopLevel(prelude, ",")
      .map((selector) => parseSelector(selector))
      .filter((selector) => selector !== null);
    if (selectors.length > 0) rules.push({ selectors, declarations });
  });
  return rules;
}

/**
 * @param {Compound} compound
 * @param {ElementShape} element
 */
function compoundMatches(compound, element) {
  if (compound.tag !== null && compound.tag !== element.tag) return false;
  for (const name of compound.classes) {
    if (!element.classes.has(name)) return false;
  }
  return true;
}

/**
 * Right-to-left, with backtracking over descendant combinators.
 * @param {Selector} selector
 * @param {number} index Compound to match against `node`.
 * @param {CascadeNode} node
 * @returns {boolean}
 */
function matchesAt(selector, index, node) {
  const compound = /** @type {Compound} */ (selector.compounds[index]);
  if (node.element === null || !compoundMatches(compound, node.element)) {
    return false;
  }
  if (index === 0) return true;
  if (selector.combinators[index - 1] === ">") {
    return node.parent !== null && matchesAt(selector, index - 1, node.parent);
  }
  for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
    if (matchesAt(selector, index - 1, ancestor)) return true;
  }
  return false;
}

/** @param {string | null} value */
function keyword(value) {
  return value === null ? "unset" : value.trim().toLowerCase();
}

/**
 * CSS-wide keywords on a custom property. `true`: take the inherited value.
 * `false`: the guaranteed-invalid value.
 */
const CSS_WIDE = new Map([
  ["inherit", true],
  ["unset", true],
  ["revert", true],
  ["revert-layer", true],
  ["initial", false],
]);

const CURRENT_COLOR = /(?<![\w-])currentcolor(?![\w-])/gi;

/**
 * Replaces `currentColor` with the inherited color. Inside `::highlight()`,
 * `currentColor` doesn't mean the token's parent color, so it can't stay.
 * @param {string | null} value
 * @param {string | null} color The parent's color, or `null` when it comes
 *   from outside the `<pre>`.
 * @param {(color: string | null) => string | null} known Fills in the
 *   outside color.
 * @returns {string | null}
 */
function withCurrentColor(value, color, known) {
  if (value === null) return value;
  CURRENT_COLOR.lastIndex = 0;
  if (!CURRENT_COLOR.test(value)) return value;
  const resolved = known(color);
  return resolved === null ? value : value.replace(CURRENT_COLOR, resolved);
}

/**
 * @param {Rule[]} rules
 * @param {Record<string, string>} rootCustom Custom properties inherited
 *   from outside the `<pre>` (a palette's `--shl-*` vars).
 * @param {(() => string | null) | undefined} outsideColor The color the
 *   `<pre>` inherits. Read only when a `currentColor` needs it.
 */
function createResolver(rules, rootCustom, outsideColor) {
  /** @type {string | null | undefined} */
  let pageColor;
  /** @param {string | null} color */
  const known = (color) => {
    if (color !== null) return color;
    if (pageColor === undefined) pageColor = outsideColor?.() ?? null;
    return pageColor;
  };

  /**
   * @param {CascadeNode | null} parent
   * @param {ElementShape} element
   * @param {boolean} isToken
   * @returns {CascadeNode}
   */
  function compute(parent, element, isToken) {
    /** @type {CascadeNode} */
    const node = {
      parent,
      element,
      isToken,
      color: null,
      background: null,
      effectiveBackground: null,
      custom: parent ? parent.custom : rootCustom,
      children: new Map(),
      style: undefined,
    };

    /** @type {Map<string, { declaration: Declaration; specificity: number }>} */
    const winners = new Map();
    for (const rule of rules) {
      let specificity = -1;
      for (const selector of rule.selectors) {
        if (
          selector.specificity > specificity &&
          matchesAt(selector, selector.compounds.length - 1, node)
        ) {
          specificity = selector.specificity;
        }
      }
      if (specificity < 0) continue;
      for (const declaration of rule.declarations) {
        const key =
          declaration.prop === "background"
            ? "background-color"
            : declaration.prop;
        const previous = winners.get(key);
        if (
          previous === undefined ||
          (declaration.important && !previous.declaration.important) ||
          (declaration.important === previous.declaration.important &&
            (specificity > previous.specificity ||
              (specificity === previous.specificity &&
                declaration.order > previous.declaration.order)))
        ) {
          winners.set(key, { declaration, specificity });
        }
      }
    }

    const inherited = node.custom;
    /** @type {Map<string, string>} */
    const declaredCustom = new Map();
    for (const [key, { declaration }] of winners) {
      if (key.startsWith("--")) declaredCustom.set(key, declaration.value);
    }
    if (declaredCustom.size > 0) {
      /** @type {Record<string, string>} */
      const custom = {};
      for (const [name, value] of Object.entries(inherited)) {
        if (!declaredCustom.has(name)) custom[name] = value;
      }
      /** @type {Set<string>} */
      const resolving = new Set();
      /**
       * @param {string} name
       * @returns {string | undefined}
       */
      const resolveCustom = (name) => {
        const raw = declaredCustom.get(name);
        if (raw === undefined) return inherited[name];
        const wide = CSS_WIDE.get(raw.trim().toLowerCase());
        if (wide !== undefined) return wide ? inherited[name] : undefined;
        if (resolving.has(name)) return undefined;
        resolving.add(name);
        const value = substituteVars(raw, resolveCustom);
        resolving.delete(name);
        return value === null || value.trim() === "" ? undefined : value;
      };
      for (const name of declaredCustom.keys()) {
        const value = resolveCustom(name);
        if (value !== undefined) custom[name] = value;
      }
      node.custom = custom;
    }
    const custom = node.custom;
    /** @param {string} name */
    const lookup = (name) => custom[name];

    const parentColor = parent ? parent.color : null;
    node.color = parentColor;
    const colorWinner = winners.get("color");
    if (colorWinner) {
      // In `color`, `currentColor` means the inherited color, also inside
      // functions like `color-mix()`.
      const value = withCurrentColor(
        substituteVars(colorWinner.declaration.value, lookup),
        parentColor,
        known,
      );
      const lower = keyword(value);
      if (lower === "initial") node.color = "CanvasText";
      else if (
        value !== null &&
        lower !== "inherit" &&
        lower !== "unset" &&
        lower !== "revert" &&
        lower !== "revert-layer" &&
        lower !== "currentcolor"
      ) {
        node.color = value.trim();
      }
    }

    const backgroundWinner = winners.get("background-color");
    if (backgroundWinner) {
      const { declaration } = backgroundWinner;
      let value = withCurrentColor(
        substituteVars(declaration.value, lookup),
        node.color,
        known,
      );
      const lower = keyword(value);
      if (lower === "inherit") {
        node.background = parent ? parent.background : null;
      } else if (lower === "currentcolor") {
        node.background = node.color;
      } else if (
        value !== null &&
        lower !== "unset" &&
        lower !== "initial" &&
        lower !== "revert" &&
        lower !== "revert-layer"
      ) {
        if (declaration.prop === "background") {
          value = shorthandBackgroundColor(value);
        }
        node.background =
          value.trim().toLowerCase() === "transparent" ? null : value.trim();
      }
    }

    // Backgrounds don't inherit, but a token's text sits on its nearest
    // painted ancestor span. The `<pre>`/`<code>` boxes paint their own.
    node.effectiveBackground = isToken
      ? (node.background ?? parent?.effectiveBackground ?? null)
      : null;
    return node;
  }

  const outside = /** @type {CascadeNode} */ ({
    parent: null,
    element: null,
    isToken: false,
    color: null,
    background: null,
    effectiveBackground: null,
    custom: rootCustom,
    children: new Map(),
    style: null,
  });
  const pre = compute(outside, { tag: "pre", classes: new Set() }, false);
  const code = compute(pre, { tag: "code", classes: new Set(["hljs"]) }, false);
  code.style = null;
  let size = 0;

  return {
    /** The `<code class="hljs">` element: where events start. */
    root: code,

    /**
     * The node for a `<span>` with `scope`'s classes inside `parent`.
     * @param {CascadeNode} parent
     * @param {string} scope
     * @returns {CascadeNode}
     */
    child(parent, scope) {
      let node = parent.children.get(scope);
      if (node === undefined) {
        if (size >= NODE_LIMIT) {
          code.children = new Map();
          size = 0;
        }
        node = compute(
          parent,
          {
            tag: "span",
            classes: new Set(scopeToCssClass(scope, "hljs-").split(" ")),
          },
          true,
        );
        parent.children.set(scope, node);
        size++;
      }
      return node;
    },

    /**
     * What a highlight must paint for text directly inside `node`, or
     * `null` when it looks the same as plain text in `<code>`.
     * @param {CascadeNode} node
     * @returns {RunStyle | null}
     */
    styleOf(node) {
      if (node.style !== undefined) return node.style;
      const color =
        node.color !== null && node.color !== code.color
          ? node.color
          : undefined;
      const background = node.effectiveBackground ?? undefined;
      node.style =
        color === undefined && background === undefined
          ? null
          : {
              key: `${color ?? ""}\n${background ?? ""}`,
              ...(color !== undefined && { color }),
              ...(background !== undefined && { background }),
            };
      return node.style;
    },
  };
}

/** @typedef {ReturnType<typeof createResolver>} ThemeCascade */

/**
 * A resolver for `theme`'s token colors. Theme CSS is matched as written;
 * a `ThemePalette` goes through `themes/base.css`, as the "dom" engine
 * applies it.
 * @param {string | import("./theme.d.ts").ThemePalette} theme
 * @param {() => string | null} [outsideColor] The color the `<pre>`
 *   inherits from the page. Needed only by themes that use `currentColor`.
 * @returns {ThemeCascade}
 */
export function createThemeCascade(theme, outsideColor) {
  if (typeof theme === "object") {
    // The vars sit on a wrapper with no `--shl-*` vars above it, so a
    // CSS-wide keyword leaves the var unset.
    /** @type {Record<string, string>} */
    const vars = {};
    for (const [name, value] of Object.entries(theme.vars)) {
      if (!CSS_WIDE.has(value.trim().toLowerCase())) vars[name] = value;
    }
    return createResolver(parseThemeRules(BASE_CSS), vars, outsideColor);
  }
  return createResolver(parseThemeRules(theme), rootVars(theme), outsideColor);
}

const ROOT_SELECTORS = new Set([":root", ":host", "html"]);

/**
 * Custom properties theme CSS sets on `:root`, `:host` or `html`, which
 * every `.hljs` element inherits. The selector model above can't match
 * those elements, so they come in like a palette's vars.
 * @param {string} css
 * @returns {Record<string, string>}
 */
function rootVars(css) {
  /** @type {Record<string, string>} */
  const vars = {};
  forEachRule(css, (prelude, body) => {
    const selectors = splitTopLevel(prelude, ",").map((s) => s.trim());
    if (!selectors.every((selector) => ROOT_SELECTORS.has(selector))) return;
    for (const part of splitTopLevel(body, ";")) {
      const colon = part.indexOf(":");
      const name = part.slice(0, colon).trim();
      if (colon === -1 || !name.startsWith("--")) continue;
      const value = part.slice(colon + 1).trim();
      if (!CSS_WIDE.has(value.toLowerCase())) vars[name] = value;
    }
  });
  return vars;
}

/**
 * Run styles and their `c<index>` names. Pass the same table to each
 * `cascadeRanges` call to keep names stable across calls.
 * @typedef {{ styles: RunStyle[]; names: Map<string, string> }} RunTable
 */

/** @returns {RunTable} */
export function createRunTable() {
  return { styles: [], names: new Map() };
}

/**
 * One range per run of text that shares a style, named `c<index>` into
 * `styles`. Text that looks the same as plain `<code>` text gets no range.
 * Offsets are into the events' concatenated text, as `toRanges` returns.
 * @param {import("./engine.d.ts").ScopeEvent[]} events
 * @param {ThemeCascade} cascade
 * @param {RunTable} [table] Names styles; new styles are appended to it.
 * @returns {{ ranges: import("./engine.d.ts").TokenRange[]; styles: RunStyle[] }}
 */
export function cascadeRanges(events, cascade, table = createRunTable()) {
  /** @type {import("./engine.d.ts").TokenRange[]} */
  const ranges = [];
  const { styles, names } = table;
  /** @type {CascadeNode[]} */
  const stack = [cascade.root];
  let top = cascade.root;
  let pos = 0;
  for (const event of events) {
    if (event.t === OPEN) {
      top = cascade.child(top, event.s);
      stack.push(top);
    } else if (event.t === CLOSE) {
      stack.pop();
      top = /** @type {CascadeNode} */ (stack[stack.length - 1]);
    } else {
      const length = event.v.length;
      if (length === 0) continue;
      const style = cascade.styleOf(top);
      if (style !== null) {
        let scope = names.get(style.key);
        if (scope === undefined) {
          scope = `c${styles.length}`;
          names.set(style.key, scope);
          styles.push(style);
        }
        const last = ranges[ranges.length - 1];
        if (last !== undefined && last.end === pos && last.scope === scope) {
          last.end += length;
        } else {
          ranges.push({ start: pos, end: pos + length, scope });
        }
      }
      pos += length;
    }
  }
  return { ranges, styles };
}

/**
 * @param {RunStyle[]} styles From `cascadeRanges`.
 * @param {string} prefix Highlight name prefix, e.g. `hljs-highlight-1`.
 * @returns {string} `::highlight(<prefix>-c<i>)` rules, concatenated.
 */
export function cascadeHighlightRules(styles, prefix) {
  let rules = "";
  for (const [index, style] of styles.entries()) {
    const declarations = [];
    if (style.color !== undefined) declarations.push(`color:${style.color}`);
    if (style.background !== undefined) {
      declarations.push(`background-color:${style.background}`);
    }
    rules += `::highlight(${prefix}-c${index}){${declarations.join(";")}}`;
  }
  return rules;
}

/**
 * Lives here, not in a component: svelte-preprocess matches a literal
 * style tag inside `<script>` as the component's `<style>` block.
 * @param {RunStyle[]} styles From `cascadeRanges`.
 * @param {string} prefix Highlight name prefix, e.g. `hljs-highlight-1`.
 * @returns {string} `<style>`-wrapped `::highlight(<prefix>-c<i>)` rules, or
 *   `""` when there are none.
 */
export function cascadeHighlightStyle(styles, prefix) {
  if (styles.length === 0) return "";
  // Theme values can't close the tag early.
  const rules = cascadeHighlightRules(styles, prefix).replaceAll("<", "\\3c ");
  return `<style>${rules}</style>`;
}
