/**
 * Zero-dependency unified-diff parsing and line-level diffing. No Svelte
 * import; pure JS, safe to use headlessly.
 * @typedef {import("./diff.d.ts").DiffLine} DiffLine
 * @typedef {import("./diff.d.ts").DiffHunk} DiffHunk
 * @typedef {import("./diff.d.ts").DiffFile} DiffFile
 * @typedef {import("./diff.d.ts").ParsedDiff} ParsedDiff
 */

const GIT_HEADER_RE = /^diff --git a\/(.+) b\/(.+)$/;
const HUNK_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
const LINE_SPLIT_RE = /\r\n|\n/;
const TRAILING_CR_RE = /\r$/;
const NO_NEWLINE_MARKER = "\\ No newline at end of file";

/**
 * @param {string} text
 * @returns {DiffLine}
 */
function ctxLine(text) {
  return { type: "ctx", text };
}

/**
 * @param {string} raw text after "--- " or "+++ "
 * @param {string} gitPrefix "a/" or "b/"
 * @param {boolean} stripGitPrefix
 * @returns {string | undefined}
 */
function parsePath(raw, gitPrefix, stripGitPrefix) {
  // Plain `diff -u` output (unlike `git diff`) may append a tab-separated
  // timestamp after the path.
  const trimmed = (raw.split("\t")[0] ?? "").trim();
  if (trimmed === "/dev/null") return undefined;
  if (stripGitPrefix && trimmed.startsWith(gitPrefix)) {
    return trimmed.slice(gitPrefix.length);
  }
  return trimmed;
}

/**
 * Parses unified diff text into files and hunks.
 * @param {string} text
 * @returns {ParsedDiff}
 */
export function parseUnifiedDiff(text) {
  const rawLines = text
    .split(LINE_SPLIT_RE)
    .map((line) => line.replace(TRAILING_CR_RE, ""));
  // A trailing newline in `text` splits to a final "" that is not itself a
  // line (just the terminator) -- drop it so it isn't mistaken for a blank
  // context line with no leading space.
  if (rawLines.length > 0 && rawLines[rawLines.length - 1] === "") {
    rawLines.pop();
  }

  /** @type {DiffFile[]} */
  const files = [];
  let file = /** @type {DiffFile | null} */ (null);
  let hunk = /** @type {DiffHunk | null} */ (null);
  let currentHasGitHeader = false;

  const startFile = () => {
    file = { oldPath: undefined, newPath: undefined, hunks: [] };
    files.push(file);
    hunk = null;
    currentHasGitHeader = false;
  };

  for (const rawLine of rawLines) {
    const gitMatch = GIT_HEADER_RE.exec(rawLine);
    if (gitMatch) {
      startFile();
      currentHasGitHeader = true;
      // file was just assigned by startFile().
      const f = /** @type {DiffFile} */ (file);
      f.oldPath = gitMatch[1];
      f.newPath = gitMatch[2];
      continue;
    }

    if (rawLine.startsWith("--- ")) {
      if (!file || file.hunks.length > 0) startFile();
      const f = /** @type {DiffFile} */ (file);
      f.oldPath = parsePath(rawLine.slice(4), "a/", currentHasGitHeader);
      continue;
    }

    if (rawLine.startsWith("+++ ")) {
      if (!file) startFile();
      const f = /** @type {DiffFile} */ (file);
      f.newPath = parsePath(rawLine.slice(4), "b/", currentHasGitHeader);
      continue;
    }

    const hunkMatch = HUNK_RE.exec(rawLine);
    if (hunkMatch) {
      if (!file) startFile();
      hunk = {
        oldStart: Number(hunkMatch[1]),
        oldLines: hunkMatch[2] === undefined ? 1 : Number(hunkMatch[2]),
        newStart: Number(hunkMatch[3]),
        newLines: hunkMatch[4] === undefined ? 1 : Number(hunkMatch[4]),
        header: rawLine.trim(),
        lines: [],
      };
      /** @type {DiffFile} */ (file).hunks.push(hunk);
      continue;
    }

    if (!hunk) {
      // Git metadata (index/mode/similarity/rename/binary) or anything else
      // outside a hunk: not represented in the parsed shape, skip.
      continue;
    }

    if (rawLine === NO_NEWLINE_MARKER) continue;
    if (rawLine.startsWith("+")) {
      hunk.lines.push({ type: "add", text: rawLine.slice(1) });
    } else if (rawLine.startsWith("-")) {
      hunk.lines.push({ type: "del", text: rawLine.slice(1) });
    } else if (rawLine.startsWith(" ")) {
      hunk.lines.push({ type: "ctx", text: rawLine.slice(1) });
    } else if (rawLine === "") {
      hunk.lines.push({ type: "ctx", text: "" });
    }
  }

  return { files };
}

