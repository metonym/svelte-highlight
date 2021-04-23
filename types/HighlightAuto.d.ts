/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface HighlightAutoProps
  extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["pre"]> {
  /**
   * Source code to highlight
   */
  code?: string;
}

export default class HighlightAuto extends SvelteComponentTyped<
  HighlightAutoProps,
  { highlight: CustomEvent<{ highlighted: string }> },
  { default: { highlighted?: string } }
> {}
