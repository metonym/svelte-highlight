import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LangtagProps } from "./Highlight.svelte";
import type { LanguageName } from "./languages";

export type HighlightAutoProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     */
    code: any;

    /**
     * Languages to consider for auto-detection.
     * This can improve performance and accuracy.
     * @example ["javascript", "typescript"]
     */
    languageNames?: (LanguageName | (string & {}))[];
  };

export type HighlightAutoEvents = {
  /**
   * Fires once per highlight (when `code`/`languageNames` change and the
   * highlighting result actually changes), including when the result is
   * empty (empty `code`, or no candidate language matches).
   */
  highlight: CustomEvent<{
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;

    /**
     * The language name inferred by `highlight.js`.
     * @example "css"
     */
    language: string;

    /**
     * The scope-event stream behind `highlighted` - the same array
     * `registry.highlightAuto(...).events` returns. See
     * `svelte-highlight/engine` for headless consumption (`tokenLines`,
     * `toRanges`, custom renderers).
     */
    events: ScopeEvent[];

    /**
     * The runner-up candidate and its relevance score, for surfacing
     * detection confidence (e.g. "detected javascript, runner-up
     * typescript at relevance 6"). `undefined` when no other candidate
     * scored above zero, or only one candidate was viable.
     */
    secondBest?: { language: string | undefined; relevance: number };
  }>;
};

export type HighlightAutoSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;

    /**
     * The scope-event stream behind `highlighted` - the same array
     * `registry.highlightAuto(...).events` returns. See
     * `svelte-highlight/engine` for headless consumption (`tokenLines`,
     * `toRanges`, custom renderers).
     */
    events: ScopeEvent[];
  };
};

export default class HighlightAuto extends SvelteComponentTyped<
  HighlightAutoProps,
  HighlightAutoEvents,
  HighlightAutoSlots
> {}
