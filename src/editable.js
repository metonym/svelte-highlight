/**
 * A highlighted code editor on any element, with no framework. This is the
 * logic behind HighlightEditable: input handling, undo history, painting and
 * caret restore. The element should be a `<code>` with `contenteditable`,
 * inside a `<pre>` (or anything with `white-space: pre`).
 */

import {
  indentSelection,
  replaceSelection,
  shiftLines,
} from "./editable-commands.js";
import { createEditHistory } from "./editable-history.js";
import {
  createLineView,
  lineStartOffset,
  readSelection,
  writeSelection,
} from "./editable-line-dom.js";
import { createEditorPainter, resolveEngine } from "./editable-painter.js";
import { ensureRegistered, registry } from "./registry.js";

export { instanceHighlightStyle } from "./highlight-theme.js";

const TRAILING_NEWLINE = /\n$/;

let instanceCount = 0;

/**
 * @typedef {{
 *   language: import("./languages").LanguageType<string>,
 *   tabSize: number,
 *   historyLimit: number,
 *   readonly: boolean,
 *   engine: import("./editable-painter.js").PaintEngine,
 * }} EditorSettings
 */

/**
 * @typedef {Partial<EditorSettings> & {
 *   language: import("./languages").LanguageType<string>,
 *   code?: string,
 *   instanceId?: string | number,
 *   onChange?: (code: string) => void,
 *   onHistory?: (snapshot: import("./editable-history.js").HistorySnapshot) => void,
 *   onBlur?: (code: string) => void,
 * }} EditorOptions
 */

/**
 * @param {HTMLElement} element
 * @param {EditorOptions} options
 */
