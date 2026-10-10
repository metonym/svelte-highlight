// Parses the edit formats LLMs emit (SEARCH/REPLACE blocks, unified diffs,
// str_replace tool calls, apply_patch envelopes) and applies them to a
// source file, falling back to whitespace-insensitive and fuzzy matching.
// Also parses git patches into diff states for patch-only rendering.

import { splitText } from "./diff.js";

const APPLY_PATCH_RE = /^\*\*\* Begin Patch/m;
const SEARCH_MARKER_LINE_RE = /^<{5,9} SEARCH/m;
const SEARCH_MARKER_RE = /^<{5,9} SEARCH/;
const STR_REPLACE_JSON_RE = /"old_str(ing)?"\s*:/;
const STR_REPLACE_TAG_RE = /<old_str>/;
const HUNK_LINE_RE = /^@@/m;
const FILE_HEADERS_RE = /^--- .*\n\+\+\+ /m;
const FENCE_LINE_RE = /^```/m;
const PATH_LINE_RE = /^[\w./-]+\.\w+$/;
const DIVIDER_RE = /^={5,9}\s*$/;
const REPLACE_MARKER_RE = /^>{5,9} REPLACE/;
const PATCH_FILE_RE = /^\*\*\* (Update|Add|Delete) File: (.+)$/;
const B_PREFIX_RE = /^b\//;
const WHOLE_FILE_RE = /^```[^\n]*\n([\s\S]*?)(\n```|$)/m;
const INDENT_RE = /^[ \t]*/;
const AB_PREFIX_RE = /^[ab]\//;
const TAB_SUFFIX_RE = /\t.*$/;
const GIT_HEADER_RE = /^diff --git a\/(.+) b\/(.+)$/;
const HUNK_HEADER_RE = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@ ?(.*)$/;

/**
 * @typedef {{
 *   search: string,
 *   replace: string,
 *   path?: string | undefined,
 *   searchComplete: boolean,
 *   complete: boolean,
 * }} Edit
 *
 * @typedef {"search-replace" | "unified-diff" | "str-replace" | "apply-patch" | "whole-file" | "unknown"} EditFormat
 */

/**
 * @param {string} text
 * @returns {EditFormat}
 */
export function detectEditFormat(text) {
  if (APPLY_PATCH_RE.test(text)) return "apply-patch";
  if (SEARCH_MARKER_LINE_RE.test(text)) return "search-replace";
  if (STR_REPLACE_JSON_RE.test(text) || STR_REPLACE_TAG_RE.test(text)) {
    return "str-replace";
  }
  if (HUNK_LINE_RE.test(text) || FILE_HEADERS_RE.test(text)) {
    return "unified-diff";
  }
  if (FENCE_LINE_RE.test(text)) return "whole-file";
  return "unknown";
}

const FENCE_RE = /^```/;

/**
 * Parses edits, tolerating a truncated final edit (for streamed output).
 * @param {string} text
 * @returns {{ format: EditFormat, edits: Edit[] }}
 */
export function parseEdits(text) {
  const format = detectEditFormat(text);
  switch (format) {
    case "search-replace":
      return { format, edits: parseSearchReplace(text) };
    case "apply-patch":
      return { format, edits: parseApplyPatch(text) };
    case "unified-diff":
      return { format, edits: parseUnifiedEdits(text) };
    case "str-replace":
      return { format, edits: parseStrReplace(text) };
    case "whole-file":
      return { format, edits: parseWholeFile(text) };
    default:
      return { format, edits: [] };
  }
}

/** @param {string[]} lines */
function joinLines(lines) {
  return lines.length === 0 ? "" : `${lines.join("\n")}\n`;
}

/** @param {string} text */
function parseSearchReplace(text) {
  const lines = text.split("\n");
  /** @type {Edit[]} */
  const edits = [];
  /** @type {string | undefined} */
  let path;
  let i = 0;
  while (i < lines.length) {
    const line = /** @type {string} */ (lines[i]);
    if (!SEARCH_MARKER_RE.test(line)) {
      const trimmed = line.trim();
      // A bare path line (Aider style) names the file for the next blocks.
      if (trimmed && !FENCE_RE.test(trimmed) && PATH_LINE_RE.test(trimmed)) {
        path = trimmed;
      }
      i++;
      continue;
    }
    i++;
    /** @type {string[]} */
    const search = [];
    while (
      i < lines.length &&
      !DIVIDER_RE.test(/** @type {string} */ (lines[i]))
    ) {
      search.push(/** @type {string} */ (lines[i]));
      i++;
    }
    if (i >= lines.length) {
      edits.push({
        search: joinLines(search),
        replace: "",
        path,
        searchComplete: false,
        complete: false,
      });
      break;
    }
    i++;
    /** @type {string[]} */
    const replace = [];
    while (
      i < lines.length &&
      !REPLACE_MARKER_RE.test(/** @type {string} */ (lines[i]))
    ) {
      replace.push(/** @type {string} */ (lines[i]));
      i++;
    }
    const complete = i < lines.length;
    // Hold back a partial last line that may still become the closing marker.
    const tail = replace[replace.length - 1];
    const heldBack =
      !complete &&
      tail !== undefined &&
      tail !== "" &&
      ">>>>>>> REPLACE".startsWith(tail);
    if (heldBack) replace.pop();
    // A truncated replace keeps its partial last line without a newline.
    const replaceText =
      complete || heldBack ? joinLines(replace) : replace.join("\n");
    edits.push({
      search: joinLines(search),
      replace: replaceText,
      path,
      searchComplete: true,
      complete,
    });
    i++;
  }
  return edits;
}

/** @param {string} text */
function parseApplyPatch(text) {
  const lines = text.split("\n");
  /** @type {Edit[]} */
  const edits = [];
  /** @type {string | undefined} */
  let path;
  /** @type {string[] | null} */
  let search = null;
  /** @type {string[]} */
  let replace = [];
  let adding = false;
  const flush = (/** @type {boolean} */ complete) => {
    if (search === null) return;
    if (search.length > 0 || replace.length > 0) {
      edits.push({
        search: joinLines(search),
        replace: joinLines(replace),
        path,
        searchComplete: complete,
        complete,
      });
    }
    search = null;
    replace = [];
  };
  let ended = false;
  for (const line of lines) {
    if (line.startsWith("*** End Patch")) {
      ended = true;
      break;
    }
    const file = PATCH_FILE_RE.exec(line);
    if (file) {
      flush(true);
      path = /** @type {string} */ (file[2]).trim();
      adding = file[1] === "Add";
      search = [];
      continue;
    }
    if (line.startsWith("@@")) {
      flush(true);
      search = [];
      continue;
    }
    if (line.startsWith("*** ")) continue;
    if (search === null) continue;
    if (adding) {
      replace.push(line.startsWith("+") ? line.slice(1) : line);
    } else if (line.startsWith("-")) {
      search.push(line.slice(1));
    } else if (line.startsWith("+")) {
      replace.push(line.slice(1));
    } else {
      const ctx = line.startsWith(" ") ? line.slice(1) : line;
      search.push(ctx);
      replace.push(ctx);
    }
  }
  flush(ended);
  return edits;
}

/** @param {string} text */
function parseUnifiedEdits(text) {
  /** @type {Edit[]} */
  const edits = [];
  /** @type {string | undefined} */
  let path;
  /** @type {string[] | null} */
  let search = null;
  /** @type {string[]} */
  let replace = [];
  const flush = (/** @type {boolean} */ complete) => {
    if (search === null) return;
    // Trailing blank context is usually an artifact of the model's output.
    while (
      search.length &&
      search[search.length - 1] === "" &&
      replace[replace.length - 1] === ""
    ) {
      search.pop();
      replace.pop();
    }
    edits.push({
      search: joinLines(search),
      replace: joinLines(replace),
      path,
      searchComplete: complete,
      complete,
    });
    search = null;
    replace = [];
  };
  for (const line of text.split("\n")) {
    if (FENCE_RE.test(line)) continue;
    if (line.startsWith("+++ ")) {
      path = line.slice(4).replace(B_PREFIX_RE, "").trim();
      continue;
    }
    if (
      line.startsWith("--- ") ||
      line.startsWith("diff ") ||
      line.startsWith("index ")
    ) {
      flush(true);
      continue;
    }
    if (line.startsWith("@@")) {
      flush(true);
      search = [];
      continue;
    }
    if (search === null || line.startsWith("\\")) continue;
    if (line.startsWith("-")) search.push(line.slice(1));
    else if (line.startsWith("+")) replace.push(line.slice(1));
    else {
      // Models often drop the leading space on context lines.
      const ctx = line.startsWith(" ") ? line.slice(1) : line;
      search.push(ctx);
      replace.push(ctx);
    }
  }
  flush(true);
  return edits;
}

/** @param {string} text */
function parseStrReplace(text) {
  /** @type {Edit[]} */
  const edits = [];
  /** @param {any} value @param {string | undefined} path */
  const visit = (value, path) => {
    if (Array.isArray(value)) {
      for (const v of value) visit(v, path);
      return;
    }
    if (!value || typeof value !== "object") return;
    const p = value.path ?? value.file_path ?? value.filePath ?? path;
    const oldStr = value.old_str ?? value.old_string ?? value.oldText;
    const newStr = value.new_str ?? value.new_string ?? value.newText;
    if (typeof oldStr === "string" && typeof newStr === "string") {
      edits.push({
        search: oldStr,
        replace: newStr,
        path: p,
        searchComplete: true,
        complete: true,
      });
    }
    for (const key of [
      "edits",
      "input",
      "arguments",
      "parameters",
      "tool_calls",
    ]) {
      if (value[key]) {
        visit(
          typeof value[key] === "string" ? safeJson(value[key]) : value[key],
          p,
        );
      }
    }
  };
  const whole = safeJson(text.trim().replace(/^```\w*\n|```\s*$/g, ""));
  if (whole !== undefined) {
    visit(whole, undefined);
    return edits;
  }
  // One JSON object per line or block, or <old_str>/<new_str> tags.
  for (const block of text.match(/\{[\s\S]*?\}(?=\s*(\n|$))/g) ?? []) {
    visit(safeJson(block), undefined);
  }
  const tagRe =
    /<old_str>\n?([\s\S]*?)<\/old_str>\s*<new_str>\n?([\s\S]*?)<\/new_str>/g;
  for (let m = tagRe.exec(text); m; m = tagRe.exec(text)) {
    edits.push({
      search: m[1] ?? "",
      replace: m[2] ?? "",
      searchComplete: true,
      complete: true,
    });
  }
  return edits;
}

/** @param {string} text */
function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** @param {string} text */
function parseWholeFile(text) {
  const m = WHOLE_FILE_RE.exec(text);
  if (!m) return [];
  return [
    {
      search: "",
      replace: `${m[1]}\n`,
      searchComplete: true,
      complete: m[2] !== "",
      whole: true,
    },
  ];
}

/**
 * @typedef {{
 *   edit: Edit,
 *   status: "applied" | "failed",
 *   strategy?: "exact" | "trailing-whitespace" | "indentation" | "fuzzy" | "whole-file" | "append",
 *   score?: number,
 *   start?: number,
 *   end?: number,
 *   reason?: string,
 * }} EditResult
 */

/**
 * Bigram set of a trimmed line, for Dice similarity.
 * @param {string} line
 */
function bigrams(line) {
  const s = line.trim();
  /** @type {Map<string, number>} */
  const out = new Map();
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    out.set(g, (out.get(g) ?? 0) + 1);
  }
  return out;
}

