const ENTITY_RE = /&amp;|&lt;|&gt;|&quot;|&#x27;/g;
/** @type {Record<string, string>} */
const ENTITY_MAP = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#x27;": "'",
};
const TAG_RE = /<[^>]*>/g;
const REGEX_SOURCE_LIMIT = 256;

/**
 * Strips tag markup, then decodes the five entities `escapeHtml`
 * (`./engine.js`) produces - exact for this engine's rendered HTML, not a
 * general HTML parser. Tags go first: decoding first would turn escaped
 * source text like `Array&lt;string&gt;` back into `<string>`, which the
 * tag pass would then delete.
 * @param {string} html
 * @returns {string}
 */
function toPlainText(html) {
  return html
    .replace(TAG_RE, "")
    .replace(ENTITY_RE, (entity) => ENTITY_MAP[entity] ?? entity);
}

/**
 * @param {string} text
 * @returns {number}
 */
function countLines(text) {
  let count = 1;
  for (let i = text.indexOf("\n"); i !== -1; i = text.indexOf("\n", i + 1)) {
    count += 1;
  }
  return count;
}

/**
 * @typedef {{
 *   kind: "string" | "array" | "tokenized";
 *   text?: string;
 *   ensureLines?: () => unknown;
 *   lineCount(): number;
 *   lineRange(start: number, end: number): string[];
 * }} Adapter
 */

/**
 * @param {import("./search.d.ts").SearchSource} source
 * @returns {Adapter}
 */
function createAdapter(source) {
  if (typeof source === "string") {
    // Split lazily: literal queries scan `text` whole (see `scanText`), and
    // splitting was ~70% of a full rescan's CPU profile in search.bench.ts.
    /** @type {string[] | undefined} */
    let lines;
    let lineCount = -1;
    const ensureLines = () => {
      if (!lines) lines = source.split("\n");
      return lines;
    };
    return {
      kind: "string",
      text: source,
      ensureLines,
      lineCount: () => {
        if (lines) return lines.length;
        if (lineCount < 0) lineCount = countLines(source);
        return lineCount;
      },
      lineRange: (start, end) => {
        const lines = ensureLines();
        // Callers only read the result, so a full range can share `lines`.
        return start === 0 && end >= lines.length
          ? lines
          : lines.slice(start, end);
      },
    };
  }

  if (Array.isArray(source)) {
    return {
      kind: "array",
      lineCount: () => source.length,
      lineRange: (start, end) => source.slice(start, end),
    };
  }

  // A real TokenizedDocument can hand back its plain text directly. Going
  // through lineRange() instead tokenizes every scanned line only to strip
  // the markup again: in search.bench.ts's incremental group, tokenizing
  // was ~95% of the scan's CPU profile.
  const { textRange } = /** @type {{ textRange?: unknown }} */ (source);
  if (typeof textRange === "function") {
    return {
      kind: "tokenized",
      lineCount: () => source.lineCount(),
      lineRange: (start, end) => textRange.call(source, start, end),
    };
  }

  return {
    kind: "tokenized",
    lineCount: () => source.lineCount(),
    lineRange: (start, end) => source.lineRange(start, end).map(toPlainText),
  };
}

/** @param {string} text */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * @param {string} source
 * @param {boolean} wholeWord
 */
function applyWholeWord(source, wholeWord) {
  return wholeWord ? `\\b${source}\\b` : source;
}

/**
 * @param {string} text
 * @param {Required<import("./search.d.ts").SearchOptions>} options
 * @returns {{ pattern: RegExp | null; error: string | undefined }}
 */
