import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LanguageType } from "./languages";
import type { ThemePalette } from "./theme.d.ts";

export type LangtagProps = {
  /**
   * Show the language name at the top right. Style with the `--langtag-*`
   * props. Opts out of the `svelte-highlight/static` transform.
   * @default false
   */
  langtag?: boolean;

  /** Langtag top offset. @default 0 */
  "--langtag-top"?: string | number;

  /** Langtag right offset. @default 0 */
  "--langtag-right"?: string | number;

  /** Langtag background. @default "inherit" */
  "--langtag-background"?: string;

  /** Langtag text color. @default "inherit" */
  "--langtag-color"?: string;

  /** Langtag border radius. @default 0 */
  "--langtag-border-radius"?: string;

  /** Langtag padding. @default "1em" */
  "--langtag-padding"?: string;

  /** Langtag font size. @default "inherit" */
  "--langtag-font-size"?: string;

  /**
   * Wrap long lines instead of scrolling. Only affects the default slot;
   * incompatible with `HighlightVirtual` and `HighlightStream`'s `virtualize`.
   * @default false
   */
  wrap?: boolean;
};

export type CodeRegionProps = {
  /**
   * Accessible name of the scrollable code region. The region is
   * keyboard-focusable so keyboard users can scroll it. Inside a
   * `CodeWindow`, the window's `title` or `label` is the default.
   * @default "Code"
   */
  label?: string;
};

export type HighlightProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps &
  CodeRegionProps & {
    /**
     * Code to highlight. The container also reads `--overflow-x`,
     * `--overflow-y`, `--border-radius`, `--width`, and `--max-width`.
     */
    code: any;

    /**
     * Language module from `svelte-highlight/languages/*`.
     * @example
     * import typescript from "svelte-highlight/languages/typescript";
     */
    language: LanguageType<string>;

    /**
     * Rendering engine. `"css-highlights"` paints tokens with the CSS
     * Custom Highlight API (`CSS.highlights`) over plain text, instead of
     * a `<span>` per token. Falls back to `"dom"` where `CSS.highlights`
     * is missing; check with `resolvedEngine()`.
     *
     * SSR always renders the `"dom"` markup. The swap to plain text
     * happens after mount. Has no effect with a custom default slot.
     *
     * Colors only: `::highlight()` ignores `font-weight` and
     * `font-style`, so bold and italic are dropped. Underlines are
     * dropped too.
     * @default "dom"
     */
    engine?: "dom" | "css-highlights";

    /**
     * Theme for the `"css-highlights"` engine's `::highlight()` rules:
     * theme CSS from `svelte-highlight/styles/*`, or a `ThemePalette`
     * from `svelte-highlight/themes/*`. Each token gets the `color` and
     * `background-color` that the theme gives its `<span>` in the `"dom"`
     * engine. Without a theme, the text stays plain. Ignored by the
     * `"dom"` engine.
     * @example
     * import github from "svelte-highlight/styles/github";
     */
    theme?: string | ThemePalette;
  };

export type HighlightEvents = {
  /** Fires when the highlighting result changes, including to empty. */
  highlight: CustomEvent<{
    /** The highlighted HTML. */
    highlighted: string;

    /** Scope events behind `highlighted` (see `svelte-highlight/engine`). */
    events: ScopeEvent[];
  }>;
};

export type HighlightSlots = {
  default: {
    /** The highlighted HTML. */
    highlighted: string;

    /** Scope events behind `highlighted` (see `svelte-highlight/engine`). */
    events: ScopeEvent[];
  };
};

export default class Highlight extends SvelteComponentTyped<
  HighlightProps,
  HighlightEvents,
  HighlightSlots
> {
  /**
   * The engine on screen. `"css-highlights"` once it paints. `"dom"`
   * before mount, where `CSS.highlights` is missing, until the color
   * resolver loads, for good if that load fails, and with a custom
   * default slot.
   */
  resolvedEngine(): "dom" | "css-highlights";
}