/**
 * @param {Map<string, number>} x
 * @param {Map<string, number>} y
 * @param {string} xs
 * @param {string} ys
 */
function dice(x, y, xs, ys) {
  if (xs.trim() === ys.trim()) return 1;
  let sizeX = 0;
  let sizeY = 0;
  let both = 0;
  for (const n of x.values()) sizeX += n;
  for (const n of y.values()) sizeY += n;
  if (sizeX + sizeY === 0) return 0;
  for (const [g, n] of x) both += Math.min(n, y.get(g) ?? 0);
  return (2 * both) / (sizeX + sizeY);
}

/**
 * Finds `search` lines in `lines`, first exactly, then ignoring trailing
 * whitespace, then indentation, then by fuzzy line similarity.
 * @param {string[]} lines
 * @param {string[]} search
 * @param {number} from preferred start (edits usually arrive in order)
 * @returns {{ start: number, strategy: "exact" | "trailing-whitespace" | "indentation" | "fuzzy", score: number } | null}
 */
export function locate(lines, search, from = 0) {
  const k = search.length;
  if (k === 0) return null;
  /** @type {Array<[(l: string) => string, "exact" | "trailing-whitespace" | "indentation"]>} */
  const passes = [
    [(l) => l, "exact"],
    [(l) => l.trimEnd(), "trailing-whitespace"],
    [(l) => l.trim(), "indentation"],
  ];
  for (const [norm, strategy] of passes) {
    const target = search.map(norm);
    for (const start of [from, 0]) {
      for (let i = start; i + k <= lines.length; i++) {
        let ok = true;
        for (let j = 0; j < k; j++) {
          if (norm(/** @type {string} */ (lines[i + j])) !== target[j]) {
            ok = false;
            break;
          }
        }
        if (ok) return { start: i, strategy, score: 1 };
      }
    }
  }

  // Fuzzy: best window by mean line similarity.
  const searchGrams = search.map(bigrams);
  /** @type {Map<number, Map<string, number>>} */
  const cache = new Map();
  const gramsAt = (/** @type {number} */ i) => {
    let g = cache.get(i);
    if (!g) {
      g = bigrams(/** @type {string} */ (lines[i]));
      cache.set(i, g);
    }
    return g;
  };
  let best = 0;
  let bestStart = -1;
  for (let i = 0; i + k <= lines.length; i++) {
    // Cheap reject on the first line before scoring the window.
    const first = dice(
      gramsAt(i),
      /** @type {Map<string, number>} */ (searchGrams[0]),
      /** @type {string} */ (lines[i]),
      /** @type {string} */ (search[0]),
    );
    if (first < 0.5 && k > 1) continue;
    let total = first;
    for (let j = 1; j < k; j++) {
      total += dice(
        gramsAt(i + j),
        /** @type {Map<string, number>} */ (searchGrams[j]),
        /** @type {string} */ (lines[i + j]),
        /** @type {string} */ (search[j]),
      );
    }
    const score = total / k;
    if (score > best) {
      best = score;
      bestStart = i;
    }
  }
  if (bestStart >= 0 && best >= 0.8) {
    return { start: bestStart, strategy: "fuzzy", score: best };
  }
  return null;
}

