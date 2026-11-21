import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";
import type { ThemePalette } from "./theme.d.ts";

export type HighlightEditableProps = HTMLAttributes<HTMLPreElement> & {
  /** Editable code (`bind:code`). */
  code?: string;

  /**
   * Language module from `svelte-highlight/languages/*`.
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
   * Maximum number of undo snapshots retained.
   * @default 200
   */
  historyLimit?: number;

  /**
   * Blocks edits while keeping highlighting, caret, and selection active.
   * @default false
   */
  readonly?: boolean;

  /**
   * Rendering engine. `"css-highlights"` (experimental) paints tokens via
   * the CSS Custom Highlight API instead of `<span>`s (Chrome 105+, Safari
   * 17.2+, Firefox 140+), falling back to `"dom"` elsewhere (see
   * `resolvedEngine()`). Colors only: `::highlight()` ignores
   * `font-weight` and `font-style`, so bold and italic are dropped.
   * @default "dom"
   */
  engine?: "dom" | "css-highlights";

  /**
   * Theme CSS (`svelte-highlight/styles/<theme>`) or `ThemePalette`
   * (`svelte-highlight/themes/<theme>`) for `"css-highlights"` mode. Each
   * token gets the `color` and `background-color` that the theme gives
   * its `<span>` in the `"dom"` engine, compound scopes included.
   * @example
   * import a11yDark from "svelte-highlight/styles/a11y-dark";
   * @example
   * import atomOneDark from "svelte-highlight/themes/atom-one-dark";
   */
  theme?: string | ThemePalette;

  /**
   * Accessible name of the editor (`aria-label`). The editor has
   * `role="textbox"`, so name it for what it edits.
   * @default "Code editor"
   */
  label?: string;

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
  /** Fired on each edit with the current code. */
  change: CustomEvent<{ code: string }>;

  /** Fired on blur with the current code. */
  blur: CustomEvent<{ code: string }>;

  /** Undo/redo history. `entries` is oldest→newest; `index` is current. */
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
   * The engine on screen. `"css-highlights"` once it paints. `"dom"`
   * before mount, where `CSS.highlights` is missing, while the color
   * resolver loads, and while that load has failed.
   */
  resolvedEngine(): "dom" | "css-highlights";
}
