import type { LanguageType } from "./languages";
import type { ThemePalette } from "./theme.d.ts";

export type EditorEngine = "dom" | "css-highlights";

export interface EditorSettings {
  /** Language module from `svelte-highlight/languages/*`. */
  language: LanguageType<string>;
  /** Number of spaces inserted by the Tab key. @default 2 */
  tabSize: number;
  /** Maximum number of undo snapshots retained. @default 200 */
  historyLimit: number;
  /** Blocks edits while keeping highlighting, caret and selection. @default false */
  readonly: boolean;
  /**
   * `"css-highlights"` (experimental) paints with the CSS Custom Highlight
   * API and falls back to `"dom"` where it is missing. @default "dom"
   */
  engine: EditorEngine;
}

export interface EditorHistorySnapshot {
  /** Oldest to newest. */
  entries: { size: number }[];
  /** Index of the current entry. */
  index: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface EditorOptions extends Partial<EditorSettings> {
  language: LanguageType<string>;
  /** Initial code. @default "" */
  code?: string;
  /**
   * Inserted into `CSS.highlights` names (`hljs-<id>-<scope>`). Pass the
   * same id to `instanceHighlightStyle`. @default a unique id
   */
  instanceId?: string | number;
  /** Called on each edit, undo and redo. */
  onChange?: (code: string) => void;
  /** Called when the undo history changes. */
  onHistory?: (snapshot: EditorHistorySnapshot) => void;
  /** Called on blur. */
  onBlur?: (code: string) => void;
}

export interface Editor {
  /** The id used in this editor's `CSS.highlights` names. */
  readonly instanceId: string | number;
  /** Applies changed settings. A new language or engine repaints. */
  update(settings: Partial<EditorSettings>): void;
  /**
   * Takes code changed outside the editor. Records an undo step, ignores
   * `readonly` and doesn't call `onChange`.
   */
  syncCode(code: string): void;
  undo(): void;
  redo(): void;
  focus(): void;
  selectAll(): void;
  /** Inserts text at the caret, replacing any selection. */
  insert(text: string): void;
  /** Indents the selected lines, or inserts one indent at the caret. */
  indent(): void;
  /** Dedents the selected lines. */
  outdent(): void;
  /** Replaces the whole document as one undo step. */
  setCode(code: string): void;
  clear(): void;
  getCode(): string;
  canUndo(): boolean;
  canRedo(): boolean;
  /** The engine in use: `"dom"` when `"css-highlights"` is unsupported. */
  resolvedEngine(): EditorEngine;
  /** Removes listeners and this editor's CSS highlights. */
  destroy(): void;
}

/**
 * Makes `element` a highlighted code editor, with no framework. Use a
 * `<code contenteditable>` inside a `<pre>`.
 * @example
 * import { createEditor } from "svelte-highlight/editable";
 * import typescript from "svelte-highlight/languages/typescript";
 *
 * const editor = createEditor(document.querySelector("code"), {
 *   language: typescript,
 *   code: "const a = 1;",
 *   onChange: (code) => console.log(code),
 * });
 */
export function createEditor(
  element: HTMLElement,
  options: EditorOptions,
): Editor;

/**
 * `<style>`-wrapped `::highlight()` rules for one editor's
 * `"css-highlights"` engine. Pass the editor's `instanceId`.
 */
export function instanceHighlightStyle(
  theme: string | ThemePalette,
  instanceId: string | number,
): string;
