import { escapeHtml, scopeToCssClass, tokenLines } from "./engine.js";
import { LANGUAGE_ALIASES } from "./languages/aliases.js";
import { loadLanguage } from "./load-language.js";
import { ensureRegistered, registry } from "./registry.js";

/**
 * @typedef {import("./fence.d.ts").ParsedMeta} ParsedMeta
 */

const TOKEN_RE = /(\w+)="([^"]*)"|(\w+)=\{([^}]*)\}|\{([^}]*)\}|(\w+)/g;
const WHITESPACE_RE = /\s+/;
const OPENING_FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;
const CLOSING_FENCE_RE = /^( {0,3})(`+|~+)( *)$/;
const INFO_SPLIT_RE = /^(\S*)\s*([\s\S]*)$/;

/**
 * Expands a comma-separated `1,3-5` range string into individual 1-indexed
 * line numbers.
 * @param {string} ranges
 * @returns {number[]}
 */
function parseRanges(ranges) {
  /** @type {number[]} */
  const lines = [];
  for (const part of ranges.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [startStr, endStr] = trimmed.split("-");
    const start = Number(startStr);
    const end = endStr === undefined ? start : Number(endStr);
    if (!Number.isInteger(start) || !Number.isInteger(end)) continue;
    for (let line = start; line <= end; line += 1) lines.push(line);
  }
  return lines;
}

/**
 * @param {string} meta
 * @returns {ParsedMeta}
 */
export function parseMeta(meta) {
  /** @type {ParsedMeta} */
  const result = { lines: {} };

  for (const match of meta.matchAll(TOKEN_RE)) {
    const [
      ,
      titleKey,
      titleValue,
      stateKey,
      stateRanges,
      bareRanges,
      bareWord,
    ] = match;

    if (titleKey !== undefined) {
      if (titleKey === "title") result.title = titleValue ?? "";
      continue;
    }

    if (stateKey !== undefined) {
      if (stateKey !== "mark" && stateKey !== "ins" && stateKey !== "del")
        continue;
      for (const line of parseRanges(stateRanges ?? ""))
        result.lines[line] = stateKey;
      continue;
    }

    if (bareRanges !== undefined) {
      for (const line of parseRanges(bareRanges)) result.lines[line] = "mark";
      continue;
    }

    if (bareWord === "showLineNumbers") result.showLineNumbers = true;
  }

  return result;
}

/**
 * @param {string} name
 * @returns {string | undefined}
 */
export function resolveLanguageName(name) {
  const word = name.trim().toLowerCase().split(WHITESPACE_RE)[0] ?? "";
  return LANGUAGE_ALIASES[word];
}

/** @param {string} value */
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * @param {import("./engine.d.ts").LineToken} token
 */
function renderToken(token) {
  let html = escapeHtml(token.text);
  for (let i = token.scopes.length - 1; i >= 0; i -= 1) {
    const scope = /** @type {string} */ (token.scopes[i]);
    html = `<span class="${scopeToCssClass(scope, "hljs-")}">${html}</span>`;
  }
  return html;
}

/**
 * @param {{ code: string; lang: string; meta?: string }} options
 * @returns {Promise<string>}
 */
export async function highlightFence({ code, lang, meta }) {
  const resolvedLang = resolveLanguageName(lang) ?? lang;
  const language = await loadLanguage(
    /** @type {import("./languages").LanguageName} */ (resolvedLang),
  );
  ensureRegistered(language);
  const { events } = registry.highlight(code, { language: resolvedLang });
  const parsedMeta = meta === undefined ? undefined : parseMeta(meta);

  const lines = tokenLines(events)
    .map((tokens, index) => {
      const state = parsedMeta?.lines[index + 1];
      const stateAttr = state ? ` data-line-state="${state}"` : "";
      return `<span class="line"${stateAttr}>${tokens.map(renderToken).join("")}</span>`;
    })
    .join("\n");

  const titleAttr =
    parsedMeta?.title === undefined
      ? ""
      : ` data-title="${escapeAttribute(parsedMeta.title)}"`;
  const showLineNumbersAttr = parsedMeta?.showLineNumbers
    ? ' data-show-line-numbers="true"'
    : "";

  return (
    `<pre class="hljs" data-language="${escapeAttribute(resolvedLang)}"${titleAttr}${showLineNumbersAttr}>` +
    `<code class="hljs">${lines}</code></pre>`
  );
}

/**
 * Whether the line spanning `[lineStart, lineEnd)` of `text` can be a fence
 * line at all: up to 3 spaces, then a backtick or tilde. A char-code check,
 * so the (overwhelmingly common) prose or code line skips both the line
 * slice and the fence regexes below - see bench/fence-splitter.bench.ts.
 * @param {string} text
 * @param {number} lineStart
 * @param {number} lineEnd
 * @returns {boolean}
 */
function mayBeFence(text, lineStart, lineEnd) {
  const maxIndent = Math.min(lineStart + 3, lineEnd);
  let p = lineStart;
  while (p < maxIndent && text.charCodeAt(p) === 32 /* " " */) p += 1;
  const code = text.charCodeAt(p);
  return code === 96 /* "`" */ || code === 126 /* "~" */;
}

