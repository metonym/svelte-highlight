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
 * Inverse of the engine's `escapeHtml` output, not a general HTML parser.
 * Strip tags before decoding, or escaped `&lt;string&gt;` would be deleted as a tag.
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
    // Split lazily: literal queries scan `text` whole (see `scanText`).
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

  // Prefer textRange(): lineRange() would tokenize each line only to strip the markup.
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
 * Scans a literal query over the whole string in one pass, mapping matches
 * back to lines. Equivalent to per-line scanning: a literal can't span "\n",
 * and `\b` treats "\n" like a line start. `exact` uses `indexOf` instead.
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
  /** @type {(index: number, length: number) => void} */
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

      // Shrunk: fall through to a full rescan.
    }

    const { pattern, error } = compilePattern(text, normalized);
    lastText = text;
    lastOptions = normalized;
    hasQueried = true;
    const wholeText = normalized.regex ? undefined : adapter.text;
    // Split before lineCount() so it doesn't need a second full pass.
    if (pattern !== null && wholeText === undefined) adapter.ensureLines?.();
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
      wholeText === undefined
        ? scanRange(0, lastScannedLineCount, pattern)
        : scanText(
            wholeText,
            text,
            pattern,
            normalized.caseSensitive && !normalized.wholeWord,
          );
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
 * Resolves a line's rendered row: `[data-line]`, then the `line`-th `.line`,
 * then the whole `<code>` split on `"\n"`. Each DOM query runs at most once per
 * paint; `<mark>` wrapping between lines can't change their results.
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
        // First in document order wins, as with querySelector().
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
 * Maps absolute text offsets to (text node, offset) in one walk. A seam
 * offset lands at the end of the earlier node; offsets past the end are omitted.
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
 * Re-walks `scope.container` per call, so callers must go in descending
 * `start` order within a scope. Fallback for when `wrapSpansInMarks` can't be used.
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
 * One-walk `<mark>` wrapping. `spans` must be non-empty, non-overlapping, and
 * sorted by descending `start`: going back to front, splits only affect text
 * after every remaining span, so the up-front node offsets stay valid.
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
 * Resolves positions with one walk per container, not per match.
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
      // Empty/inverted spans wrap nothing.
      if (end <= start) continue;
      spans.push({
        start: scope.baseOffset + start,
        end: scope.baseOffset + end,
        isCurrent: index === current,
      });
    }
  }

  // One-pass wrapping matches per-match wrapping only for disjoint spans.
  // Nested containers (`<code>` fallback around `[data-line]` rows) or
  // overlapping spans fall back to per-match wrapping.
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
