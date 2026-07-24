import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LanguageType } from "./languages";
import type { ThemePalette } from "./theme.d.ts";

export type LangtagProps = {
  /**
   * Set to `true` to show the language name at the top right.
   *
   * Use style props to customize styles:
   * - `--langtag-top`
   * - `--langtag-right`
   * - `--langtag-background`
   * - `--langtag-color`
   * - `--langtag-border-radius`
   * - `--langtag-padding`
   *
   * @default false
   */
  langtag?: boolean;

  /**
   * Langtag top offset.
   * @default 0
   */
  "--langtag-top"?: string | number;

  /**
   * Langtag right offset.
   * @default 0
   */
  "--langtag-right"?: string | number;

  /**
   * Langtag background.
   * @default "inherit"
   */
  "--langtag-background"?: string;

  /**
   * Langtag text color.
   * @default "inherit"
   */
  "--langtag-color"?: string;

  /**
   * Langtag border radius.
   * @default 0
   */
  "--langtag-border-radius"?: string;

  /**
   * Langtag padding.
   * @default "1em"
   */
  "--langtag-padding"?: string;
};

export type HighlightProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     */
    code: any;

    /**
     * highlight.js language module.
     * Import languages from `svelte-highlight/languages/*`.
     * @example
     * import typescript from "svelte-highlight/languages/typescript";
     */
    language: LanguageType<string>;

    /**
     * Rendering engine. `"css-highlights"` paints tokens via the CSS
     * Custom Highlight API (`CSS.highlights`) over a single text node
     * instead of wrapping each token in a `<span>`, so a highlighted
     * block never grows a `<span>` per token. Falls back to `"dom"`
     * silently where `CSS.highlights` is unavailable (SSR, or a browser
     * without support); check what was actually used with the
     * `resolvedEngine()` method.
     *
     * Only takes effect when this component renders its own default
     * markup — a custom default slot (e.g. to feed `LineNumbers`) has no
     * `Highlight`-owned `<code>` element to paint into, so this prop has
     * no effect in that case.
     *
     * Colors only: `::highlight()` doesn't support `font-style`/
     * `font-weight`/`text-decoration` across browsers, so bold/italic
     * scopes render plain in this mode.
     * @default "dom"
     */
    engine?: "dom" | "css-highlights";

    /**
     * Theme CSS from `svelte-highlight/styles/<theme>`, or a
     * `ThemePalette` from `svelte-highlight/themes/<theme>`, used only in
     * `"css-highlights"` mode to generate `::highlight()` rules. Colors
     * only (`color`/`background-color`); other declarations are dropped.
     * @example
     * import a11yDark from "svelte-highlight/styles/a11y-dark";
     * @example
     * import atomOneDark from "svelte-highlight/themes/atom-one-dark";
     */
    theme?: string | ThemePalette;
  };

export type HighlightEvents = {
  highlight: CustomEvent<{
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;

    /**
     * The scope-event stream behind `highlighted` - the same array
     * `registry.highlight(...).events` returns. See `svelte-highlight/engine`
     * for headless consumption (`tokenLines`, `toRanges`, custom renderers).
     */
    events: ScopeEvent[];
  }>;
};

export type HighlightSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;

    /**
     * The scope-event stream behind `highlighted` - the same array
     * `registry.highlight(...).events` returns. See `svelte-highlight/engine`
     * for headless consumption (`tokenLines`, `toRanges`, custom renderers).
     */
    events: ScopeEvent[];
  };
};

export default class Highlight extends SvelteComponentTyped<
  HighlightProps,
  HighlightEvents,
  HighlightSlots
> {
  /**
   * The engine actually in use: `engine`, or `"dom"` if `"css-highlights"`
   * was requested but `CSS.highlights` is unavailable.
   */
  resolvedEngine(): "dom" | "css-highlights";
}
