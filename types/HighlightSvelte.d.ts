/// <reference types="svelte" />
import { SvelteComponent } from "svelte";

export interface HighlightSvelteProps extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["pre"]> {
  /**
   * @default ""
   */
  code?: string;

  /**
   * @default ""
   */
  highlighted?: string;

  /**
   * @default false
   */
  typescript?: boolean;
}

export default class HighlightSvelte extends SvelteComponent<
  HighlightSvelteProps,
  { highlight: CustomEvent<string> },
  { default: { highlighted: any } }
> {}