/**
 * @param {string} line
 * @returns {{ indent: number; char: "`" | "~"; len: number; info: string } | null}
 */
function matchOpeningFence(line) {
  const match = OPENING_FENCE_RE.exec(line);
  if (match === null) return null;
  const indent = /** @type {string} */ (match[1]).length;
  const run = /** @type {string} */ (match[2]);
  const char = /** @type {"`" | "~"} */ (run[0]);
  const rest = /** @type {string} */ (match[3]);
  if (char === "`" && rest.includes("`")) return null;
  return { indent, char, len: run.length, info: rest.trim() };
}

/**
 * @param {string} line
 * @param {"`" | "~"} char
 * @param {number} minLen
 * @returns {boolean}
 */
function matchClosingFence(line, char, minLen) {
  const match = CLOSING_FENCE_RE.exec(line);
  if (match === null) return false;
  const run = /** @type {string} */ (match[2]);
  return run[0] === char && run.length >= minLen;
}

/**
 * The line spanning `[lineStart, lineEnd)` of `text`, minus up to `indent`
 * leading spaces.
 * @param {string} text
 * @param {number} lineStart
 * @param {number} lineEnd
 * @param {number} indent
 * @returns {string}
 */
function stripIndent(text, lineStart, lineEnd, indent) {
  const maxStrip = Math.min(lineStart + indent, lineEnd);
  let p = lineStart;
  while (p < maxStrip && text.charCodeAt(p) === 32 /* " " */) p += 1;
  return text.slice(p, lineEnd);
}

/**
 * @typedef {import("./fence.d.ts").MarkdownSegment} MarkdownSegment
 * @typedef {import("./fence.d.ts").FenceSegment} FenceSegment
 */

/**
 * An open fence being scanned. `code` holds its newline-terminated content
 * lines only, already joined, so a resumed scan extends it instead of
 * re-joining every line.
 * @typedef {{ char: "`" | "~"; len: number; indent: number; info: string; start: number; code: string; lineCount: number }} FenceContext
 */

/**
 * Where a scan stopped: `pos` is the start of the trailing line that wasn't
 * newline-terminated yet (or the end of the text), and `proseStart`/`fence`
 * describe the segment that line belongs to. Everything before `pos` is
 * final - a newline-terminated line never changes on append - so `append`
 * resumes from here instead of rescanning the whole last segment.
 * @typedef {{ pos: number; proseStart: number; fence: FenceContext | null }} ScanState
 */

/**
 * A copy of `slice` that owns only its own characters. A slice of the
 * splitter's buffer is a substring that keeps the whole buffer alive - and
 * since `append` grows a new buffer every chunk, each closed segment would
 * pin its own full copy of the text as it stood when the segment closed
 * (bench/markdown-stream.bench.ts --alloc: a finished 51 KB stream kept
 * 1.26 MB alive, 865 KB with copies). `structuredClone` copies in both V8 and
 * JSC at memcpy speed; rope tricks like `` ` ${s}`.slice(1) `` don't, since
 * JSC slices a rope's fiber without flattening it.
 * @param {string} slice
 * @returns {string}
 */