/**
 * Myers shortest-edit-script trace (see "An O(ND) Difference Algorithm and
 * Its Variations"). `trace[d]` is the frontier state at the start of depth
 * `d`, so backtracking from the returned trace reconstructs the edit path.
 * @param {string[]} a
 * @param {string[]} b
 * @returns {Map<number, number>[]}
 */
function buildTrace(a, b) {
  const n = a.length;
  const m = b.length;
  const max = n + m;
  const v = new Map([[1, 0]]);
  /** @type {Map<number, number>[]} */
  const trace = [];

  for (let d = 0; d <= max; d++) {
    trace.push(new Map(v));
    for (let k = -d; k <= d; k += 2) {
      let x;
      if (k === -d || (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0))) {
        x = v.get(k + 1) ?? 0;
      } else {
        x = (v.get(k - 1) ?? 0) + 1;
      }
      let y = x - k;
      while (x < n && y < m && a[x] === b[y]) {
        x++;
        y++;
      }
      v.set(k, x);
      if (x >= n && y >= m) return trace;
    }
  }
  return trace;
}

/**
 * @param {string[]} a
 * @param {string[]} b
 * @param {Map<number, number>[]} trace
 * @returns {DiffLine[]}
 */
function backtrack(a, b, trace) {
  let x = a.length;
  let y = b.length;
  /** @type {DiffLine[]} */
  const edits = [];

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = /** @type {Map<number, number>} */ (trace[d]);
    const k = x - y;
    const prevK =
      k === -d || (k !== d && (v.get(k - 1) ?? 0) < (v.get(k + 1) ?? 0))
        ? k + 1
        : k - 1;
    const prevX = v.get(prevK) ?? 0;
    const prevY = prevX - prevK;

    while (x > prevX && y > prevY) {
      edits.push({ type: "ctx", text: /** @type {string} */ (a[x - 1]) });
      x--;
      y--;
    }
    if (d > 0) {
      if (x === prevX) {
        edits.push({ type: "add", text: /** @type {string} */ (b[y - 1]) });
      } else {
        edits.push({ type: "del", text: /** @type {string} */ (a[x - 1]) });
      }
    }
    x = prevX;
    y = prevY;
  }

  return edits.reverse();
}

/**
 * @param {string[]} a
 * @param {string[]} b
 * @returns {DiffLine[]}
 */
function myersDiff(a, b) {
  return backtrack(a, b, buildTrace(a, b));
}

/**
 * Line-level diff of two strings, trimming a common prefix/suffix of
 * unchanged lines before running Myers on the (usually much smaller)
 * differing middle.
 * @param {string} before
 * @param {string} after
 * @returns {DiffHunk}
 */
export function diffLines(before, after) {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");

  /** @type {DiffLine[]} */
  let lines;
  if (before === after) {
    lines = beforeLines.map(ctxLine);
  } else {
    let prefix = 0;
    const maxPrefix = Math.min(beforeLines.length, afterLines.length);
    while (prefix < maxPrefix && beforeLines[prefix] === afterLines[prefix]) {
      prefix++;
    }

    let suffix = 0;
    const maxSuffix = maxPrefix - prefix;
    while (
      suffix < maxSuffix &&
      beforeLines[beforeLines.length - 1 - suffix] ===
        afterLines[afterLines.length - 1 - suffix]
    ) {
      suffix++;
    }

    const middleBefore = beforeLines.slice(prefix, beforeLines.length - suffix);
    const middleAfter = afterLines.slice(prefix, afterLines.length - suffix);

    lines = [
      ...beforeLines.slice(0, prefix).map(ctxLine),
      ...myersDiff(middleBefore, middleAfter),
      ...beforeLines.slice(beforeLines.length - suffix).map(ctxLine),
    ];
  }

  const oldLines = beforeLines.length;
  const newLines = afterLines.length;

  return {
    oldStart: 1,
    newStart: 1,
    oldLines,
    newLines,
    header: `@@ -1,${oldLines} +1,${newLines} @@`,
    lines,
  };
}