/** @param {string} line */
const indentOf = (line) => INDENT_RE.exec(line)?.[0] ?? "";

/**
 * Shifts `replace` by the indentation difference between what the model
 * wrote and what the file has, so a de-indented edit lands in place.
 * @param {string[]} replace
 * @param {string[]} search
 * @param {string[]} found
 */
function reindent(replace, search, found) {
  const si = search.findIndex((l) => l.trim() !== "");
  if (si < 0) return replace;
  const want = indentOf(/** @type {string} */ (found[si] ?? ""));
  const have = indentOf(/** @type {string} */ (search[si]));
  if (want === have) return replace;
  return replace.map((line) => {
    if (line.trim() === "") return line;
    if (line.startsWith(have)) return want + line.slice(have.length);
    return want + line.trimStart();
  });
}

/**
 * Applies complete edits to `source`. Edits that can't be located, or that
 * overlap an earlier one, are reported as failed and skipped.
 * @param {string} source
 * @param {Edit[]} edits
 * @returns {{ text: string, results: EditResult[] }}
 */
export function applyEdits(source, edits) {
  const { lines, noEol } = splitText(source);
  /** @type {EditResult[]} */
  const results = [];
  /** @type {Array<{ start: number, end: number, lines: string[] }>} */
  const splices = [];
  let cursor = 0;

  for (const edit of edits) {
    if (!edit.complete) continue;
    const replaceLines = splitText(edit.replace).lines;
    if (/** @type {any} */ (edit).whole) {
      return {
        text: edit.replace,
        results: [
          {
            edit,
            status: "applied",
            strategy: "whole-file",
            score: 1,
            start: 0,
            end: lines.length,
          },
        ],
      };
    }
    const searchLines = splitText(edit.search).lines;
    if (searchLines.length === 0) {
      splices.push({
        start: lines.length,
        end: lines.length,
        lines: replaceLines,
      });
      results.push({
        edit,
        status: "applied",
        strategy: "append",
        score: 1,
        start: lines.length,
        end: lines.length,
      });
      continue;
    }
    const hit = locate(lines, searchLines, cursor);
    if (!hit) {
      results.push({ edit, status: "failed", reason: "search text not found" });
      continue;
    }
    const start = hit.start;
    const end = start + searchLines.length;
    if (splices.some((s) => start < s.end && end > s.start)) {
      results.push({
        edit,
        status: "failed",
        reason: "overlaps an earlier edit",
      });
      continue;
    }
    const replaced =
      hit.strategy === "exact" || hit.strategy === "trailing-whitespace"
        ? replaceLines
        : reindent(replaceLines, searchLines, lines.slice(start, end));
    splices.push({ start, end, lines: replaced });
    results.push({
      edit,
      status: "applied",
      strategy: hit.strategy,
      score: hit.score,
      start,
      end,
    });
    cursor = end;
  }

  splices.sort((x, y) => x.start - y.start);
  /** @type {string[]} */
  const out = [];
  let pos = 0;
  for (const s of splices) {
    out.push(...lines.slice(pos, s.start), ...s.lines);
    pos = s.end;
  }
  out.push(...lines.slice(pos));
  const text = out.join("\n");
  return { text: out.length === 0 || noEol ? text : `${text}\n`, results };
}

