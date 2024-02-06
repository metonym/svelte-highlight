import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LangtagProps } from "./Highlight.svelte";

export type HighlightAutoProps = HTMLAttributes<HTMLPreElement> &
  LangtagProps & {
    /**
     * Specify the text to highlight.
     */
    code: any;
  };

export type HighlightAutoEvents = {
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
  }>;
};

export type HighlightAutoSlots = {
  default: {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    highlighted: string;
  };
};

export default class HighlightAuto extends SvelteComponentTyped<
  HighlightAutoProps,
  HighlightAutoEvents,
  HighlightAutoSlots
> {}
