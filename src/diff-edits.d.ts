import type { DiffState } from "./diff";

export interface Edit {
  search: string;
  replace: string;
  path?: string | undefined;
  /** The search text is complete (a streamed edit may still be arriving). */
  searchComplete: boolean;
  /** The whole edit is complete. */
  complete: boolean;
  /** Replaces the whole file. */
  whole?: boolean;
}

export type EditFormat =
  | "search-replace"
  | "unified-diff"
  | "str-replace"
  | "apply-patch"
  | "whole-file"
  | "unknown";

export function detectEditFormat(text: string): EditFormat;

/** Parses model output into edits, tolerating a truncated last edit. */
export function parseEdits(text: string): { format: EditFormat; edits: Edit[] };

/**
 * Finds `search` in `lines`: exactly, then ignoring trailing whitespace,
 * then indentation, then by fuzzy line similarity (score ≥ 0.8).
 */
export function locate(
  lines: string[],
  search: string[],
  from?: number,
): {
  start: number;
  strategy: "exact" | "trailing-whitespace" | "indentation" | "fuzzy";
  score: number;
} | null;

export interface EditResult {
  edit: Edit;
  status: "applied" | "failed";
  strategy?:
    | "exact"
    | "trailing-whitespace"
    | "indentation"
    | "fuzzy"
    | "whole-file"
    | "append";
  score?: number;
  /** Matched lines `[start, end)` in the source. */
  start?: number;
  end?: number;
  reason?: string;
}

/** Applies complete edits. Unmatched or overlapping edits are reported and skipped. */
export function applyEdits(
  source: string,
  edits: Edit[],
): { text: string; results: EditResult[] };

/**
 * The prefix of the edited file that streamed model output has settled.
 * It grows append-only while edits arrive in file order.
 */
export function streamEditPrefix(
  source: string,
  partialOutput: string,
  options?: { done?: boolean },
): { after: string; format: EditFormat; edits: Edit[]; done: boolean };

export interface FilePatch {
  oldPath: string;
  newPath: string;
  status: "modified" | "added" | "deleted" | "renamed" | "binary";
  hunks: Array<{
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    /** Text after the second `@@`, often the enclosing function. */
    section: string;
    lines: Array<{ type: " " | "-" | "+"; text: string }>;
  }>;
  additions: number;
  deletions: number;
}

/** Parses a (possibly multi-file) git or unified patch. */
export function parsePatch(text: string): FilePatch[];

/**
 * A diff state for a patch alone. Lines between hunks are unknown: they
 * become blank filler inside folds that can't expand.
 */
export function patchToState(
  file: FilePatch,
): DiffState & { beforeText: string; afterText: string };