/**
 * The longest prefix of the edited file that streamed edit output has
 * settled so far. Grows append-only while edits arrive in file order, so a
 * streaming diff session can render it incrementally.
 * @param {string} source
 * @param {string} partialOutput
 * @param {{ done?: boolean }} [options]
 * @returns {{ after: string, format: EditFormat, edits: Edit[], done: boolean }}
 */
export function streamEditPrefix(source, partialOutput, { done = false } = {}) {
  const { format, edits } = parseEdits(partialOutput);
  const { lines } = splitText(source);
  /** @type {string[]} */
  const out = [];
  let pos = 0;
  let tail = "";
  let settled = true;
  for (const edit of edits) {
    if (!edit.searchComplete) {
      settled = false;
      break;
    }
    const searchLines = splitText(edit.search).lines;
    const hit = searchLines.length ? locate(lines, searchLines, pos) : null;
    if (!hit || hit.start < pos) continue;
    out.push(...lines.slice(pos, hit.start));
    if (!edit.complete) {
      // Show the replacement as it streams in, partial last line included.
      const cut = edit.replace.lastIndexOf("\n");
      if (cut >= 0) out.push(...edit.replace.slice(0, cut).split("\n"));
      tail = edit.replace.slice(cut + 1);
      settled = false;
      break;
    }
    const replaced =
      hit.strategy === "exact" || hit.strategy === "trailing-whitespace"
        ? splitText(edit.replace).lines
        : reindent(
            splitText(edit.replace).lines,
            searchLines,
            lines.slice(hit.start, hit.start + searchLines.length),
          );
    out.push(...replaced);
    pos = hit.start + searchLines.length;
  }
  const finished = done && settled;
  if (finished) out.push(...lines.slice(pos));
  let after = out.length ? `${out.join("\n")}\n` : "";
  after += tail;
  return { after, format, edits, done: finished };
}

