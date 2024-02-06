import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";

export type HighlightSvelteProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Specify the text to highlight.
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
  }>;
};

export type HighlightSvelteSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  };
};

export default class HighlightSvelte extends SvelteComponentTyped<
  HighlightSvelteProps,
  HighlightSvelteEvents,
  HighlightSvelteSlots
> {}