function ownCopy(slice) {
  return structuredClone(slice);
}

/**
 * @param {number} offset
 * @returns {ScanState}
 */
function scanStateAt(offset) {
  return { pos: offset, proseStart: offset, fence: null };
}

/**
 * @param {FenceContext} ctx
 * @param {number} id
 * @param {number} end
 * @param {boolean} open
 * @param {string | undefined} partial Trailing content line not yet
 *   terminated by a newline, if any.
 * @returns {FenceSegment}
 */
function buildFenceSegment(ctx, id, end, open, partial) {
  const infoMatch = /** @type {RegExpExecArray} */ (
    INFO_SPLIT_RE.exec(ctx.info)
  );
  const meta = /** @type {string} */ (infoMatch[2]);
  return {
    id,
    kind: "fence",
    lang: resolveLanguageName(ctx.info),
    info: ctx.info,
    meta: parseMeta(meta),
    code:
      partial === undefined
        ? open
          ? ctx.code
          : // Final, so copied (see `ownCopy`): a one-line body is a slice
            // of the buffer, a longer one a rope of slices.
            ownCopy(ctx.code)
        : ctx.lineCount === 0
          ? partial
          : `${ctx.code}\n${partial}`,
    open,
    start: ctx.start,
    end,
  };
}

/**
 * Parses `text` from `state.pos` onward. A fresh `scanStateAt(offset)`
 * treats `offset` as the start of a document (always begins in prose mode -
 * valid since a segment boundary never occurs mid-fence, only at a definite
 * open/close/EOF point); a state returned by an earlier call resumes that
 * scan where it stopped.
 * @param {string} text
 * @param {ScanState} state
 * @param {number} startId
 * @returns {{ segments: MarkdownSegment[]; nextId: number; state: ScanState }}
 */
function computeSegments(text, state, startId) {
  /** @type {MarkdownSegment[]} */
  const segments = [];
  let id = startId;
  const n = text.length;
  let i = state.pos;
  let proseStart = state.proseStart;
  // Copied, since the content lines below extend it in place.
  /** @type {FenceContext | null} */
  let fenceCtx = state.fence === null ? null : { ...state.fence };
  // Start of the trailing line not yet terminated by a newline, if any.
  let resumePos = n;
  /** @type {string | undefined} */
  let partial;

  while (i < n) {
    const lineStart = i;
    const nlIndex = text.indexOf("\n", i);
    const hasNewline = nlIndex !== -1;
    const lineEnd = hasNewline ? nlIndex : n;
    const lineEndIncl = hasNewline ? nlIndex + 1 : n;
    if (!hasNewline) resumePos = lineStart;

    if (fenceCtx === null) {
      const open = mayBeFence(text, lineStart, lineEnd)
        ? matchOpeningFence(text.slice(lineStart, lineEnd))
        : null;
      if (open !== null) {
        if (!hasNewline) {
          // Opening line not yet terminated by a newline: stays prose until
          // it is, so a half-received "```ts" never flickers into a fence.
          break;
        }
        if (lineStart > proseStart) {
          segments.push({
            id: id++,
            kind: "text",
            // Closed for good, so it gets its own copy (see `ownCopy`). The
            // open tail below stays a cheap slice: it is rebuilt on every
            // append and only ever pins the current buffer.
            text: ownCopy(text.slice(proseStart, lineStart)),
            start: proseStart,
            end: lineStart,
          });
        }
        fenceCtx = {
          char: open.char,
          len: open.len,
          indent: open.indent,
          // Copied once (see `ownCopy`), so the info, meta and title of
          // every segment built from this fence don't pin the buffer.
          info: ownCopy(open.info),
          start: lineStart,
          code: "",
          lineCount: 0,
        };
      }
      i = lineEndIncl;
      continue;
    }

    if (
      hasNewline &&
      mayBeFence(text, lineStart, lineEnd) &&
      matchClosingFence(
        text.slice(lineStart, lineEnd),
        fenceCtx.char,
        fenceCtx.len,
      )
    ) {
      segments.push(
        buildFenceSegment(fenceCtx, id++, lineEndIncl, false, undefined),
      );
      fenceCtx = null;
      proseStart = lineEndIncl;
      i = lineEndIncl;
      continue;
    }
    // A same-line-terminated closer requires a newline (like an opener, a
    // still-unterminated closer-looking line might grow into content or a
    // longer/shorter run with the next chunk) - anything else is content.
    const content = stripIndent(text, lineStart, lineEnd, fenceCtx.indent);
    if (!hasNewline) {
      partial = content;
      break;
    }
    fenceCtx.code =
      fenceCtx.lineCount === 0 ? content : `${fenceCtx.code}\n${content}`;
    fenceCtx.lineCount += 1;
    i = lineEndIncl;
  }

  if (fenceCtx !== null) {
    segments.push(buildFenceSegment(fenceCtx, id++, n, true, partial));
  } else if (proseStart < n) {
    segments.push({
      id: id++,
      kind: "text",
      text: text.slice(proseStart, n),
      start: proseStart,
      end: n,
    });
  }

  return {
    segments,
    nextId: id,
    state: { pos: resumePos, proseStart, fence: fenceCtx },
  };
}

