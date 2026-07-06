<script>
  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {string} */
  export let code = "";

  /** @type {number} Number of spaces inserted by the Tab key. */
  export let tabSize = 2;

  /** @type {number} Maximum number of undo snapshots retained. */
  export let historyLimit = 200;

  import hljs from "highlight.js/lib/core";
  import { createEventDispatcher, onMount } from "svelte";

  const dispatch = createEventDispatcher();
  const TRAILING_NEWLINE = /\n$/;

  /** @type {HTMLElement} */
  let editor;

  // Don't re-highlight during IME composition.
  let composing = false;
  let mounted = false;
  let restoringSelection = false;

  // Tracks `code` so parent updates vs local edits can be distinguished.
  let internalCode = code;

  let previousLanguageName;
  $: {
    hljs.registerLanguage(language.name, language.register);
    if (mounted && language.name !== previousLanguageName) {
      repaintForLanguageChange();
    }
    previousLanguageName = language.name;
  }
  $: indentUnit = " ".repeat(tabSize);
  $: if (mounted && code !== internalCode) syncExternal();

  function getSelectionRange() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return null;
    const pre = range.cloneRange();
    pre.selectNodeContents(editor);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    return { start, end: start + range.toString().length };
  }

  function getCaretOffset() {
    const sel = getSelectionRange();
    return sel ? sel.end : null;
  }

  function nodeAtOffset(offset) {
    const walker = document.createTreeWalker(
      editor,
      NodeFilter.SHOW_TEXT,
      null,
    );
    let count = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const next = count + node.textContent.length;
      if (offset <= next) return { node, offset: offset - count };
      count = next;
    }
    return null;
  }

  function setSelection(start, end) {
    const from = nodeAtOffset(start);
    if (!from) return;
    const range = document.createRange();
    range.setStart(from.node, from.offset);
    const to = end != null && end !== start ? nodeAtOffset(end) : null;
    if (to) range.setEnd(to.node, to.offset);
    else range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function paint() {
    const html = hljs.highlight(code, { language: language.name }).value;
    // Trailing empty line needs a phantom `\n` for caret placement.
    editor.innerHTML = code === "" || code.endsWith("\n") ? `${html}\n` : html;
  }

  function renderAt(start, end) {
    paint();
    if (start == null) return;
    restoringSelection = true;
    setSelection(start, end);
    restoringSelection = false;
  }

  function repaintForLanguageChange() {
    const caret = document.activeElement === editor ? getCaretOffset() : null;
    if (caret == null) paint();
    else renderAt(caret, caret);
  }

  function syncCaretToHistory() {
    if (restoringSelection || composing || undoStack.length === 0) return;
    const sel = getSelectionRange();
    if (!sel) return;
    const top = undoStack[undoStack.length - 1];
    if (top.code !== code) return;
    undoStack[undoStack.length - 1] = {
      code: top.code,
      start: sel.start,
      end: sel.end,
    };
  }

  /** @type {Array<{ code: string; start: number; end: number }>} */
  let undoStack = [];
  /** @type {Array<{ code: string; start: number; end: number }>} */
  let redoStack = [];
  let lastRecord = 0;

  function emitHistory() {
    const future = redoStack.slice().reverse();
    dispatch("history", {
      entries: [...undoStack, ...future].map((snap) => ({
        size: snap.code.length,
      })),
      index: undoStack.length - 1,
      canUndo: canUndo(),
      canRedo: canRedo(),
    });
  }

  // Coalesce typing within 250ms; Enter/Tab/paste pass coalesce=false.
  function pushHistory(snap, coalesce) {
    redoStack = [];
    const now = Date.now();
    if (coalesce && undoStack.length > 1 && now - lastRecord < 250) {
      undoStack[undoStack.length - 1] = snap;
    } else {
      undoStack.push(snap);
      const limit = Math.max(1, historyLimit);
      if (undoStack.length > limit) {
        undoStack.splice(0, undoStack.length - limit);
      }
    }
    lastRecord = coalesce ? now : 0;
    emitHistory();
  }

  function applySnapshot(snap) {
    code = snap.code;
    internalCode = snap.code;
    dispatch("change", { code });
    emitHistory();
    renderAt(snap.start, snap.end);
  }

  function commit(value, start, end, coalesce) {
    code = value;
    internalCode = value;
    dispatch("change", { code });
    pushHistory({ code: value, start, end }, coalesce);
    renderAt(start, end);
  }

  function syncExternal() {
    internalCode = code;
    pushHistory({ code, start: code.length, end: code.length }, false);
    paint();
  }

  function insertText(text) {
    const sel = getSelectionRange();
    if (!sel) return;
    const value = code.slice(0, sel.start) + text + code.slice(sel.end);
    commit(value, sel.start + text.length, undefined, false);
  }

  // Indent/dedent selected lines; blank lines skipped on indent.
  function shiftIndent(outdent) {
    const sel = getSelectionRange();
    if (!sel) return;
    const blockStart = code.lastIndexOf("\n", sel.start - 1) + 1;
    const lines = code.slice(blockStart, sel.end).split("\n");

    let firstDelta = 0;
    let totalDelta = 0;
    const next = lines
      .map((line, index) => {
        if (outdent) {
          const leading = line.length - line.trimStart().length;
          const remove = Math.min(tabSize, leading);
          if (index === 0) firstDelta = -remove;
          totalDelta -= remove;
          return line.slice(remove);
        }
        if (line.length === 0) return line;
        if (index === 0) firstDelta = tabSize;
        totalDelta += tabSize;
        return indentUnit + line;
      })
      .join("\n");

    if (totalDelta === 0) return;
    const value = code.slice(0, blockStart) + next + code.slice(sel.end);
    const start = Math.max(blockStart, sel.start + firstDelta);
    commit(value, start, sel.end + totalDelta, false);
  }

  function indentCommand() {
    const sel = getSelectionRange();
    if (sel && code.slice(sel.start, sel.end).includes("\n"))
      shiftIndent(false);
    else insertText(indentUnit);
  }

  function ensureFocus() {
    if (document.activeElement === editor) return;
    // Restore selection after focus; default caret to end.
    const prior = getSelectionRange();
    editor.focus();
    if (prior) setSelection(prior.start, prior.end);
    else setSelection(code.length);
    syncCaretToHistory();
  }

  export function undo() {
    if (undoStack.length <= 1) return;
    redoStack.push(undoStack.pop());
    applySnapshot(undoStack[undoStack.length - 1]);
  }

  export function redo() {
    if (redoStack.length === 0) return;
    const snap = redoStack.pop();
    undoStack.push(snap);
    applySnapshot(snap);
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
    if (value === code) return;
    internalCode = value;
    code = value;
    dispatch("change", { code });
    pushHistory({ code: value, start: value.length, end: value.length }, false);
    paint();
  }

  export function clear() {
    setCode("");
  }

  export function getCode() {
    return code;
  }

  export function canUndo() {
    return undoStack.length > 1;
  }

  export function canRedo() {
    return redoStack.length > 0;
  }

  // WebKit dispatches a second beforeinput historyUndo/historyRedo shortly
  // after the first for a single execCommand call; without this guard the
  // second dispatch pops an extra history entry. The reset is deferred past
  // the current task so a genuinely separate later undo still goes through.
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
    // Some engines (e.g. Chromium's execCommand path) never dispatch a
    // cancelable beforeinput for native undo/redo, only this input event
    // after the DOM already mutated. Re-render from our own snapshot rather
    // than recording the browser's mutation as new typed content.
    if (event?.inputType === "historyUndo") {
      runNativeHistory(undo);
      return;
    }
    if (event?.inputType === "historyRedo") {
      runNativeHistory(redo);
      return;
    }
    // innerText keeps contenteditable line breaks; textContent doesn't.
    code = editor.innerText.replace(TRAILING_NEWLINE, "");
    internalCode = code;
    const caret = getCaretOffset() ?? code.length;
    dispatch("change", { code });
    pushHistory({ code, start: caret, end: caret }, true);
    renderAt(caret);
  }

  function onKeydown(event) {
    const mod = event.metaKey || event.ctrlKey;

    if (mod && event.key === "z" && !event.shiftKey) {
      event.preventDefault();
      undo();
      return;
    }
    if (mod && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
      event.preventDefault();
      redo();
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

  // Edit-menu / execCommand undo-redo bypass onKeydown; intercept here so the
  // browser doesn't mutate DOM that paint() has already rebuilt.
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
    dispatch("blur", { code: getCode() });
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
    undoStack = [{ code, start: 0, end: 0 }];
    mounted = true;
    emitHistory();

    editor.addEventListener("input", onInput);
    editor.addEventListener("keydown", onKeydown);
    editor.addEventListener("beforeinput", onBeforeInput);
    editor.addEventListener("paste", onPaste);
    editor.addEventListener("mouseup", syncCaretToHistory);
    editor.addEventListener("keyup", syncCaretToHistory);
    document.addEventListener("selectionchange", syncCaretToHistory);
    editor.addEventListener("blur", onBlur);
    editor.addEventListener("compositionstart", onCompositionStart);
    editor.addEventListener("compositionend", onCompositionEnd);

    return () => {
      editor.removeEventListener("input", onInput);
      editor.removeEventListener("keydown", onKeydown);
      editor.removeEventListener("beforeinput", onBeforeInput);
      editor.removeEventListener("paste", onPaste);
      editor.removeEventListener("mouseup", syncCaretToHistory);
      editor.removeEventListener("keyup", syncCaretToHistory);
      document.removeEventListener("selectionchange", syncCaretToHistory);
      editor.removeEventListener("blur", onBlur);
      editor.removeEventListener("compositionstart", onCompositionStart);
      editor.removeEventListener("compositionend", onCompositionEnd);
    };
  });
</script>

<pre
  style:overflow-x="var(--overflow-x, auto)"
  style:border-radius="var(--border-radius, 0)"
  {...$$restProps}
><code
    bind:this={editor}
    class:hljs={true}
    contenteditable="true"
    spellcheck="false"
></code></pre>

<style>
  code {
    outline: none;
  }

  code:focus {
    outline: var(--outline-width, 2px) solid var(--outline-color, #4589ff);
    outline-offset: var(--outline-offset, -2px);
  }
</style>
