/// <reference types="svelte" />
import type { SvelteComponentTyped } from "svelte";

export interface HighlightSvelteProps
  extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["pre"]> {
  /**
   * Source code to highlight
   */
  code?: string;

  /**
   * Add a language tag to the top-right
   * of the code block
   */
  langtag?: boolean;
}

export default class HighlightSvelte extends SvelteComponentTyped<
  HighlightSvelteProps,
  { highlight: CustomEvent<{ highlighted: string }> },
  { default: { highlighted?: string } }
> {}