/**
 * @typedef {{
 *   oldPath: string,
 *   newPath: string,
 *   status: "modified" | "added" | "deleted" | "renamed" | "binary",
 *   hunks: Array<{
 *     oldStart: number, oldLines: number, newStart: number, newLines: number,
 *     section: string,
 *     lines: Array<{ type: " " | "-" | "+", text: string }>,
 *   }>,
 *   additions: number,
 *   deletions: number,
 * }} FilePatch
 */

/**
 * Parses a (possibly multi-file) git or unified patch.
 * @param {string} text
 * @returns {FilePatch[]}
 */
export function parsePatch(text) {
  /** @type {FilePatch[]} */
  const files = [];
  /** @type {FilePatch | null} */
  let file = null;
  /** @type {FilePatch["hunks"][number] | null} */
  let hunk = null;
  const start = (
    /** @type {string} */ oldPath,
    /** @type {string} */ newPath,
  ) => {
    file = {
      oldPath,
      newPath,
      status: "modified",
      hunks: [],
      additions: 0,
      deletions: 0,
    };
    files.push(file);
    hunk = null;
  };
  const strip = (/** @type {string} */ p) =>
    p.trim().replace(AB_PREFIX_RE, "").replace(TAB_SUFFIX_RE, "");

  for (const line of text.split("\n")) {
    const git = GIT_HEADER_RE.exec(line);
    if (git) {
      start(/** @type {string} */ (git[1]), /** @type {string} */ (git[2]));
      continue;
    }
    if (line.startsWith("--- ") && (!file || hunk)) {
      const p = strip(line.slice(4));
      start(p, p);
      continue;
    }
    if (!file) continue;
    /** @type {FilePatch} */
    const f = file;
    if (line.startsWith("--- ")) {
      const p = line.slice(4).trim();
      if (p === "/dev/null") f.status = "added";
      else f.oldPath = strip(p);
      continue;
    }
    if (line.startsWith("+++ ")) {
      const p = line.slice(4).trim();
      if (p === "/dev/null") f.status = "deleted";
      else f.newPath = strip(p);
      continue;
    }
    if (line.startsWith("new file mode")) f.status = "added";
    else if (line.startsWith("deleted file mode")) f.status = "deleted";
    else if (line.startsWith("rename from")) f.status = "renamed";
    else if (line.startsWith("Binary files")) f.status = "binary";
    const h = HUNK_HEADER_RE.exec(line);
    if (h) {
      hunk = {
        oldStart: Number(h[1]),
        oldLines: h[2] === undefined ? 1 : Number(h[2]),
        newStart: Number(h[3]),
        newLines: h[4] === undefined ? 1 : Number(h[4]),
        section: h[5] ?? "",
        lines: [],
      };
      f.hunks.push(hunk);
      continue;
    }
    if (!hunk || line.startsWith("\\")) continue;
    /** @type {FilePatch["hunks"][number]} */
    const hk = hunk;
    const type = line[0];
    if (type === "+" || type === "-" || type === " ") {
      hk.lines.push({ type, text: line.slice(1) });
      if (type === "+") f.additions++;
      if (type === "-") f.deletions++;
    } else if (line === "") {
      hk.lines.push({ type: " ", text: "" });
    }
  }
  // Drop blank context lines past a hunk's declared length (the empty
  // lines between files, or after the patch's final newline).
  for (const f of files) {
    for (const h of f.hunks) {
      let oldCount = h.lines.filter((l) => l.type !== "+").length;
      while (
        oldCount > h.oldLines &&
        h.lines[h.lines.length - 1]?.type === " " &&
        h.lines[h.lines.length - 1]?.text === ""
      ) {
        h.lines.pop();
        oldCount--;
      }
    }
  }
  return files;
}

