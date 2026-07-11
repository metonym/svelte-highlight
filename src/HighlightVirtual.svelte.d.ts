import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type HighlightVirtualProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Code to render.
   */
  code: any;

  /**
   * highlight.js language module.
   * Import languages from `svelte-highlight/languages/*`.
   * @example
   * import typescript from "svelte-highlight/languages/typescript";
   */
  language: LanguageType<string>;

  /**
   * Extra lines rendered above and below the viewport.
   * @default 12
   */
  overscan?: number;

  /**
   * Lines between engine checkpoints.
   * @default 100
   */
  checkpointInterval?: number;
};

export default class HighlightVirtual extends SvelteComponentTyped<
  HighlightVirtualProps,
  Record<string, never>,
  Record<string, never>
> {}