/**
 * @returns {import("./fence.d.ts").FenceSplitter}
 */
export function createFenceSplitter() {
  let text = "";
  /** @type {MarkdownSegment[]} */
  let segments = [];
  let nextId = 1;
  /** @type {ScanState} */
  let scanState = scanStateAt(0);

  return {
    append(chunk) {
      if (chunk === "") return;
      text += chunk;

      // The segment `scanState` stopped in is the last one - unless the
      // text ended right after a closing fence line, in which case the scan
      // starts a brand-new segment and every existing one is final.
      const last = segments[segments.length - 1];
      const tailStart =
        scanState.fence === null ? scanState.proseStart : scanState.fence.start;
      const continuesLast = last !== undefined && last.start === tailStart;
      // Skipping an id when not continuing keeps ids identical to a rescan
      // from `last.start`, which re-emits `last` and discards its new id.
      const result = computeSegments(
        text,
        scanState,
        last !== undefined && !continuesLast ? nextId + 1 : nextId,
      );
      nextId = result.nextId;
      scanState = result.state;

      if (result.segments.length > 0 && continuesLast) {
        result.segments[0] = {
          .../** @type {MarkdownSegment} */ (result.segments[0]),
          id: last.id,
        };
      }

      segments = continuesLast
        ? [...segments.slice(0, -1), ...result.segments]
        : [...segments, ...result.segments];
    },

    set(newText) {
      if (newText === text) return;
      const oldText = text;
      const minLen = Math.min(oldText.length, newText.length);
      let prefixLen = 0;
      while (prefixLen < minLen && oldText[prefixLen] === newText[prefixLen])
        prefixLen += 1;

      let m = -1;
      for (let i = 0; i < segments.length; i += 1) {
        const segment = /** @type {MarkdownSegment} */ (segments[i]);
        if (segment.start <= prefixLen) m = i;
        else break;
      }

      const kept = m < 1 ? [] : segments.slice(0, m);
      const reuseCandidate = m === -1 ? undefined : segments[m];
      const rebuildFrom =
        reuseCandidate === undefined ? 0 : reuseCandidate.start;

      text = newText;
      const result = computeSegments(text, scanStateAt(rebuildFrom), nextId);
      nextId = result.nextId;
      scanState = result.state;

      const first = result.segments[0];
      if (
        first !== undefined &&
        reuseCandidate !== undefined &&
        first.kind === reuseCandidate.kind &&
        (first.kind !== "fence" ||
          first.info === /** @type {FenceSegment} */ (reuseCandidate).info)
      ) {
        result.segments[0] = { ...first, id: reuseCandidate.id };
      }

      segments = [...kept, ...result.segments];
    },

    segments() {
      return segments;
    },

    text() {
      return text;
    },

    reset() {
      text = "";
      segments = [];
      nextId = 1;
      scanState = scanStateAt(0);
    },
  };
}
