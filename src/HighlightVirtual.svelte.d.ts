import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type HighlightVirtualProps = HTMLAttributes<HTMLPreElement> & {
  /** Code to render. */
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

  /**
   * Tokenize the rest of the document in idle time after the first paint,
   * so far jumps don't stall. Costs memory for the whole document up front.
   * @default false
   */
  tokenizeAhead?: boolean;
};

export type HighlightVirtualEvents = {
  /** Fired whenever the rendered window changes. */
  windowchange: CustomEvent<{ start: number; end: number; lineCount: number }>;

  /**
   * Fired after each idle slice of `tokenizeAhead`, with how many lines
   * are tokenized so far. `through === lineCount` once it's done.
   */
  tokenize: CustomEvent<{ through: number; lineCount: number }>;
};

export default class HighlightVirtual extends SvelteComponentTyped<
  HighlightVirtualProps,
  HighlightVirtualEvents,
  Record<string, never>
> {
  /**
   * Scroll a given line into the rendered window, without animation.
   * `align` places it at the viewport's top (default) or middle.
   */
  scrollToLine(line: number, options?: { align?: "start" | "center" }): void;
}
