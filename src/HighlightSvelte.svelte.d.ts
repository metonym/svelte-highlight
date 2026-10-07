import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { ScopeEvent } from "./engine.d.ts";
import type { LangtagProps } from "./Highlight.svelte";

export type HighlightSvelteProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /** Code to highlight. */
    code: any;
  };

export type HighlightSvelteEvents = {
  /** Fires when the highlighting result changes, including to empty. */
  highlight: CustomEvent<{
    /** The highlighted HTML. */
    highlighted: string;

    /** Scope events behind `highlighted` (see `svelte-highlight/engine`). */
    events: ScopeEvent[];
  }>;
};

export type HighlightSvelteSlots = {
  default: {
    /** The highlighted HTML. */
    highlighted: string;

    /** Scope events behind `highlighted` (see `svelte-highlight/engine`). */
    events: ScopeEvent[];
  };
};

export default class HighlightSvelte extends SvelteComponentTyped<
  HighlightSvelteProps,
  HighlightSvelteEvents,
  HighlightSvelteSlots
> {}
