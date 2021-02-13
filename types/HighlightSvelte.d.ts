/// <reference types="svelte" />
import { SvelteComponentTyped } from "svelte";

export interface HighlightSvelteProps
  extends svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["pre"]> {
  /**
   * Source code to highlight
   */
  code?: string;
}

export default class HighlightSvelte extends SvelteComponentTyped<
  HighlightSvelteProps,
  {
    highlight: CustomEvent<{ highlighted: string }>;
    click: WindowEventMap["click"];
    mouseover: WindowEventMap["mouseover"];
    mouseenter: WindowEventMap["mouseenter"];
    mouseleave: WindowEventMap["mouseleave"];
    focus: WindowEventMap["focus"];
    blur: WindowEventMap["blur"];
  },
  { default: { highlighted?: string } }
> {}
