import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { LanguageType } from "./languages";

export type HighlightDiffProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Unified diff text, parsed with `parseUnifiedDiff`. Wins over `before`/
   * `after` when both are given.
   *
   * Each hunk is tokenized independently from its own `+`/`-`/` ` lines
   * (the full pre-/post-image files aren't available from diff text alone),
   * so a multi-line construct (a block comment, a template literal) that
   * spans a hunk boundary may highlight incorrectly. Pass `before`/`after`
   * instead when that matters.
   * @default undefined
   */
  diff?: string;

  /**
   * Full pre-image text. Diffed against `after` with `diffLines` when
   * `diff` isn't set. Tokenized as a whole document, so multi-line
   * constructs always highlight correctly.
   * @default undefined
   */
  before?: string;

  /**
   * Full post-image text. See `before`.
   * @default undefined
   */
  after?: string;

  /**
   * highlight.js language module.
   * Import languages from `svelte-highlight/languages/*`.
   * @example
   * import typescript from "svelte-highlight/languages/typescript";
   */
  language: LanguageType<string>;

  /**
   * Which gutter number column(s) to show. `"both"` shows the new-file
   * number (primary column) and the old-file number (secondary column to
   * its left) -- the two-column convention GitHub, GitLab, and Bitbucket
   * use in their unified diff view. `"new"` shows only the new-file
   * number, blank for removed lines. `"unified"` is a single column like
   * `"new"`, but falls back to the old-file number for removed lines
   * instead of leaving it blank. `"none"` hides numbers entirely but
   * keeps the `+`/`-` markers and code.
   * @default "both"
   */
  gutter?: "both" | "new" | "unified" | "none";

  /**
   * A maximal run of consecutive unchanged (`"ctx"`) lines longer than this
   * collapses to a single "N unchanged lines" button that expands on click.
   * @default Infinity
   */
  context?: number;

  /**
   * Render a row for each hunk header (e.g. `@@ -3,5 +3,7 @@`) and, when
   * `diff` provides a path, one row per file header.
   * @default true
   */
  hunkHeaders?: boolean;

  /**
   * Background of added lines. Forwarded to `LineNumbers`'
   * `--line-added-background`.
   * @default "rgba(46, 204, 113, 0.15)"
   */
  "--diff-add-background"?: string;

  /**
   * Background of removed lines. Forwarded to `LineNumbers`'
   * `--line-removed-background`.
   * @default "rgba(231, 76, 60, 0.15)"
   */
  "--diff-del-background"?: string;

  /**
   * Color of the `+`/`-` gutter markers.
   * @default currentColor
   */
  "--diff-marker-color"?: string;

  /**
   * Background of hunk/file header rows.
   * @default transparent
   */
  "--diff-hunk-background"?: string;

  /**
   * Text color of hunk/file header rows.
   * @default inherit
   */
  "--diff-hunk-color"?: string;

  /**
   * Text color of the collapsed-run button.
   * @default inherit
   */
  "--diff-collapsed-color"?: string;
};

export type HighlightDiffEvents = {};

export type HighlightDiffSlots = {};

export default class HighlightDiff extends SvelteComponentTyped<
  HighlightDiffProps,
  HighlightDiffEvents,
  HighlightDiffSlots
> {}