/**
 * A diff state for a patch alone: the lines between hunks are unknown, so
 * they become blank filler inside folds that can't be expanded, keeping
 * real line numbers.
 * @param {FilePatch} file
 * @returns {import("./diff.js").DiffState & { beforeText: string, afterText: string }}
 */
export function patchToState(file) {
  /** @type {string[]} */
  const beforeLines = [];
  /** @type {string[]} */
  const afterLines = [];
  /** @type {import("./diff.js").Block[]} */
  const blocks = [];
  let id = 0;
  /**
   * @param {"equal" | "change"} type
   * @param {number} aN
   * @param {number} bN
   * @param {boolean} [unknown]
   */
  const push = (type, aN, bN, unknown = false) => {
    const a = beforeLines.length - aN;
    const b = afterLines.length - bN;
    const last = blocks[blocks.length - 1];
    if (
      last &&
      last.type === type &&
      !last.unknown &&
      !unknown &&
      last.aEnd === a &&
      last.bEnd === b
    ) {
      last.aEnd += aN;
      last.bEnd += bN;
      return;
    }
    /** @type {import("./diff.js").Block} */
    const block = { type, a, aEnd: a + aN, b, bEnd: b + bN };
    if (unknown) block.unknown = true;
    if (type === "change") block.id = id++;
    blocks.push(block);
  };

  for (const hunk of file.hunks) {
    const gapA = Math.max(0, hunk.oldStart - 1 - beforeLines.length);
    const gapB = Math.max(0, hunk.newStart - 1 - afterLines.length);
    if (gapA > 0 || gapB > 0) {
      for (let i = 0; i < gapA; i++) beforeLines.push("");
      for (let i = 0; i < gapB; i++) afterLines.push("");
      push("equal", gapA, gapB, true);
      const gap = /** @type {import("./diff.js").Block} */ (
        blocks[blocks.length - 1]
      );
      gap.header =
        `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@ ${hunk.section}`.trim();
    }
    let i = 0;
    const ls = hunk.lines;
    while (i < ls.length) {
      if (ls[i]?.type === " ") {
        let n = 0;
        while (ls[i]?.type === " ") {
          const text = /** @type {{ text: string }} */ (ls[i]).text;
          beforeLines.push(text);
          afterLines.push(text);
          i++;
          n++;
        }
        push("equal", n, n);
        continue;
      }
      let dels = 0;
      let adds = 0;
      while (ls[i] && ls[i]?.type !== " ") {
        const l = /** @type {{ type: string, text: string }} */ (ls[i]);
        if (l.type === "-") {
          beforeLines.push(l.text);
          dels++;
        }
        i++;
      }
      // Re-walk for adds, keeping their order.
      let j = i - 1;
      while (j >= 0 && ls[j]?.type !== " ") j--;
      for (let t = j + 1; t < i; t++) {
        const l = /** @type {{ type: string, text: string }} */ (ls[t]);
        if (l.type === "+") {
          afterLines.push(l.text);
          adds++;
        }
      }
      push("change", dels, adds);
    }
  }

  return {
    beforeLines,
    afterLines,
    partial: null,
    blocks,
    pendingA: beforeLines.length,
    streaming: false,
    beforeNoEol: false,
    afterNoEol: false,
    sealedBlocks: blocks.length,
    version: 0,
    beforeText: joinLines(beforeLines),
    afterText: joinLines(afterLines),
  };
}
