/// <reference types="svelte" />
import { SvelteComponent } from "svelte";

export interface HighlightProps extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["pre"]> {
  /**
   * @default ""
   */
  code?: string;

  /**
   * @default ""
   */
  highlighted?: string;

  /**
   * @default { name: undefined, register: undefined }
   */
  language?: { name: string; register: any };
}

export default class Highlight extends SvelteComponent<
  HighlightProps,
  { highlight: CustomEvent<string> },
  { default: { highlighted: string } }
> {}
