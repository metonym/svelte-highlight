import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LangtagProps } from "./Highlight.svelte";

export type HighlightSvelteProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Code to highlight.
     */
    code: any;
  };

export type HighlightSvelteEvents = {
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

export type HighlightSvelteSlots = {
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

export default class HighlightSvelte extends SvelteComponentTyped<
  HighlightSvelteProps,
  HighlightSvelteEvents,
  HighlightSvelteSlots
> {}