function compilePattern(text, { regex, caseSensitive, wholeWord }) {
  const flags = `g${caseSensitive ? "" : "i"}`;

  if (regex) {
    if (text.length > REGEX_SOURCE_LIMIT) {
      return {
        pattern: null,
        error: `Pattern exceeds ${REGEX_SOURCE_LIMIT} characters`,
      };
    }
    try {
      return {
        pattern: new RegExp(applyWholeWord(text, wholeWord), flags),
        error: undefined,
      };
    } catch (err) {
      return {
        pattern: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return {
    pattern: new RegExp(applyWholeWord(escapeRegExp(text), wholeWord), flags),
    error: undefined,
  };
}

/**
 * @param {import("./search.d.ts").SearchOptions & { regex: boolean; caseSensitive: boolean; wholeWord: boolean }} a
 * @param {typeof a} b
 */
function optionsEqual(a, b) {
  return (
    a.regex === b.regex &&
    a.caseSensitive === b.caseSensitive &&
    a.wholeWord === b.wholeWord
  );
}

/**
 * Finds a literal `query`'s matches with one pass of `pattern` over the
 * whole `source` string instead of one per split line, mapping each match
 * back to its line as it goes. Same result as per-line scanning: the
 * escaped literal can't match across a "\n" (one containing "\n" never
 * matches a single line, so it returns nothing), and `\b` sees the "\n"
 * before a line as the same non-word boundary as the line's start.
 *
 * A case-sensitive, non-whole-word query is a plain substring search, so
 * it skips the regex for `indexOf` (non-overlapping, like the `g` regex).
 * @param {string} source
 * @param {string} query
 * @param {RegExp} pattern
 * @param {boolean} exact case-sensitive and not whole-word
 * @returns {import("./search.d.ts").SearchMatch[]}
 */
function scanText(source, query, pattern, exact) {
  /** @type {import("./search.d.ts").SearchMatch[]} */
  const found = [];
  if (query.includes("\n")) return found;
  let line = 0;
  let lineStart = 0;
  let nextBreak = source.indexOf("\n");
  /**
   * @param {number} index
   * @param {number} length
   */
  const record = (index, length) => {
    while (nextBreak !== -1 && nextBreak < index) {
      line += 1;
      lineStart = nextBreak + 1;
      nextBreak = source.indexOf("\n", lineStart);
    }
    const start = index - lineStart;
    found.push({ line, start, end: start + length });
  };
  if (exact) {
    const length = query.length;
    for (
      let index = source.indexOf(query);
      index !== -1;
      index = source.indexOf(query, index + length)
    ) {
      record(index, length);
    }
    return found;
  }
  pattern.lastIndex = 0;
  for (
    let match = pattern.exec(source);
    match !== null;
    match = pattern.exec(source)
  ) {
    record(match.index, match[0].length);
  }
  return found;
}

/**
 * @param {import("./search.d.ts").SearchSource} source
 * @returns {import("./search.d.ts").Search}
 */
export function createSearch(source) {
  let adapter = createAdapter(source);

  /** @type {import("./search.d.ts").SearchMatch[]} */
  let matches = [];
  /** @type {number | undefined} */
  let currentIndex;
  /** @type {string | undefined} */
  let errorMessage;
  let hasQueried = false;
  let lastText = "";
  let lastOptions = { regex: false, caseSensitive: false, wholeWord: false };
  let lastScannedLineCount = 0;

  /** @type {Set<() => void>} */
  const listeners = new Set();

  function notify() {
    for (const listener of listeners) listener();
  }

  /**
   * @param {number} start
   * @param {number} end
   * @param {RegExp} pattern
   * @returns {import("./search.d.ts").SearchMatch[]}
   */
  function scanRange(start, end, pattern) {
    const lines = adapter.lineRange(start, end);
    /** @type {import("./search.d.ts").SearchMatch[]} */
    const found = [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = start + i;
      const text = /** @type {string} */ (lines[i]);
      pattern.lastIndex = 0;
      let match = pattern.exec(text);
      while (match !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        found.push({ line, start: matchStart, end: matchEnd });
        if (match[0].length === 0) pattern.lastIndex += 1;
        match = pattern.exec(text);
      }
    }
    return found;
  }

  /**
   * @param {string} text
   * @param {import("./search.d.ts").SearchOptions} [options]
   */
  function query(text, options = {}) {
    const normalized = {
      regex: !!options.regex,
      caseSensitive: !!options.caseSensitive,
      wholeWord: !!options.wholeWord,
    };

    if (text === "") {
      matches = [];
      currentIndex = undefined;
      errorMessage = undefined;
      lastText = text;
      lastOptions = normalized;
      lastScannedLineCount = adapter.lineCount();
      hasQueried = true;
      notify();
      return;
    }

    const sameQuery =
      hasQueried && text === lastText && optionsEqual(normalized, lastOptions);

    if (sameQuery && adapter.kind === "tokenized") {
      const newLineCount = adapter.lineCount();

      if (newLineCount === lastScannedLineCount) {
        notify();
        return;
      }

      if (newLineCount > lastScannedLineCount) {
        const { pattern, error } = compilePattern(text, normalized);
        if (pattern === null) {
          matches = [];
          currentIndex = undefined;
          errorMessage = error;
          lastScannedLineCount = newLineCount;
          notify();
          return;
        }
        matches = [
          ...matches,
          ...scanRange(lastScannedLineCount, newLineCount, pattern),
        ];
        errorMessage = undefined;
        lastScannedLineCount = newLineCount;
        notify();
        return;
      }

      // Shrink: fall through to a full rescan below.
    }

    const { pattern, error } = compilePattern(text, normalized);
    lastText = text;
    lastOptions = normalized;
    hasQueried = true;
    const scanWhole = adapter.text !== undefined && !normalized.regex;
    // A regex scan splits a string source into lines anyway; splitting
    // first makes lineCount() free instead of a second full pass.
    if (pattern !== null && !scanWhole) adapter.ensureLines?.();
    lastScannedLineCount = adapter.lineCount();

    if (pattern === null) {
      matches = [];
      currentIndex = undefined;
      errorMessage = error;
      notify();
      return;
    }

    errorMessage = undefined;
    matches =
      scanWhole && adapter.text !== undefined
        ? scanText(
            adapter.text,
            text,
            pattern,
            normalized.caseSensitive && !normalized.wholeWord,
          )
        : scanRange(0, lastScannedLineCount, pattern);
    currentIndex = matches.length > 0 ? 0 : undefined;
    notify();
  }

  function count() {
    return matches.length;
  }

  function error() {
    return errorMessage;
  }

  function current() {
    if (currentIndex === undefined) return undefined;
    const match = matches[currentIndex];
    return match === undefined ? undefined : { ...match, index: currentIndex };
  }

  function next() {
    if (matches.length === 0) return undefined;
    currentIndex =
      currentIndex === undefined ? 0 : (currentIndex + 1) % matches.length;
    notify();
    return {
      .../** @type {import("./search.d.ts").SearchMatch} */ (
        matches[currentIndex]
      ),
      index: currentIndex,
    };
  }

  function prev() {
    if (matches.length === 0) return undefined;
    currentIndex =
      currentIndex === undefined
        ? matches.length - 1
        : (currentIndex - 1 + matches.length) % matches.length;
    notify();
    return {
      .../** @type {import("./search.d.ts").SearchMatch} */ (
        matches[currentIndex]
      ),
      index: currentIndex,
    };
  }

  /** @param {import("./search.d.ts").SearchSource} newSource */
  function setSource(newSource) {
    adapter = createAdapter(newSource);
    const wasQueried = hasQueried;
    matches = [];
    currentIndex = undefined;
    errorMessage = undefined;
    lastScannedLineCount = 0;
    hasQueried = false;
    if (wasQueried) {
      query(lastText, lastOptions);
    } else {
      notify();
    }
  }

  /** @param {() => void} callback */
  function onChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }

  return {
    query,
    matches: () => matches,
    count,
    error,
    current,
    next,
    prev,
    setSource,
    onChange,
  };
}

/** @typedef {{ container: Element; baseOffset: number }} LineScope */

/**
 * Returns a resolver for the rendered row of each `line`: `[data-line]`
 * first, then the `line`-th `.line` element (0-indexed), then the whole
 * `<code>` (offsets treated as absolute into its full `textContent`, split
 * on `"\n"`).
 *
 * Each query runs at most once per paint and is then looked up per line.
 * Running all three per matched line made a paint O(matched lines x DOM
 * size): a missing `[data-line]` or the `.line` list scans the whole tree
 * (bench/search.bench.ts, "highlightMatches()"). The `<mark>` fallback
 * only adds `<mark>`s and splits text, so nothing it does between lines
 * changes what these queries return.
 * @param {Element} root
 * @returns {(line: number) => LineScope | undefined}
 */
function createLineScopeResolver(root) {
  /** @type {Map<string, Element> | undefined} */
  let byDataLine;
  /** @type {NodeListOf<Element> | undefined} */
  let lineElements;
  /** @type {{ code: Element; offsets: number[] } | null | undefined} */
  let fallback;

  return (line) => {
    if (!byDataLine) {
      byDataLine = new Map();
      for (const element of root.querySelectorAll("[data-line]")) {
        const value = element.getAttribute("data-line");
        // Keep the first in document order, as querySelector() would.
        if (value !== null && !byDataLine.has(value)) {
          byDataLine.set(value, element);
        }
      }
    }
    const row = byDataLine.get(`${line}`);
    if (row) return { container: row, baseOffset: 0 };

    lineElements ??= root.querySelectorAll(".line");
    const byClass = lineElements[line];
    if (byClass) return { container: byClass, baseOffset: 0 };

    if (fallback === undefined) {
      const code = root.querySelector("code");
      fallback = code && { code, offsets: lineOffsets(code) };
    }
    if (!fallback) return undefined;
    const baseOffset = fallback.offsets[line];
    return baseOffset === undefined
      ? undefined
      : { container: fallback.code, baseOffset };
  };
}

/**
 * Start offset of each `"\n"`-separated line in `code`'s `textContent`.
 * @param {Element} code
 * @returns {number[]}
 */
function lineOffsets(code) {
  const offsets = [];
  let consumed = 0;
  for (const text of (code.textContent ?? "").split("\n")) {
    offsets.push(consumed);
    consumed += text.length + 1;
  }
  return offsets;
}

/**
 * Resolves absolute character offsets into `container`'s text content to
 * (text node, local offset) boundaries in one walk. An offset on the seam
 * between two text nodes lands at the end of the earlier one. Offsets past
 * the end of the text are left out of the result.
 * @param {Node} container
 * @param {number[]} offsets Ascending.
 * @returns {Map<number, { node: Text; offset: number }>}
 */
function resolveTextPositions(container, offsets) {
  /** @type {Map<number, { node: Text; offset: number }>} */
  const positions = new Map();
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let consumed = 0;
  let node = /** @type {Text | null} */ (walker.nextNode());
  for (const offset of offsets) {
    while (node !== null && offset > consumed + node.data.length) {
      consumed += node.data.length;
      node = /** @type {Text | null} */ (walker.nextNode());
    }
    if (node === null) break;
    positions.set(offset, { node, offset: offset - consumed });
  }
  return positions;
}

/**
 * Wraps `node`'s `[localStart, localEnd)` in a `<mark>`, splitting it as
 * needed. When `localStart > 0`, `node` keeps the text before it.
 * @param {Text} node
 * @param {number} localStart
 * @param {number} localEnd
 * @param {boolean} isCurrent
 * @returns {HTMLElement}
 */
function wrapInMark(node, localStart, localEnd, isCurrent) {
  let middle = node;
  if (localEnd < node.data.length) middle.splitText(localEnd);
  if (localStart > 0) middle = middle.splitText(localStart);

  const mark = document.createElement("mark");
  mark.dataset.shlSearch = "";
  if (isCurrent) mark.dataset.shlSearchCurrent = "";
  middle.replaceWith(mark);
  mark.appendChild(middle);
  return mark;
}

/**
 * Wraps a match's text in one `<mark>` per text node it spans, splitting
 * nodes as needed. Re-walks `scope.container` fresh each call, so callers
 * must process matches within a scope in descending `start` order. Only
 * used when the one-pass `wrapSpansInMarks` can't be (see
 * `highlightMatches`).
 * @param {LineScope} scope
 * @param {number} start
 * @param {number} end
 * @param {boolean} isCurrent
 * @returns {HTMLElement[]}
 */
function wrapMatchInMarks(scope, start, end, isCurrent) {
  const globalStart = scope.baseOffset + start;
  const globalEnd = scope.baseOffset + end;

  const walker = document.createTreeWalker(
    scope.container,
    NodeFilter.SHOW_TEXT,
  );
  /** @type {Text[]} */
  const textNodes = [];
  let node = /** @type {Text | null} */ (walker.nextNode());
  while (node !== null) {
    textNodes.push(node);
    node = /** @type {Text | null} */ (walker.nextNode());
  }

  /** @type {HTMLElement[]} */
  const marks = [];
  let consumed = 0;
  for (const textNode of textNodes) {
    const length = textNode.data.length;
    const nodeStart = consumed;
    const nodeEnd = consumed + length;
    consumed = nodeEnd;

    const overlapStart = Math.max(globalStart, nodeStart);
    const overlapEnd = Math.min(globalEnd, nodeEnd);
    if (overlapStart >= overlapEnd) continue;

    marks.push(
      wrapInMark(
        textNode,
        overlapStart - nodeStart,
        overlapEnd - nodeStart,
        isCurrent,
      ),
    );
  }

  return marks;
}

/** @typedef {{ start: number; end: number; isCurrent: boolean }} MarkSpan */

/**
 * Wraps every span in `container` in `<mark>`s with one walk of its text
 * nodes, where `wrapMatchInMarks` re-walks the container per match. Spans
 * are absolute offsets into the container's text, sorted by descending
 * `start`, non-empty, and non-overlapping. Going back to front, a split
 * only ever touches text after every span still to come, and the node a
 * split starts from keeps its own start offset, so the offsets indexed up
 * front stay valid for the rest of the pass.
 * @param {Element} container
 * @param {MarkSpan[]} spans
 * @param {HTMLElement[]} marks Receives the created `<mark>`s.
 */
function wrapSpansInMarks(container, spans, marks) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  /** @type {Text[]} */
  const nodes = [];
  /** @type {number[]} */
  const starts = [];
  let consumed = 0;
  let node = /** @type {Text | null} */ (walker.nextNode());
  while (node !== null) {
    nodes.push(node);
    starts.push(consumed);
    consumed += node.data.length;
    node = /** @type {Text | null} */ (walker.nextNode());
  }

  // Last node that starts before the current span's end.
  let last = nodes.length - 1;
  for (const { start, end, isCurrent } of spans) {
    while (last >= 0 && /** @type {number} */ (starts[last]) >= end) last -= 1;
    let first = last;
    while (
      first >= 0 &&
      /** @type {number} */ (starts[first]) +
        /** @type {Text} */ (nodes[first]).data.length >
        start
    ) {
      first -= 1;
    }
    for (let i = first + 1; i <= last; i += 1) {
      const textNode = /** @type {Text} */ (nodes[i]);
      const nodeStart = /** @type {number} */ (starts[i]);
      const overlapStart = Math.max(start, nodeStart);
      const overlapEnd = Math.min(end, nodeStart + textNode.data.length);
      if (overlapStart >= overlapEnd) continue;
      marks.push(
        wrapInMark(
          textNode,
          overlapStart - nodeStart,
          overlapEnd - nodeStart,
          isCurrent,
        ),
      );
    }
  }
}

/**
 * Whether any of `containers` sits inside another one.
 * @param {Iterable<Element>} containers
 * @param {Element} root
 * @returns {boolean}
 */
function anyNested(containers, root) {
  const set = new Set(containers);
  for (const container of set) {
    for (
      let p = container.parentElement;
      p && p !== root;
      p = p.parentElement
    ) {
      if (set.has(p)) return true;
    }
  }
  return false;
}

/**
 * Paints `matches` into `root` (the currently-rendered rows only): the CSS
 * Custom Highlight API when available, else `<mark data-shl-search>`
 * wrapping. One full paint per call - repaint-on-change is the caller's job.
 *
 * Text positions are resolved with one walk per row container, not one
 * per match: with the `<code>` fallback every line shares one container,
 * and a walk from its first text node per match made a paint O(matches x
 * text nodes) (bench/search.bench.ts, "highlightMatches()").
 * @param {Element} root
 * @param {readonly import("./search.d.ts").SearchMatch[]} matches
 * @param {{ current?: number; name?: string }} [options]
 * @returns {{ dispose(): void }}
 */
export function highlightMatches(
  root,
  matches,
  { current, name = "shl-search" } = {},
) {
  if (typeof document === "undefined") return { dispose() {} };

  /** @type {Map<number, { start: number; end: number; index: number }[]>} */
  const byLine = new Map();
  matches.forEach((match, index) => {
    const list = byLine.get(match.line) ?? [];
    list.push({ start: match.start, end: match.end, index });
    byLine.set(match.line, list);
  });

  const resolveScope = createLineScopeResolver(root);
  /** @type {Map<number, LineScope>} */
  const scopes = new Map();
  for (const line of byLine.keys()) {
    const scope = resolveScope(line);
    if (scope) scopes.set(line, scope);
  }

  if ("highlights" in CSS) {
    const highlight = new Highlight();
    const currentHighlight = new Highlight();
    CSS.highlights.set(name, highlight);
    CSS.highlights.set(`${name}-current`, currentHighlight);

    /** @type {Map<Element, number[]>} */
    const offsetsByContainer = new Map();
    for (const [line, lineMatches] of byLine) {
      const scope = scopes.get(line);
      if (!scope) continue;
      let offsets = offsetsByContainer.get(scope.container);
      if (!offsets) {
        offsets = [];
        offsetsByContainer.set(scope.container, offsets);
      }
      for (const { start, end } of lineMatches) {
        offsets.push(scope.baseOffset + start, scope.baseOffset + end);
      }
    }
    /** @type {Map<Element, Map<number, { node: Text; offset: number }>>} */
    const positionsByContainer = new Map();
    for (const [container, offsets] of offsetsByContainer) {
      offsets.sort((a, b) => a - b);
      positionsByContainer.set(
        container,
        resolveTextPositions(container, offsets),
      );
    }

    // Ranges go in the same order as before: by line, then match order.
    for (const [line, lineMatches] of byLine) {
      const scope = scopes.get(line);
      if (!scope) continue;
      const positions = positionsByContainer.get(scope.container);
      for (const { start, end, index } of lineMatches) {
        const from = positions?.get(scope.baseOffset + start);
        const to = positions?.get(scope.baseOffset + end);
        if (!from || !to) continue;
        const range = new Range();
        range.setStart(from.node, from.offset);
        range.setEnd(to.node, to.offset);
        if (index === current) currentHighlight.add(range);
        else highlight.add(range);
      }
    }

    return {
      dispose() {
        CSS.highlights.delete(name);
        CSS.highlights.delete(`${name}-current`);
      },
    };
  }

  /** @type {HTMLElement[]} */
  const createdMarks = [];

  /** @type {Map<Element, MarkSpan[]>} */
  const spansByContainer = new Map();
  for (const [line, lineMatches] of byLine) {
    const scope = scopes.get(line);
    if (!scope) continue;
    let spans = spansByContainer.get(scope.container);
    if (!spans) {
      spans = [];
      spansByContainer.set(scope.container, spans);
    }
    for (const { start, end, index } of lineMatches) {
      // An empty or inverted span never overlaps any text, so it never
      // split or wrapped anything.
      if (end <= start) continue;
      spans.push({
        start: scope.baseOffset + start,
        end: scope.baseOffset + end,
        isCurrent: index === current,
      });
    }
  }

  // The one-pass wrap gives the same DOM as the per-match wrap only when
  // no two spans cover the same text, so the order they're wrapped in
  // can't matter. Within one container that means disjoint spans, which
  // is what `createSearch` returns. Spans in nested containers (a `<code>`
  // fallback line around rendered `[data-line]` rows) aren't cheap to
  // compare, so those paints, like any with overlapping spans, keep the
  // per-match wrap in its old order.
  let onePass = !anyNested(spansByContainer.keys(), root);
  for (const spans of spansByContainer.values()) {
    if (!onePass) break;
    spans.sort((a, b) => b.start - a.start);
    for (let i = 1; i < spans.length; i += 1) {
      if (
        /** @type {MarkSpan} */ (spans[i]).end >
        /** @type {MarkSpan} */ (spans[i - 1]).start
      ) {
        onePass = false;
        break;
      }
    }
  }

  if (onePass) {
    for (const [container, spans] of spansByContainer) {
      wrapSpansInMarks(container, spans, createdMarks);
    }
  } else {
    for (const [line, lineMatches] of byLine) {
      const scope = scopes.get(line);
      if (!scope) continue;
      const descending = [...lineMatches].sort((a, b) => b.start - a.start);
      for (const { start, end, index } of descending) {
        createdMarks.push(
          ...wrapMatchInMarks(scope, start, end, index === current),
        );
      }
    }
  }

  return {
    dispose() {
      for (const mark of createdMarks) mark.replaceWith(...mark.childNodes);
      root.normalize();
    },
  };
}
