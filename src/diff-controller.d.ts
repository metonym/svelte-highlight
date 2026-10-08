import type { DiffState, diffStats, Row } from "./diff";
import type { FilePatch } from "./diff-edits";
import type { LanguageType } from "./languages";

export interface Annotation {
  side: "old" | "new";
  /** 1-based line on that side. */
  line: number;
  body: string;
  author?: string;
  tone?: "info" | "warning" | "error" | "suggestion";
  /** Height in code lines. @default body lines + 1 */
  lines?: number;
}

export type ViewRow = Row & { note?: Annotation };

export interface DiffControllerOptions {
  language?: LanguageType<string>;
  /** @default "unified" */
  view: "unified" | "split";
  /** Unchanged lines kept around each change. @default 3 */
  context: number;
  /** @default true */
  wordDiff: boolean;
  /** @default false */
  ignoreWhitespace: boolean;
  /** @default true */
  detectMoves: boolean;
  /** @default [] */
  annotations: Annotation[];
  /** @default 4 */
  tabSize: number;
}

export interface RenderedRow {
  row: ViewRow;
  index: number;
  /** Height in code lines. */
  span: number;
  oldHtml: string;
  newHtml: string;
}

export interface DiffMark {
  id: number;
  rowIndex: number;
  /** Fraction of the total height. */
  top: number;
  height: number;
  kind: "add" | "del" | "mod";
  decision: "accepted" | "rejected" | undefined;
}

export interface DiffEvents {
  /** A view should scroll `unit` (in code lines) into view. */
  reveal: { unit: number; align: "start" | "center" | "third" };
  /** What a view shows, in code lines. */
  viewport: { top: number; height: number };
  navigate: { change: number; index: number; count: number };
  review: { decisions: Map<number, "accepted" | "rejected">; text: string };
  options: DiffControllerOptions;
}

export interface DiffController {
  /** Svelte store contract: `$diff` updates on every change. */
  subscribe(run: (value: DiffController) => void): () => void;
  on<K extends keyof DiffEvents>(
    type: K,
    listener: (detail: DiffEvents[K]) => void,
  ): () => void;
  /** Bumped on every change. */
  readonly version: number;

  /**
   * Diffs two texts. With `streaming`, `after` may still be growing.
   * Replacing (not growing) the texts resets folds and review.
   */
  update(
    before: string,
    after: string,
    options?: { streaming?: boolean },
  ): void;
  /** Shows a parsed file patch instead of two texts. */
  setPatch(patch: FilePatch | null): void;
  /** Changes options; a no-op if nothing differs. */
  setOptions(options: Partial<DiffControllerOptions>): void;
  options(): DiffControllerOptions;

  state(): DiffState & { beforeText?: string; afterText?: string };
  rows(): ViewRow[];
  /** Row tops in code lines; `tops()[rows().length]` is the total. */
  tops(): Int32Array;
  totalUnits(): number;
  /** First row whose bottom is past `unit`. */
  rowAt(unit: number): number;
  /** Rows `[start, end)` with highlighted HTML and word diffs. */
  renderRows(start: number, end: number): RenderedRow[];
  stats(): ReturnType<typeof diffStats>;
  /** Widest line per side in columns, and the gutter width in characters. */
  columns(): { old: number; new: number; gutter: number };
  marks(): DiffMark[];

  /** The change last navigated to or decided, or -1. */
  current(): number;
  nextChange(): DiffEvents["navigate"] | undefined;
  prevChange(): DiffEvents["navigate"] | undefined;
  reveal(unit: number, align?: "start" | "center" | "third"): void;
  setViewport(top: number, height: number): void;

  isExpanded(key: string): boolean;
  toggleFold(key: string): void;
  expandAll(): void;
  collapseAll(): void;

  decisions(): Map<number, "accepted" | "rejected">;
  decide(change: number, decision: "accepted" | "rejected" | undefined): void;
  decideAll(decision: "accepted" | "rejected"): void;
  /** The text with rejected changes reverted. */
  result(): string;
  /** A unified patch of the diff. */
  patch(paths?: { oldPath?: string; newPath?: string }): string;
}

export function createDiffController(
  options?: Partial<DiffControllerOptions>,
): DiffController;
