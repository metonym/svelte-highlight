import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { diffStats } from "./diff";
import type { Annotation, DiffController, DiffEvents } from "./diff-controller";
import type { FilePatch } from "./diff-edits";
import type { LanguageType } from "./languages";

export type HighlightDiffProps = HTMLAttributes<HTMLDivElement> & {
  /** Original text. @default "" */
  before?: string;

  /** New text. With `streaming`, it may still be growing. @default "" */
  after?: string;

  /**
   * A parsed file patch (from `parsePatch`) to show instead of
   * `before`/`after`. Lines outside its hunks show as folds that can't expand.
   * @default null
   */
  patch?: FilePatch | null;

  /**
   * highlight.js language module.
   * @example
   * import typescript from "svelte-highlight/languages/typescript";
   */
  language: LanguageType<string>;

  /** Supports `bind:view` (the v key toggles it). @default "unified" */
  view?: "unified" | "split";

  /** Unchanged lines kept around each change. @default 3 */
  context?: number;

  /** Highlight changed words inside paired lines. @default true */
  wordDiff?: boolean;

  /** Treat lines that differ only in whitespace as unchanged. @default false */
  ignoreWhitespace?: boolean;

  /** Show moved blocks as moves instead of delete + add. @default true */
  detectMoves?: boolean;

  /**
   * `after` is still streaming in: the part of `before` it hasn't reached
   * shows as pending, and rows behind the last long unchanged run freeze.
   * @default false
   */
  streaming?: boolean;

  /** While streaming, keep the newest row in view. @default true */
  follow?: boolean;

  /** Show accept/reject buttons on each change. @default false */
  review?: boolean;

  /** Wrap long lines instead of scrolling sideways. @default false */
  wrap?: boolean;

  /** Notes shown below their lines. @default [] */
  annotations?: Annotation[];

  /** @default "default" */
  palette?: "default" | "colorblind";

  /** Show the change overview strip. @default true */
  minimap?: boolean;

  /** Render only the rows in view; `"auto"` virtualizes past 500 rows. @default "auto" */
  virtualize?: "auto" | boolean;

  /** Extra rows rendered above and below the viewport. @default 10 */
  overscan?: number;

  /** Spaces per tab. @default 4 */
  tabSize?: number;
};

export type HighlightDiffEvents = {
  /** Fired when the counts change. */
  stats: CustomEvent<ReturnType<typeof diffStats>>;
  navigate: CustomEvent<DiffEvents["navigate"]>;
  /** Fired on every accept/reject, with the resulting text. */
  review: CustomEvent<DiffEvents["review"]>;
};

export default class HighlightDiff extends SvelteComponentTyped<
  HighlightDiffProps,
  HighlightDiffEvents,
  Record<string, never>
> {
  /** The controller, for composing with `DiffView`, `DiffMinimap`, `DiffStats`. */
  diff: DiffController;
  nextChange(): DiffEvents["navigate"] | undefined;
  prevChange(): DiffEvents["navigate"] | undefined;
  expandAll(): void;
  collapseAll(): void;
  decideAll(decision: "accepted" | "rejected"): void;
  /** The text with rejected changes reverted. */
  getResult(): string;
  getPatch(paths?: { oldPath?: string; newPath?: string }): string;
}
