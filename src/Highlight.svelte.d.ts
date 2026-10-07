import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LanguageType } from "./languages";

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

export type HighlightProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
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
> {}
