<script context="module">
  let instanceCount = 0;
  function nextInstanceId() {
    return ++instanceCount;
  }
</script>

<script>
  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {string} */
  export let code = "";

  /** @type {number} Number of spaces inserted by the Tab key. */
  export let tabSize = 2;

  /** @type {number} Maximum number of undo snapshots retained. */
  export let historyLimit = 200;

  /**
   * Keeps highlighting, caret placement, and selection active while
   * blocking edits (typing, paste, drag-and-drop, Tab/Shift+Tab indent).
   * @type {boolean}
   */
  export let readonly = false;

  /**
   * Rendering engine. `"css-highlights"` (experimental) paints tokens via the
   * CSS Custom Highlight API, falling back to `"dom"` where unsupported.
   * @type {"dom" | "css-highlights"}
   */
  export let engine = "dom";

  /**
   * Theme CSS or `ThemePalette` for `::highlight()` rules (`"css-highlights"`
   * only). Colors only.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let theme = undefined;

  import { createEventDispatcher, onMount } from "svelte";
  import {
    indentSelection,
    replaceSelection,
    shiftLines,
  } from "./editable-commands.js";
  import { createEditHistory } from "./editable-history.js";
  import {
    createLineView,
    lineStartOffset as lineStartIn,
    readSelection,
    writeSelection,
  } from "./editable-line-dom.js";
  import {
    createEditorPainter,
    supportsCssHighlights,
  } from "./editable-painter.js";
  import { instanceHighlightStyle } from "./highlight-theme.js";
  import { ensureRegistered, registry } from "./registry.js";

  const dispatch = createEventDispatcher();
  const TRAILING_NEWLINE = /\n$/;
  const instanceId = nextInstanceId();

  /** @type {HTMLElement} */
  let editor;

  // Don't re-highlight during IME composition.
  let composing = false;
  let mounted = false;
  let restoringSelection = false;

  // Set by Escape so the next Tab moves focus instead of indenting.
  let tabTrapReleased = false;

  const view = createLineView();

  // Tracks `code` so parent updates vs local edits can be distinguished.
  let internalCode = code;

  const painter = createEditorPainter({
    editor: () => editor,
    view,
    registry,
    highlightPrefix: `hljs-${instanceId}`,
  });

  $: resolvedEngineValue =
    engine === "css-highlights" && supportsCssHighlights()
      ? "css-highlights"
      : "dom";

  let previousLanguageName;
  let previousEngine;
  $: {
    ensureRegistered(language);
    if (
      mounted &&
      (language.name !== previousLanguageName ||
        resolvedEngineValue !== previousEngine)
    ) {
      if (previousEngine === "css-highlights") painter.clearHighlights();
      repaintForLanguageChange();
    }
    previousLanguageName = language.name;
    previousEngine = resolvedEngineValue;
  }
  $: if (mounted && code !== internalCode) syncExternal();
  $: cssHighlightStyle =
    resolvedEngineValue === "css-highlights" && theme !== undefined
      ? instanceHighlightStyle(theme, instanceId)
      : "";

  function getSelectionRange() {
    return readSelection(editor, view, window.getSelection());
  }

  function getCaretOffset() {
    const sel = getSelectionRange();
    return sel ? sel.end : null;
  }

  function setSelection(start, end, root = editor) {
    writeSelection(editor, view, window.getSelection(), start, end, root);
  }

  function lineStartOffset(index) {
    return lineStartIn(view, index);
  }

  function paint() {
    return painter.paint(code, language.name, resolvedEngineValue);
  }

  function renderAt(start, end) {
    const changedIndex = paint();
    if (start == null) return;
    restoringSelection = true;
    if (changedIndex != null) {
      const lineStart = lineStartOffset(changedIndex);
      const lineEnd = lineStart + view.lineLengths[changedIndex];
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
    const caret = document.activeElement === editor ? getCaretOffset() : null;
    if (caret == null) paint();
    else renderAt(caret, caret);
  }

  function syncCaretToHistory() {
    if (!editor.contains(document.activeElement)) return;
    if (restoringSelection || composing || editHistory.isEmpty) return;
    const sel = getSelectionRange();
    if (sel) editHistory.moveCaret(code.length, sel);
  }

  const editHistory = createEditHistory({ limit: () => historyLimit });

  function emitHistory() {
    dispatch("history", editHistory.snapshot());
  }

  function pushHistory(previousCode, newCode, selectionAfter, coalesce) {
    editHistory.record(previousCode, newCode, selectionAfter, coalesce);
    emitHistory();
  }

  function applyHistoryMove(move) {
    if (!move) return;
    code = move.code;
    internalCode = move.code;
    dispatch("change", { code });
    emitHistory();
    renderAt(move.selection.start, move.selection.end);
  }

  function commit(value, start, end, coalesce) {
    if (readonly) return;
    const previousCode = code;
    code = value;
    internalCode = value;
    dispatch("change", { code });
    pushHistory(
      previousCode,
      value,
      { start, end: end == null ? start : end },
      coalesce,
    );
    renderAt(start, end);
  }

  function syncExternal() {
    const previousCode = internalCode;
    internalCode = code;
    pushHistory(
      previousCode,
      code,
      { start: code.length, end: code.length },
      false,
    );
    paint();
  }

  // Applies a command from editable-commands.js to the current selection.
  function runCommand(command) {
    const sel = getSelectionRange();
    if (!sel) return;
    const edit = command(code, sel);
    if (edit)
      commit(edit.code, edit.selection.start, edit.selection.end, false);
  }

  function insertText(text) {
    runCommand((value, sel) => replaceSelection(value, sel, text));
  }

  function shiftIndent(outdent) {
    runCommand((value, sel) => shiftLines(value, sel, tabSize, outdent));
  }

  function indentCommand() {
    runCommand((value, sel) => indentSelection(value, sel, tabSize));
  }

  function ensureFocus() {
    if (document.activeElement === editor) return;
    const prior = getSelectionRange();
    editor.focus();
    if (prior) setSelection(prior.start, prior.end);
    else setSelection(code.length);
    syncCaretToHistory();
  }

  export function undo() {
    applyHistoryMove(editHistory.undo(code));
  }

  export function redo() {
    applyHistoryMove(editHistory.redo(code));
  }

  export function focus() {
    editor.focus();
  }

  export function selectAll() {
    editor.focus();
    setSelection(0, code.length);
  }

  export function insert(text) {
    ensureFocus();
    insertText(text);
  }

  export function indent() {
    ensureFocus();
    indentCommand();
  }

  export function outdent() {
    ensureFocus();
    shiftIndent(true);
  }

  export function setCode(value) {
    if (readonly || value === code) return;
    const previousCode = code;
    internalCode = value;
    code = value;
    dispatch("change", { code });
    pushHistory(
      previousCode,
      value,
      { start: value.length, end: value.length },
      false,
    );
    paint();
  }

  export function clear() {
    setCode("");
  }

  export function getCode() {
    return code;
  }

  export function canUndo() {
    return editHistory.canUndo();
  }

  export function canRedo() {
    return editHistory.canRedo();
  }

  /** The engine actually in use: `engine`, or `"dom"` if it was requested but unsupported. */
  export function resolvedEngine() {
    return resolvedEngineValue;
  }

  // WebKit fires historyUndo/historyRedo twice per execCommand; ignore the
  // repeat until the next task.
  let handlingNativeHistory = false;
  function runNativeHistory(action) {
    if (handlingNativeHistory) return;
    handlingNativeHistory = true;
    action();
    setTimeout(() => {
      handlingNativeHistory = false;
    }, 0);
  }

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
    code = editor.textContent.replace(TRAILING_NEWLINE, "");
    internalCode = code;
    const caret = getCaretOffset() ?? code.length;
    dispatch("change", { code });
    pushHistory(previousCode, code, { start: caret, end: caret }, true);
    renderAt(caret);
  }

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
      if (!readonly) undo();
      return;
    }
    if (mod && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
      event.preventDefault();
      if (!readonly) redo();
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

  function onPaste(event) {
    event.preventDefault();
    insertText(event.clipboardData?.getData("text/plain") ?? "");
  }

  function onDrop(event) {
    event.preventDefault();
    insertText(event.dataTransfer?.getData("text/plain") ?? "");
  }

  // Edit-menu / execCommand undo-redo bypass onKeydown.
  function onBeforeInput(event) {
    if (event.inputType === "historyUndo") {
      event.preventDefault();
      runNativeHistory(undo);
    } else if (event.inputType === "historyRedo") {
      event.preventDefault();
      runNativeHistory(redo);
    }
  }

  function onBlur() {
    tabTrapReleased = false;
    dispatch("blur", { code: getCode() });
  }

  // Only listen to document-wide selectionchange while focused.
  function onFocusIn() {
    document.addEventListener("selectionchange", syncCaretToHistory);
  }

  function onFocusOut() {
    document.removeEventListener("selectionchange", syncCaretToHistory);
  }

  function onCompositionStart() {
    composing = true;
  }

  function onCompositionEnd() {
    composing = false;
    onInput();
  }

  onMount(() => {
    paint();
    editHistory.reset(code);
    mounted = true;
    emitHistory();

    editor.addEventListener("input", onInput);
    editor.addEventListener("keydown", onKeydown);
    editor.addEventListener("beforeinput", onBeforeInput);
    editor.addEventListener("paste", onPaste);
    editor.addEventListener("drop", onDrop);
    editor.addEventListener("mouseup", syncCaretToHistory);
    editor.addEventListener("keyup", syncCaretToHistory);
    editor.addEventListener("focusin", onFocusIn);
    editor.addEventListener("focusout", onFocusOut);
    editor.addEventListener("blur", onBlur);
    editor.addEventListener("compositionstart", onCompositionStart);
    editor.addEventListener("compositionend", onCompositionEnd);

    return () => {
      editor.removeEventListener("input", onInput);
      editor.removeEventListener("keydown", onKeydown);
      editor.removeEventListener("beforeinput", onBeforeInput);
      editor.removeEventListener("paste", onPaste);
      editor.removeEventListener("drop", onDrop);
      editor.removeEventListener("mouseup", syncCaretToHistory);
      editor.removeEventListener("keyup", syncCaretToHistory);
      editor.removeEventListener("focusin", onFocusIn);
      editor.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("selectionchange", syncCaretToHistory);
      editor.removeEventListener("blur", onBlur);
      editor.removeEventListener("compositionstart", onCompositionStart);
      editor.removeEventListener("compositionend", onCompositionEnd);
      painter.clearHighlights();
    };
  });
</script>

<svelte:head
  >{#if cssHighlightStyle}
    {@html cssHighlightStyle}
  {/if}</svelte:head
>

<pre
  style:overflow-x="var(--overflow-x, auto)"
  style:border-radius="var(--border-radius, 0)"
  {...$$restProps}
><code
    bind:this={editor}
    class:hljs={true}
    contenteditable={readonly ? "false" : "true"}
    spellcheck="false"
>{code}</code></pre>

<style>
  code {
    outline: none;
  }

  code:focus {
    outline: var(--outline-width, 2px) solid var(--outline-color, #4589ff);
    outline-offset: var(--outline-offset, -2px);
  }
</style>
