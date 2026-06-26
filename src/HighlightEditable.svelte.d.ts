import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type HighlightEditableProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Specify the editable code. Supports two-way binding (`bind:code`).
   */
  code?: string;

  /**
   * Provide the language grammar used to highlight the code.
   * Import languages from `svelte-highlight/languages/*`.
   * @example
   * import typescript from "svelte-highlight/languages/typescript";
   */
  language: LanguageType<string>;

  /**
   * Number of spaces inserted by the Tab key.
   * @default 2
   */
  tabSize?: number;

  /**
   * Maximum number of undo snapshots retained. Older snapshots are dropped
   * once the limit is exceeded.
   * @default 200
   */
  historyLimit?: number;

  /**
   * Color of the focus outline.
   * @default "#4589ff"
   */
  "--outline-color"?: string;

  /**
   * Width of the focus outline.
   * @default "2px"
   */
  "--outline-width"?: string | number;

  /**
   * Offset of the focus outline.
   * @default "-2px"
   */
  "--outline-offset"?: string | number;
};

export type HighlightEditableEvents = {
  /**
   * Fired on every edit with the current plain-text code.
   */
  change: CustomEvent<{ code: string }>;

  /**
   * Fired when the editor loses focus with the current plain-text code.
   */
  blur: CustomEvent<{ code: string }>;

  /**
   * Fired whenever the undo/redo history changes. `entries` is the linear
   * timeline (oldest to newest, including redoable future states) and `index`
   * points at the current state within it.
   */
  history: CustomEvent<{
    entries: { size: number }[];
    index: number;
    canUndo: boolean;
    canRedo: boolean;
  }>;
};

export default class HighlightEditable extends SvelteComponentTyped<
  HighlightEditableProps,
  HighlightEditableEvents,
  Record<string, never>
> {
  /** Undo to the previous history snapshot. */
  undo(): void;

  /** Redo the last undone history snapshot. */
  redo(): void;

  /** Focus the editor. */
  focus(): void;

  /** Select the entire document. */
  selectAll(): void;

  /** Insert text at the caret (replacing any selection). */
  insert(text: string): void;

  /** Indent the selected lines (or insert one indent at the caret). */
  indent(): void;

  /** Dedent the selected lines. */
  outdent(): void;

  /** Replace the entire document, recording it as an undo step. */
  setCode(value: string): void;

  /** Empty the document. */
  clear(): void;

  /** Read the current code. */
  getCode(): string;

  /** Whether an undo step is available. */
  canUndo(): boolean;

  /** Whether a redo step is available. */
  canRedo(): boolean;
}
