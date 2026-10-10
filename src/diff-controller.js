// Headless state for a rendered diff: the diff itself, highlighting, folds,
// review decisions, and navigation. Svelte components take a controller and
// read it as a store (`$diff`); anything else can call it directly.

import {
  applyReview,
  buildRows,
  createDiffSession,
  detectMoves,
  diffStats,
  toUnifiedPatch,
  wordDiff,
} from "./diff.js";
import { patchToState } from "./diff-edits.js";
import { escapeText, overlayRanges } from "./diff-html.js";
import { createTokenizedDocument } from "./tokenized-document.js";

/**
 * @typedef {{ side: "old" | "new", line: number, body: string, author?: string, tone?: "info" | "warning" | "error" | "suggestion" }} Annotation
 *
 * @typedef {import("./diff.js").Row & { note?: Annotation }} ViewRow
 *
 * @typedef {{
 *   language?: import("./languages").LanguageType<string>,
 *   view: "unified" | "split",
 *   context: number,
 *   wordDiff: boolean,
 *   ignoreWhitespace: boolean,
 *   detectMoves: boolean,
 *   annotations: Annotation[],
 *   tabSize: number,
 * }} DiffOptions
 *
 * @typedef {{
 *   row: ViewRow,
 *   index: number,
 *   oldHtml: string,
 *   newHtml: string,
 * }} RenderedRow
 *
 * @typedef {{
 *   reveal: { row: number, align: "start" | "center" | "third" },
 *   viewport: { start: number, end: number, count: number },
 *   navigate: { change: number, index: number, count: number },
 *   review: { decisions: Map<number, "accepted" | "rejected">, text: string },
 *   options: DiffOptions,
 * }} DiffEvents
 */

/** @type {DiffOptions} */
const DEFAULTS = {
  view: "unified",
  context: 3,
  wordDiff: true,
  ignoreWhitespace: false,
  detectMoves: true,
  annotations: [],
  tabSize: 4,
};

const NO_MOVES = { oldMoves: new Map(), newMoves: new Map(), groups: 0 };