export function createEditor(element, options) {
  const doc = /** @type {Document} */ (element.ownerDocument);
  const instanceId = options.instanceId ?? `editor-${++instanceCount}`;
  const { onChange, onHistory, onBlur } = options;
  /** @type {EditorSettings} */
  const settings = {
    language: options.language,
    tabSize: options.tabSize ?? 2,
    historyLimit: options.historyLimit ?? 200,
    readonly: options.readonly ?? false,
    engine: options.engine ?? "dom",
  };

  let code = options.code ?? "";
  let languageName = settings.language.name;
  let engine = resolveEngine(settings.engine);
  ensureRegistered(settings.language);

  // Don't re-highlight during IME composition.
  let composing = false;
  let restoringSelection = false;
  // Set by Escape so the next Tab moves focus instead of indenting.
  let tabTrapReleased = false;
  // WebKit fires historyUndo/historyRedo twice per execCommand; ignore the
  // repeat until the next task.
  let handlingNativeHistory = false;

  const view = createLineView();
  const painter = createEditorPainter({
    editor: () => element,
    view,
    registry,
    highlightPrefix: `hljs-${instanceId}`,
  });
  const history = createEditHistory({ limit: () => settings.historyLimit });

  function getSelectionRange() {
    return readSelection(element, view, doc.getSelection());
  }

  function getCaretOffset() {
    const sel = getSelectionRange();
    return sel ? sel.end : null;
  }

  /**
   * @param {number} start
   * @param {number | null} [end]
   * @param {Node} [root]
   */
  function setSelection(start, end, root = element) {
    writeSelection(element, view, doc.getSelection(), start, end, root);
  }

  function paint() {
    return painter.paint(code, languageName, engine);
  }

  /**
   * Paints, then puts the caret back. When only one line changed, the
   * selection is set inside that line so the rest of the DOM isn't walked.
   * @param {number | null} [start]
   * @param {number | null} [end]
   */
  function renderAt(start, end) {
    const changedIndex = paint();
    if (start == null) return;
    restoringSelection = true;
    if (changedIndex != null) {
      const lineStart = lineStartOffset(view, changedIndex);
      const lineEnd =
        lineStart + /** @type {number} */ (view.lineLengths[changedIndex]);
      /** @param {number | null | undefined} offset */
      const inLine = (offset) =>
        offset == null || (offset >= lineStart && offset <= lineEnd);
      if (start >= lineStart && start <= lineEnd && inLine(end)) {
        setSelection(
          start - lineStart,
          end == null ? end : end - lineStart,
          view.lineEls[changedIndex],
        );
        restoringSelection = false;
        return;
      }
    }
    setSelection(start, end);
    restoringSelection = false;
  }

  function repaintForLanguageChange() {
    painter.reset();
    const caret = doc.activeElement === element ? getCaretOffset() : null;
    if (caret == null) paint();
    else renderAt(caret, caret);
  }

  function syncCaretToHistory() {
    if (!element.contains(doc.activeElement)) return;
    if (restoringSelection || composing || history.isEmpty) return;
    const sel = getSelectionRange();
    if (sel) history.moveCaret(code.length, sel);
  }

  function emitHistory() {
    onHistory?.(history.snapshot());
  }

  /**
   * @param {string} previousCode
   * @param {import("./editable-history.js").SelectionRange} selectionAfter
   * @param {boolean} coalesce
   */
  function pushHistory(previousCode, selectionAfter, coalesce) {
    history.record(previousCode, code, selectionAfter, coalesce);
    emitHistory();
  }

  /** @param {import("./editable-history.js").HistoryMove | null} move */
  function applyHistoryMove(move) {
    if (!move) return;
    code = move.code;
    onChange?.(code);
    emitHistory();
    renderAt(move.selection.start, move.selection.end);
  }

  /**
   * @param {string} value
   * @param {number} start
   * @param {number} end
   * @param {boolean} coalesce
   */
  function commit(value, start, end, coalesce) {
    if (settings.readonly) return;
    const previousCode = code;
    code = value;
    onChange?.(code);
    pushHistory(previousCode, { start, end }, coalesce);
    renderAt(start, end);
  }

  /**
   * Applies a command from editable-commands.js to the current selection.
   * @param {(code: string, sel: import("./editable-history.js").SelectionRange) => { code: string, selection: import("./editable-history.js").SelectionRange } | null} command
   */
  function runCommand(command) {
    const sel = getSelectionRange();
    if (!sel) return;
    const edit = command(code, sel);
    if (edit) {
      commit(edit.code, edit.selection.start, edit.selection.end, false);
    }
  }

  /** @param {string} text */
  function insertText(text) {
    runCommand((value, sel) => replaceSelection(value, sel, text));
  }

  /** @param {boolean} outdent */
  function shiftIndent(outdent) {
    runCommand((value, sel) =>
      shiftLines(value, sel, settings.tabSize, outdent),
    );
  }

  function indentCommand() {
    runCommand((value, sel) => indentSelection(value, sel, settings.tabSize));
  }

  function ensureFocus() {
    if (doc.activeElement === element) return;
    const prior = getSelectionRange();
    element.focus();
    if (prior) setSelection(prior.start, prior.end);
    else setSelection(code.length);
    syncCaretToHistory();
  }

  /**
   * Replaces the whole document as one undo step.
   * @param {string} value
   */
  function setCode(value) {
    if (settings.readonly || value === code) return;
    const previousCode = code;
    code = value;
    onChange?.(code);
    pushHistory(
      previousCode,
      { start: value.length, end: value.length },
      false,
    );
    paint();
  }

  function undo() {
    applyHistoryMove(history.undo(code));
  }

  function redo() {
    applyHistoryMove(history.redo(code));
  }

  /** @param {() => void} action */
  function runNativeHistory(action) {
    if (handlingNativeHistory) return;
    handlingNativeHistory = true;
    action();
    setTimeout(() => {
      handlingNativeHistory = false;
    }, 0);
  }

  /** @param {InputEvent} [event] */
  function onInput(event) {
    if (composing) return;
    // Chromium's execCommand undo/redo skips cancelable beforeinput:
    // re-render from our history instead of recording the mutation.
    if (event?.inputType === "historyUndo") {
      runNativeHistory(undo);
      return;
    }
    if (event?.inputType === "historyRedo") {
      runNativeHistory(redo);
      return;
    }
    const previousCode = code;
    // Not innerText: it forces layout and Firefox can return a stale value
    // after editing a node written via textContent. `white-space: pre`
    // means native inserts use "\n", not <br>.
    code = (element.textContent ?? "").replace(TRAILING_NEWLINE, "");
    const caret = getCaretOffset() ?? code.length;
    onChange?.(code);
    pushHistory(previousCode, { start: caret, end: caret }, true);
    renderAt(caret);
  }

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    const mod = event.metaKey || event.ctrlKey;

    if (event.key === "Escape") {
      tabTrapReleased = true;
      return;
    }
    if (tabTrapReleased) {
      tabTrapReleased = false;
      if (event.key === "Tab") return;
    }

    if (mod && event.key === "z" && !event.shiftKey) {
      event.preventDefault();
      if (!settings.readonly) undo();
      return;
    }
    if (mod && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
      event.preventDefault();
      if (!settings.readonly) redo();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      insertText("\n");
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      if (event.shiftKey) shiftIndent(true);
      else indentCommand();
    }
  }

  /** @param {ClipboardEvent} event */
  function onPaste(event) {
    event.preventDefault();
    insertText(event.clipboardData?.getData("text/plain") ?? "");
  }

  /** @param {DragEvent} event */
  function onDrop(event) {
    event.preventDefault();
    insertText(event.dataTransfer?.getData("text/plain") ?? "");
  }

  // Edit-menu / execCommand undo-redo bypass onKeydown.
  /** @param {InputEvent} event */
  function onBeforeInput(event) {
    if (event.inputType === "historyUndo") {
      event.preventDefault();
      runNativeHistory(undo);
    } else if (event.inputType === "historyRedo") {
      event.preventDefault();
      runNativeHistory(redo);
    }
  }

  function onBlurEvent() {
    tabTrapReleased = false;
    onBlur?.(code);
  }

  // Only listen to document-wide selectionchange while focused.
  function onFocusIn() {
    doc.addEventListener("selectionchange", syncCaretToHistory);
  }

  function onFocusOut() {
    doc.removeEventListener("selectionchange", syncCaretToHistory);
  }

  function onCompositionStart() {
    composing = true;
  }

  function onCompositionEnd() {
    composing = false;
    onInput();
  }

  /** @type {[string, (event: any) => void][]} */
  const listeners = [
    ["input", onInput],
    ["keydown", onKeydown],
    ["beforeinput", onBeforeInput],
    ["paste", onPaste],
    ["drop", onDrop],
    ["mouseup", syncCaretToHistory],
    ["keyup", syncCaretToHistory],
    ["focusin", onFocusIn],
    ["focusout", onFocusOut],
    ["blur", onBlurEvent],
    ["compositionstart", onCompositionStart],
    ["compositionend", onCompositionEnd],
  ];

  paint();
  history.reset(code);
  emitHistory();
  for (const [type, listener] of listeners) {
    element.addEventListener(type, listener);
  }

  return {
    /** Prefix of this editor's `CSS.highlights` names, for `instanceHighlightStyle`. */
    instanceId,

    /**
     * Applies changed settings. A new language or engine repaints.
     * @param {Partial<EditorSettings>} next
     */
    update(next) {
      Object.assign(settings, next);
      ensureRegistered(settings.language);
      const nextEngine = resolveEngine(settings.engine);
      if (settings.language.name === languageName && nextEngine === engine) {
        return;
      }
      if (engine === "css-highlights") painter.clearHighlights();
      languageName = settings.language.name;
      engine = nextEngine;
      repaintForLanguageChange();
    },

    /**
     * Takes code changed outside the editor (e.g. a bound prop). Records an
     * undo step but, unlike `setCode`, ignores `readonly` and doesn't call
     * `onChange`.
     * @param {string} value
     */
    syncCode(value) {
      if (value === code) return;
      const previousCode = code;
      code = value;
      pushHistory(
        previousCode,
        { start: code.length, end: code.length },
        false,
      );
      paint();
    },

    undo,
    redo,

    focus() {
      element.focus();
    },

    selectAll() {
      element.focus();
      setSelection(0, code.length);
    },

    /** @param {string} text */
    insert(text) {
      ensureFocus();
      insertText(text);
    },

    indent() {
      ensureFocus();
      indentCommand();
    },

    outdent() {
      ensureFocus();
      shiftIndent(true);
    },

    setCode,

    clear() {
      setCode("");
    },

    getCode() {
      return code;
    },

    canUndo() {
      return history.canUndo();
    },

    canRedo() {
      return history.canRedo();
    },

    /** The engine in use: `"dom"` when `"css-highlights"` is unsupported. */
    resolvedEngine() {
      return engine;
    },

    /** Removes listeners and this editor's CSS highlights. */
    destroy() {
      for (const [type, listener] of listeners) {
        element.removeEventListener(type, listener);
      }
      doc.removeEventListener("selectionchange", syncCaretToHistory);
      painter.clearHighlights();
    },
  };
}
