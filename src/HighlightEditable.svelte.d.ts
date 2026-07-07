import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type HighlightEditableProps = HTMLAttributes<HTMLPreElement> & {
  /**
   * Editable code (`bind:code`).
   */
  code?: string;

  /**
   * highlight.js language module.
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
   * Rendering engine. `"css-highlights"` (experimental) paints tokens via
   * the CSS Custom Highlight API (`CSS.highlights`) over plain-text line
   * nodes instead of wrapping them in `<span>`s, so a repaint never
   * replaces DOM the caret could be sitting in. Falls back to `"dom"`
   * silently where `CSS.highlights` is unavailable (Chrome 105+,
   * Safari 17.2+, Firefox 140+); check what was actually used with the
   * `resolvedEngine()` method.
   *
   * Colors only: `::highlight()` doesn't support `font-style`/
   * `font-weight`/`text-decoration` across browsers, so bold/italic scopes
   * render plain in this mode.
   * @default "dom"
   */
  engine?: "dom" | "css-highlights";

  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`, used only in
   * `"css-highlights"` mode to generate `::highlight()` rules. Colors only
   * (`color`/`background-color`); other declarations are dropped.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   */
  theme?: string;

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
   * Fired on each edit with current plain-text code.
   */
  change: CustomEvent<{ code: string }>;

  /**
   * Fired when the editor loses focus with the current plain-text code.
   */
  blur: CustomEvent<{ code: string }>;

  /**
   * Undo/redo history. `entries` is oldest→newest; `index` is current.
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

  /**
   * The engine actually in use: `engine`, or `"dom"` if `"css-highlights"`
   * was requested but `CSS.highlights` is unavailable.
   */
  resolvedEngine(): "dom" | "css-highlights";
}