/** @param {Partial<DiffOptions>} [initial] */
export function createDiffController(initial = {}) {
  /** @type {DiffOptions} */
  let options = { ...DEFAULTS, ...initial };
  let session = createDiffSession({
    ignoreWhitespace: options.ignoreWhitespace,
  });

  let before = "";
  let after = "";
  let streaming = false;
  /** @type {import("./diff-edits.js").FilePatch | null} */
  let patch = null;

  /** @type {import("./diff.js").DiffState & { beforeText?: string, afterText?: string }} */
  let state = session.update("", "");

  /** @type {ReturnType<typeof createTokenizedDocument> | null} */
  let beforeDoc = null;
  /** @type {ReturnType<typeof createTokenizedDocument> | null} */
  let afterDoc = null;
  let docLanguage = "";

  /** @type {Set<string>} */
  let expanded = new Set();
  /** @type {Map<number, "accepted" | "rejected">} */
  let decisions = new Map();
  let current = -1;

  /** @type {{ rows: ViewRow[], changeStarts: number[] } | null} */
  let layout = null;
  /** @type {{ state: object, moves: ReturnType<typeof detectMoves> } | null} */
  let movesCache = null;
  /** @type {{ state: object, map: Map<string, ReturnType<typeof wordDiff>> }} */
  let wordCache = { state, map: new Map() };
  /** @type {{ state: object, value: { old: number, new: number, gutter: number } } | null} */
  let columnsCache = null;
  // Widest line per side. A streamed `afterLines` grows in place, so only
  // its new lines are measured.
  const widths = {
    /** @type {string[] | null} */ oldLines: null,
    old: 0,
    /** @type {string[] | null} */ newLines: null,
    newCount: 0,
    new: 0,
    tabSize: 0,
  };
  /** @type {{ state: object, value: ReturnType<typeof diffStats> } | null} */
  let statsCache = null;

  let version = 0;
  /** @type {Set<(value: any) => void>} */
  const subscribers = new Set();
  /** @type {{ [K in keyof DiffEvents]?: Set<(detail: DiffEvents[K]) => void> }} */
  const listeners = {};

  function notify() {
    version++;
    for (const fn of subscribers) fn(api);
  }

  /**
   * @template {keyof DiffEvents} K
   * @param {K} type
   * @param {DiffEvents[K]} detail
   */
  function emit(type, detail) {
    for (const fn of listeners[type] ?? []) fn(detail);
  }

  function syncDocs() {
    const language = options.language;
    if (!language) return;
    if (!beforeDoc || !afterDoc || language.name !== docLanguage) {
      beforeDoc = createTokenizedDocument({ language });
      afterDoc = createTokenizedDocument({ language });
      docLanguage = language.name;
    }
    beforeDoc.setCode(state.beforeText ?? before);
    afterDoc.setCode(state.afterText ?? after);
  }

  function recompute() {
    state = patch
      ? patchToState(patch)
      : session.update(before, after, { streaming });
    layout = null;
    syncDocs();
  }

  function resetView() {
    decisions = new Map();
    expanded = new Set();
    current = -1;
  }

  function ensureLayout() {
    if (layout) return layout;
    let moves = NO_MOVES;
    if (options.detectMoves && !state.streaming) {
      if (movesCache?.state !== state) {
        movesCache = { state, moves: detectMoves(state) };
      }
      moves = movesCache.moves;
    }
    const base = buildRows(state, {
      view: options.view,
      context: options.context,
      expanded,
      moves: moves.oldMoves,
      movesNew: moves.newMoves,
    });
    const rows = withNotes(base, options.annotations);
    /** @type {number[]} */
    const changeStarts = [];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]?.first) changeStarts.push(i);
    }
    layout = { rows, changeStarts };
    return layout;
  }

  /**
   * @param {number} oldIndex
   * @param {number} newIndex
   */
  function wordsFor(oldIndex, newIndex) {
    if (wordCache.state !== state) wordCache = { state, map: new Map() };
    const key = `${oldIndex}:${newIndex}`;
    let hit = wordCache.map.get(key);
    if (!hit) {
      hit = wordDiff(
        state.beforeLines[oldIndex] ?? "",
        state.afterLines[newIndex] ?? "",
      );
      wordCache.map.set(key, hit);
    }
    return hit;
  }

  /**
   * Shows a trailing carriage return, and a missing final newline when the
   * two sides disagree about it.
   * @param {string} html
   * @param {number} index
   * @param {string[]} lines
   * @param {boolean} noEol
   */
  function markLineEnd(html, index, lines, noEol) {
    const text = lines[index];
    if (text === undefined) return html;
    let out = html;
    if (text.endsWith("\r")) {
      const at = out.lastIndexOf("\r");
      if (at !== -1) {
        out = `${out.slice(0, at)}<span class="shl-diff-cr" title="Carriage return"></span>${out.slice(at + 1)}`;
      }
    }
    if (
      noEol &&
      index === lines.length - 1 &&
      state.beforeNoEol !== state.afterNoEol
    ) {
      out +=
        '<span class="shl-diff-noeol" title="No newline at end of file"></span>';
    }
    return out;
  }

  /**
   * @param {"old" | "new"} side
   * @param {number[]} indices
   */
  function fetchLines(side, indices) {
    const doc = side === "old" ? beforeDoc : afterDoc;
    const lines = side === "old" ? state.beforeLines : state.afterLines;
    /** @type {Map<number, string>} */
    const out = new Map();
    const sorted = [...new Set(indices)].sort((x, y) => x - y);
    let i = 0;
    while (i < sorted.length) {
      const start = /** @type {number} */ (sorted[i]);
      let end = start + 1;
      // Fetch near-contiguous runs together, but never tokenize a fold.
      while (
        i + 1 < sorted.length &&
        /** @type {number} */ (sorted[i + 1]) - end < 8
      ) {
        i++;
        end = /** @type {number} */ (sorted[i]) + 1;
      }
      if (doc) {
        const html = doc.lineRange(start, end);
        for (let k = 0; k < html.length; k++) {
          out.set(start + k, /** @type {string} */ (html[k]));
        }
      } else {
        for (let k = start; k < end; k++) {
          const text = k === lines.length ? (state.partial ?? "") : lines[k];
          out.set(k, escapeText(text ?? ""));
        }
      }
      i++;
    }
    return out;
  }

  /** @param {1 | -1} dir */
  function jump(dir) {
    const { rows, changeStarts } = ensureLayout();
    if (changeStarts.length === 0) return undefined;
    const at = changeStarts.findIndex((r) => rows[r]?.change === current);
    const index =
      at === -1
        ? dir === 1
          ? 0
          : changeStarts.length - 1
        : (at + dir + changeStarts.length) % changeStarts.length;
    const rowIndex = /** @type {number} */ (changeStarts[index]);
    current = /** @type {number} */ (rows[rowIndex]?.change);
    notify();
    emit("reveal", { row: rowIndex, align: "third" });
    const detail = { change: current, index, count: changeStarts.length };
    emit("navigate", detail);
    return detail;
  }

  function reviewDetail() {
    return { decisions, text: applyReview(state, decisions) };
  }

  const api = {
    /** Store contract: `$diff` re-renders on every change. */
    subscribe(/** @type {(value: any) => void} */ fn) {
      subscribers.add(fn);
      fn(api);
      return () => subscribers.delete(fn);
    },

    /**
     * @template {keyof DiffEvents} K
     * @param {K} type
     * @param {(detail: DiffEvents[K]) => void} fn
     */
    on(type, fn) {
      if (!listeners[type]) listeners[type] = /** @type {any} */ (new Set());
      const set = /** @type {Set<(detail: DiffEvents[K]) => void>} */ (
        listeners[type]
      );
      set.add(fn);
      return () => set.delete(fn);
    },

    /** Bumped on every change, for cheap memo keys. */
    get version() {
      return version;
    },

    /**
     * Diffs two texts. With `streaming`, `after` may still be growing.
     * Replacing (not growing) the texts resets folds and review.
     * @param {string} nextBefore
     * @param {string} nextAfter
     * @param {{ streaming?: boolean }} [opts]
     */
    update(nextBefore, nextAfter, { streaming: nextStreaming = false } = {}) {
      if (
        !patch &&
        nextBefore === before &&
        nextAfter === after &&
        nextStreaming === streaming
      ) {
        return;
      }
      const replaced =
        patch !== null || nextBefore !== before || !nextAfter.startsWith(after);
      before = nextBefore;
      after = nextAfter;
      streaming = nextStreaming;
      patch = null;
      if (replaced) resetView();
      recompute();
      notify();
    },

    /**
     * Shows a parsed file patch instead of two texts.
     * @param {import("./diff-edits.js").FilePatch | null} nextPatch
     */
    setPatch(nextPatch) {
      if (nextPatch === patch) return;
      patch = nextPatch;
      resetView();
      recompute();
      notify();
    },

    /** @param {Partial<DiffOptions>} next */
    setOptions(next) {
      /** @type {Partial<DiffOptions>} */
      const changed = {};
      for (const key of /** @type {(keyof DiffOptions)[]} */ (
        Object.keys(next)
      )) {
        if (next[key] !== undefined && next[key] !== options[key]) {
          /** @type {any} */ (changed)[key] = next[key];
        }
      }
      if (Object.keys(changed).length === 0) return;
      options = { ...options, ...changed };
      if ("ignoreWhitespace" in changed) {
        session = createDiffSession({
          ignoreWhitespace: options.ignoreWhitespace,
        });
        recompute();
      } else {
        layout = null;
        if ("language" in changed) syncDocs();
      }
      notify();
      emit("options", options);
    },

    options() {
      return options;
    },

    state() {
      return state;
    },

    rows() {
      return ensureLayout().rows;
    },

    /**
     * Rows `[start, end)` with highlighted HTML for each side, word diffs
     * overlaid, and line-end markers.
     * @param {number} start
     * @param {number} end
     * @returns {RenderedRow[]}
     */
    renderRows(start, end) {
      const { rows } = ensureLayout();
      const view = options.view;
      const slice = rows.slice(start, end);
      /** @type {number[]} */
      const oldIdx = [];
      /** @type {number[]} */
      const newIdx = [];
      for (const row of slice) {
        if (row.kind === "fold" || row.kind === "pending" || row.note) continue;
        if (
          row.old !== undefined &&
          (row.kind !== "context" || view === "split")
        ) {
          oldIdx.push(row.old);
        }
        if (row.new !== undefined) newIdx.push(row.new);
      }
      const oldHtml = fetchLines("old", oldIdx);
      const newHtml = fetchLines("new", newIdx);
      return slice.map((row, i) => {
        let oHtml = row.old === undefined ? "" : (oldHtml.get(row.old) ?? "");
        let nHtml = row.new === undefined ? "" : (newHtml.get(row.new) ?? "");
        if (options.wordDiff && row.moved === undefined) {
          const pairNew =
            row.kind === "del"
              ? row.pairNew
              : row.kind === "change"
                ? row.new
                : undefined;
          const pairOld =
            row.kind === "add"
              ? row.pairOld
              : row.kind === "change"
                ? row.old
                : undefined;
          if (
            row.old !== undefined &&
            pairNew !== undefined &&
            row.kind !== "add"
          ) {
            oHtml = overlayRanges(
              oHtml,
              wordsFor(row.old, pairNew).old,
              "shl-diff-word",
            );
          }
          if (
            row.new !== undefined &&
            pairOld !== undefined &&
            row.kind !== "del"
          ) {
            nHtml = overlayRanges(
              nHtml,
              wordsFor(pairOld, row.new).new,
              "shl-diff-word",
            );
          }
        }
        if (row.old !== undefined) {
          oHtml = markLineEnd(
            oHtml,
            row.old,
            state.beforeLines,
            state.beforeNoEol,
          );
        }
        if (row.new !== undefined) {
          nHtml = markLineEnd(
            nHtml,
            row.new,
            state.afterLines,
            state.afterNoEol,
          );
        }
        return {
          row,
          index: start + i,
          oldHtml: oHtml,
          newHtml: nHtml,
        };
      });
    },

    stats() {
      if (statsCache?.state !== state) {
        statsCache = { state, value: diffStats(state) };
      }
      return statsCache.value;
    },

    /** Widest line per side in columns, and the gutter width in characters. */
    columns() {
      if (columnsCache?.state !== state) {
        const tab = options.tabSize;
        if (widths.tabSize !== tab) {
          widths.oldLines = null;
          widths.newLines = null;
          widths.tabSize = tab;
        }
        if (widths.oldLines !== state.beforeLines) {
          widths.oldLines = state.beforeLines;
          widths.old = maxColumns(state.beforeLines, tab, 0);
        }
        if (
          widths.newLines !== state.afterLines ||
          state.afterLines.length < widths.newCount
        ) {
          widths.newLines = state.afterLines;
          widths.newCount = 0;
          widths.new = 0;
        }
        widths.new = Math.max(
          widths.new,
          maxColumns(state.afterLines, tab, widths.newCount),
        );
        widths.newCount = state.afterLines.length;
        columnsCache = {
          state,
          value: {
            old: widths.old,
            new: Math.max(widths.new, (state.partial ?? "").length),
            gutter:
              String(
                Math.max(state.beforeLines.length, state.afterLines.length + 1),
              ).length + 2,
          },
        };
      }
      return columnsCache.value;
    },

    /** One mark per change, as fractions of the row count. */
    marks() {
      const { rows, changeStarts } = ensureLayout();
      const total = rows.length;
      if (total === 0) return [];
      return changeStarts.map((rowIndex) => {
        const id = /** @type {number} */ (rows[rowIndex]?.change);
        let last = rowIndex;
        let hasDel = false;
        let hasAdd = false;
        while (last < rows.length && rows[last]?.change === id) {
          const r = /** @type {ViewRow} */ (rows[last]);
          if (r.kind === "del" || (r.kind === "change" && r.old !== undefined))
            hasDel = true;
          if (r.kind === "add" || (r.kind === "change" && r.new !== undefined))
            hasAdd = true;
          last++;
        }
        return {
          id,
          rowIndex,
          top: rowIndex / total,
          height: (last - rowIndex) / total,
          kind: hasDel && hasAdd ? "mod" : hasDel ? "del" : "add",
          decision: decisions.get(id),
        };
      });
    },

    /** The change last navigated to or decided, or -1. */
    current() {
      return current;
    },

    isExpanded(/** @type {string} */ key) {
      return expanded.has(key);
    },

    toggleFold(/** @type {string} */ key) {
      const next = new Set(expanded);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      expanded = next;
      layout = null;
      notify();
    },

    expandAll() {
      expanded = new Set(
        ensureLayout()
          .rows.filter((r) => r.kind === "fold" && !r.fold?.unknown)
          .map((r) => r.key),
      );
      layout = null;
      notify();
    },

    collapseAll() {
      expanded = new Set();
      layout = null;
      notify();
    },

    nextChange() {
      return jump(1);
    },

    prevChange() {
      return jump(-1);
    },

    /**
     * Asks views to scroll a row into view.
     * @param {number} row
     * @param {"start" | "center" | "third"} [align]
     */
    reveal(row, align = "center") {
      emit("reveal", { row, align });
    },

    /**
     * Views report which rows `[start, end)` they show, for minimaps.
     * @param {number} start
     * @param {number} end
     */
    setViewport(start, end) {
      emit("viewport", { start, end, count: ensureLayout().rows.length });
    },

    decisions() {
      return decisions;
    },

    /**
     * @param {number} change
     * @param {"accepted" | "rejected" | undefined} decision
     */
    decide(change, decision) {
      const next = new Map(decisions);
      if (decision) next.set(change, decision);
      else next.delete(change);
      decisions = next;
      current = change;
      notify();
      emit("review", reviewDetail());
    },

    /** @param {"accepted" | "rejected"} decision */
    decideAll(decision) {
      decisions = new Map(
        state.blocks
          .filter((b) => b.type === "change")
          .map((b) => [/** @type {number} */ (b.id), decision]),
      );
      notify();
      emit("review", reviewDetail());
    },

    /** The text with rejected changes reverted. */
    result() {
      return applyReview(state, decisions);
    },

    /** @param {{ oldPath?: string, newPath?: string }} [paths] */
    patch(paths) {
      return toUnifiedPatch(state, { ...paths, context: options.context });
    },
  };

  return api;
}

