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
 * Decodes the five entities `escapeHtml` (`./engine.js`) produces, then
 * strips tag markup - exact for this engine's rendered HTML, not a general
 * HTML parser.
 * @param {string} html
 * @returns {string}
 */
function toPlainText(html) {
  return html
    .replace(ENTITY_RE, (entity) => ENTITY_MAP[entity] ?? entity)
    .replace(TAG_RE, "");
}

/**
 * @param {import("./search.d.ts").SearchSource} source
 * @returns {{ kind: "string" | "array" | "tokenized"; lineCount(): number; lineRange(start: number, end: number): string[] }}
 */
function createAdapter(source) {
  if (typeof source === "string") {
    const lines = source.split("\n");
    return {
      kind: "string",
      lineCount: () => lines.length,
      lineRange: (start, end) => lines.slice(start, end),
    };
  }

  if (Array.isArray(source)) {
    return {
      kind: "array",
      lineCount: () => source.length,
      lineRange: (start, end) => source.slice(start, end),
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
    lastScannedLineCount = adapter.lineCount();

    if (pattern === null) {
      matches = [];
      currentIndex = undefined;
      errorMessage = error;
      notify();
      return;
    }

    errorMessage = undefined;
    matches = scanRange(0, lastScannedLineCount, pattern);
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

/**
 * Resolves the rendered row for `line`: `[data-line]` first, then the
 * `line`-th `.line` element (0-indexed), then the whole `<code>` (offsets
 * treated as absolute into its full `textContent`, split on `"\n"`).
 * @param {Element} root
 * @param {number} line
 * @param {Map<Element, number[]>} codeLineOffsets
 * @returns {{ container: Element; baseOffset: number } | undefined}
 */
function resolveLineScope(root, line, codeLineOffsets) {
  const byDataLine = root.querySelector(`[data-line="${line}"]`);
  if (byDataLine) return { container: byDataLine, baseOffset: 0 };

  const byClass = root.querySelectorAll(".line")[line];
  if (byClass) return { container: byClass, baseOffset: 0 };

  const code = root.querySelector("code");
  if (!code) return undefined;

  let offsets = codeLineOffsets.get(code);
  if (!offsets) {
    offsets = [];
    let consumed = 0;
    for (const text of (code.textContent ?? "").split("\n")) {
      offsets.push(consumed);
      consumed += text.length + 1;
    }
    codeLineOffsets.set(code, offsets);
  }

  const baseOffset = offsets[line];
  return baseOffset === undefined ? undefined : { container: code, baseOffset };
}

/**
 * Walks `container`'s text nodes to find the (node, local offset) boundary
 * for an absolute character offset into its full text content.
 * @param {Node} container
 * @param {number} offset
 * @returns {{ node: Text; offset: number } | undefined}
 */
function resolveTextPosition(container, offset) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let consumed = 0;
  let node = /** @type {Text | null} */ (walker.nextNode());
  while (node !== null) {
    const length = node.data.length;
    if (offset <= consumed + length) return { node, offset: offset - consumed };
    consumed += length;
    node = /** @type {Text | null} */ (walker.nextNode());
  }
  return undefined;
}

/**
 * @param {{ container: Element; baseOffset: number }} scope
 * @param {number} start
 * @param {number} end
 * @returns {Range | undefined}
 */
function resolveRange(scope, start, end) {
  const from = resolveTextPosition(scope.container, scope.baseOffset + start);
  const to = resolveTextPosition(scope.container, scope.baseOffset + end);
  if (!from || !to) return undefined;
  const range = new Range();
  range.setStart(from.node, from.offset);
  range.setEnd(to.node, to.offset);
  return range;
}

/**
 * Wraps a match's text in one `<mark>` per text node it spans, splitting
 * nodes as needed. Re-walks `scope.container` fresh each call, so callers
 * must process matches within a scope in descending `start` order.
 * @param {{ container: Element; baseOffset: number }} scope
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

    const localStart = overlapStart - nodeStart;
    const localEnd = overlapEnd - nodeStart;

    let middle = textNode;
    if (localEnd < length) middle.splitText(localEnd);
    if (localStart > 0) middle = middle.splitText(localStart);

    const mark = document.createElement("mark");
    mark.dataset.shlSearch = "";
    if (isCurrent) mark.dataset.shlSearchCurrent = "";
    middle.replaceWith(mark);
    mark.appendChild(middle);
    marks.push(mark);
  }

  return marks;
}

/**
 * Paints `matches` into `root` (the currently-rendered rows only): the CSS
 * Custom Highlight API when available, else `<mark data-shl-search>`
 * wrapping. One full paint per call - repaint-on-change is the caller's job.
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

  /** @type {Map<Element, number[]>} */
  const codeLineOffsets = new Map();

  if ("highlights" in CSS) {
    const highlight = new Highlight();
    const currentHighlight = new Highlight();
    CSS.highlights.set(name, highlight);
    CSS.highlights.set(`${name}-current`, currentHighlight);

    for (const [line, lineMatches] of byLine) {
      const scope = resolveLineScope(root, line, codeLineOffsets);
      if (!scope) continue;
      for (const { start, end, index } of lineMatches) {
        const range = resolveRange(scope, start, end);
        if (!range) continue;
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

  for (const [line, lineMatches] of byLine) {
    const scope = resolveLineScope(root, line, codeLineOffsets);
    if (!scope) continue;
    const descending = [...lineMatches].sort((a, b) => b.start - a.start);
    for (const { start, end, index } of descending) {
      createdMarks.push(
        ...wrapMatchInMarks(scope, start, end, index === current),
      );
    }
  }

  return {
    dispose() {
      for (const mark of createdMarks) mark.replaceWith(...mark.childNodes);
      root.normalize();
    },
  };
}
