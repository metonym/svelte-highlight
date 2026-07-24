import type { TokenRange } from "./engine.d.ts";
import type { ThemePalette } from "./theme.d.ts";

/** "css-highlights" when requested AND CSS.highlights is available; else "dom". */
export function resolveEngine(requested: string): "dom" | "css-highlights";

/** Monotonic per-page instance ids (moved from HighlightEditable). */
export function nextInstanceId(): number;

/** Instance-scoped ::highlight() rules for a theme string or ThemePalette. */
export function instanceHighlightRules(
  theme: string | ThemePalette,
  instanceId: number,
): string;

/** Scope -> Highlight registry for one component instance. */
export interface HighlightPainter {
  /** Lazily creates the Highlight for `scope` and registers `hljs-<id>-<scope>`. */
  highlightFor(scope: string): Highlight;
  /** Register ranges for token ranges intersecting [start, end) of `textNode`'s text, offsets relative to `textOffset`. Returns the created ranges for caller bookkeeping. */
  paintNode(
    textNode: Text,
    tokenRanges: TokenRange[],
    textOffset: number,
    textLength: number,
  ): Array<{ scope: string; range: Range }>;
  /** Delete all CSS.highlights registrations for this instance. */
  clear(): void;
}

export function createHighlightPainter(instanceId: number): HighlightPainter;