/** @typedef {ReturnType<typeof createDiffController>} DiffController */

/**
 * @param {import("./diff.js").Row[]} list
 * @param {Annotation[]} notes
 * @returns {ViewRow[]}
 */
function withNotes(list, notes) {
  if (notes.length === 0) return list;
  /** @type {Map<string, Annotation[]>} */
  const byLine = new Map();
  for (const note of notes) {
    const key = `${note.side}:${note.line - 1}`;
    const bucket = byLine.get(key) ?? [];
    bucket.push(note);
    byLine.set(key, bucket);
  }
  /** @type {ViewRow[]} */
  const out = [];
  for (const row of list) {
    out.push(row);
    const hits = [
      ...(row.old === undefined ? [] : (byLine.get(`old:${row.old}`) ?? [])),
      ...(row.new === undefined ? [] : (byLine.get(`new:${row.new}`) ?? [])),
    ];
    hits.forEach((note, i) => {
      out.push({
        key: `${row.key}n${i}`,
        kind: /** @type {any} */ ("note"),
        note,
      });
    });
  }
  return out;
}

/**
 * @param {string[]} lines
 * @param {number} tabSize
 * @param {number} from first line to measure
 */
function maxColumns(lines, tabSize, from) {
  let max = 0;
  for (let i = from; i < lines.length; i++) {
    const line = /** @type {string} */ (lines[i]);
    let cols = line.length;
    if (line.includes("\t")) {
      cols += (line.split("\t").length - 1) * (tabSize - 1);
    }
    if (cols > max) max = cols;
  }
  return max;
}
