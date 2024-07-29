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
  {},
  HighlightAutoSlots
> {}
