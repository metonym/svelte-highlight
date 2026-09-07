import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LanguageType } from "./languages";

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
   * Opts this usage out of the `svelte-highlight/static` build-time
   * transform, since static output can't pull in `langtag.css`.
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

  /**
   * Wrap long lines instead of scrolling horizontally: sets
   * `white-space: pre-wrap; overflow-wrap: anywhere` on the container.
   *
   * Only affects the built-in `LangTag` fallback; a consumer overriding the
   * default slot must set `white-space` themselves. Not compatible with
   * `HighlightStream`'s `virtualize` mode or `HighlightVirtual`, which
   * assume one fixed-height line per row.
   *
   * @default false
   */
  wrap?: boolean;
};

export type HighlightProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     *
     * The container also exposes `--overflow-x`, `--overflow-y`,
     * `--border-radius`, `--width`, and `--max-width` CSS variables. See
     * README's "Container variables" section.
     */
    code: any;

    /**
     * highlight.js language module.
     * Import languages from `svelte-highlight/languages/*`.
     * @example
     * import typescript from "svelte-highlight/languages/typescript";
     */
    language: LanguageType<string>;
  };

export type HighlightEvents = {
  /**
   * Fires once per highlight (when `code`/`language` change and the
   * highlighting result actually changes), including when the result is
   * empty (empty `code`).
   */
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
> {}
