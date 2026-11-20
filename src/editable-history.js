/**
 * Undo history for HighlightEditable. Each entry stores only the changed
 * span, so memory grows with edits, not with document size. Framework-free:
 * the caller owns the code, the DOM, and the events.
 */
import { diffText } from "./text-diff.js";

/** Typing within this many ms of the last edit joins one undo step. */
export const COALESCE_MS = 250;

/**
 * @typedef {{ start: number, end: number }} SelectionRange
 * @typedef {{
 *   start: number,
 *   removed: string,
 *   inserted: string,
 *   resultLength: number,
 *   selectionBefore: SelectionRange,
 *   selectionAfter: SelectionRange,
 * }} HistoryEntry
 * @typedef {{ code: string, selection: SelectionRange }} HistoryMove
 * @typedef {{
 *   entries: { size: number }[],
 *   index: number,
 *   canUndo: boolean,
 *   canRedo: boolean,
 * }} HistorySnapshot
 */

/**
 * @param {string} before
 * @param {string} after
 * @param {SelectionRange} selectionBefore
 * @param {SelectionRange} selectionAfter
 * @returns {HistoryEntry}
 */
function makeEntry(before, after, selectionBefore, selectionAfter) {
  const { start, removed, inserted } = diffText(before, after);
  return {
    start,
    removed,
    inserted,
    resultLength: after.length,
    selectionBefore,
    selectionAfter,
  };
}

/**
 * The code an entry transformed *from*, given the code it produced.
 * @param {HistoryEntry} entry
 * @param {string} resultCode
 */
function beforeCodeOf(entry, resultCode) {
  return (
    resultCode.slice(0, entry.start) +
    entry.removed +
    resultCode.slice(entry.start + entry.inserted.length)
  );
}

/**
 * @param {{ limit: () => number, now?: () => number }} options `limit` is
 *   read on each record, so a changed prop applies to the next edit.
 */
export function createEditHistory({ limit, now = Date.now }) {
  /** @type {HistoryEntry[]} */
  let undoStack = [];
  /** @type {HistoryEntry[]} */
  let redoStack = [];
  let lastRecord = 0;

  return {
    /**
     * Starts over with `code` as the only, un-undoable state.
     * @param {string} code
     */
    reset(code) {
      undoStack = [
        {
          start: 0,
          removed: "",
          inserted: code,
          resultLength: code.length,
          selectionBefore: { start: 0, end: 0 },
          selectionAfter: { start: 0, end: 0 },
        },
      ];
      redoStack = [];
      lastRecord = 0;
    },

    /**
     * Records an edit. With `coalesce`, typing within `COALESCE_MS` joins
     * the previous step; Enter, Tab and paste pass `false`.
     * @param {string} previousCode
     * @param {string} newCode
     * @param {SelectionRange} selectionAfter
     * @param {boolean} coalesce
     */
    record(previousCode, newCode, selectionAfter, coalesce) {
      redoStack = [];
      const time = now();
      const top = /** @type {HistoryEntry} */ (undoStack.at(-1));

      if (coalesce && undoStack.length > 1 && time - lastRecord < COALESCE_MS) {
        const burstStart = beforeCodeOf(top, previousCode);
        undoStack[undoStack.length - 1] = makeEntry(
          burstStart,
          newCode,
          top.selectionBefore,
          selectionAfter,
        );
      } else {
        undoStack.push(
          makeEntry(previousCode, newCode, top.selectionAfter, selectionAfter),
        );
        const max = Math.max(1, limit());
        if (undoStack.length > max) {
          undoStack.splice(0, undoStack.length - max);
        }
      }
      lastRecord = coalesce ? time : 0;
    },

    /**
     * Steps back from `code`. Null when there is nothing to undo.
     * @param {string} code
     * @returns {HistoryMove | null}
     */
    undo(code) {
      if (undoStack.length <= 1) return null;
      const entry = /** @type {HistoryEntry} */ (undoStack.pop());
      redoStack.push(entry);
      return {
        code: beforeCodeOf(entry, code),
        selection: entry.selectionBefore,
      };
    },

    /**
     * Steps forward from `code`. Null when there is nothing to redo.
     * @param {string} code
     * @returns {HistoryMove | null}
     */
    redo(code) {
      const entry = redoStack.pop();
      if (!entry) return null;
      undoStack.push(entry);
      return {
        code:
          code.slice(0, entry.start) +
          entry.inserted +
          code.slice(entry.start + entry.removed.length),
        selection: entry.selectionAfter,
      };
    },

    /**
     * Moves the latest step's caret to where the user put it, so undoing
     * the next edit restores it. Skipped when `codeLength` shows the top
     * entry is stale.
     * @param {number} codeLength
     * @param {SelectionRange} selection
     */
    moveCaret(codeLength, selection) {
      const top = undoStack.at(-1);
      if (!top || top.resultLength !== codeLength) return;
      undoStack[undoStack.length - 1] = {
        ...top,
        selectionAfter: { start: selection.start, end: selection.end },
      };
    },

    get isEmpty() {
      return undoStack.length === 0;
    },

    canUndo() {
      return undoStack.length > 1;
    },

    canRedo() {
      return redoStack.length > 0;
    },

    /** @returns {HistorySnapshot} */
    snapshot() {
      return {
        entries: [...undoStack, ...redoStack.slice().reverse()].map(
          (entry) => ({ size: entry.resultLength }),
        ),
        index: undoStack.length - 1,
        canUndo: undoStack.length > 1,
        canRedo: redoStack.length > 0,
      };
    },
  };
}
