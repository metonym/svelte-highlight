export interface DiffLine {
  type: "add" | "del" | "ctx";
  text: string;
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: DiffLine[];
}

export interface DiffFile {
  oldPath: string | undefined;
  newPath: string | undefined;
  hunks: DiffHunk[];
}

export interface ParsedDiff {
  files: DiffFile[];
}

/**
 * Parses unified diff text (`git diff` output, a bare `diff -u`, or a lone
 * pasted hunk) into files and hunks. Tolerates missing `diff --git`/`---`/
 * `+++` headers (a lone hunk starts a file with both paths `undefined`),
 * CRLF line endings, and a trailing `\ No newline at end of file` marker.
 * @param text unified diff text
 */
export declare function parseUnifiedDiff(text: string): ParsedDiff;

/**
 * Line-level diff of two strings (a Myers shortest-edit-script over lines,
 * after trimming a common prefix/suffix of unchanged lines). Returns a
 * single `DiffHunk` covering the whole documents (`oldStart`/`newStart` are
 * both `1`). `hunk.lines` reconstructs `before`/`after` exactly:
 * `hunk.lines.filter(l => l.type !== "del").map(l => l.text).join("\n") === after`
 * (and the `"add"`/`before` mirror for `"del"`).
 * @param before
 * @param after
 */
export declare function diffLines(before: string, after: string): DiffHunk;
