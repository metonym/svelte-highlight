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
   * Rendering engine. `"css-highlights"` (experimental) paints tokens via
   * the CSS Custom Highlight API over plain-text line nodes instead of
   * wrapping them in `<span>`s, so a repaint never replaces DOM the caret
   * could be sitting in. Falls back to `"dom"` silently where
   * `CSS.highlights` is unavailable; check the resolved engine with the
   * exported `resolvedEngine()` method.
   * @type {"dom" | "css-highlights"}
   */
  export let engine = "dom";

  /**
   * Theme CSS from `svelte-highlight/styles/<theme>`, or a `ThemePalette`
   * from `svelte-highlight/themes/<theme>` — used only in
   * `"css-highlights"` mode to generate `::highlight()` rules. Colors only
   * (`color`/`background-color`); other declarations are dropped.
   * @type {string | import("./theme.d.ts").ThemePalette | undefined}
   */
  export let theme = undefined;

  import { createEventDispatcher, onMount } from "svelte";
  import { renderHtml, toRanges } from "./engine.js";
  import {
    highlightRules,
    highlightRulesFromPalette,
  } from "./highlight-theme.js";
  import {
    parseIncremental,
    reparseIncremental,
  } from "./incremental-tokenize.js";
  import { ensureRegistered, registry } from "./registry.js";
  import { splitLines } from "./split-lines.js";
  import { diffText } from "./text-diff.js";

  const dispatch = createEventDispatcher();
  const TRAILING_NEWLINE = /\n$/;
  const instanceId = nextInstanceId();

  /** @type {HTMLElement} */
  let editor;

  // Don't re-highlight during IME composition.
  let composing = false;
  let mounted = false;
  let restoringSelection = false;

  // One <span> per line, painted incrementally (see `renderLines`).
  /** @type {HTMLSpanElement[]} */
  let lineEls = [];
  /** @type {number[]} Rendered (plain-text) length of each line element. */
  let lineLengths = [];
  /** @type {string[]} Line HTML currently reflected in `lineEls`. */
  let renderedLines = [];

  // Tracks `code` so parent updates vs local edits can be distinguished.
  let internalCode = code;

  // Incremental re-tokenize via incremental-tokenize.js; reuses tail on
  // convergence. getEvents() full-parses on first call and language change.
  /** @type {import("./incremental-tokenize.js").IncrementalParse | undefined} */
  let incrementalParse;

  function getEvents() {
    incrementalParse = incrementalParse
      ? reparseIncremental(registry, language.name, incrementalParse, code)
      : parseIncremental(registry, language.name, code);
    return incrementalParse.events;
  }

  $: resolvedEngineValue =
    engine === "css-highlights" &&
    typeof CSS !== "undefined" &&
    typeof CSS.highlights !== "undefined"
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
      if (previousEngine === "css-highlights") clearCssHighlights();
      repaintForLanguageChange();
    }
    previousLanguageName = language.name;
    previousEngine = resolvedEngineValue;
  }
  $: indentUnit = " ".repeat(tabSize);
  $: if (mounted && code !== internalCode) syncExternal();
  $: cssHighlightStyle =
    resolvedEngineValue === "css-highlights" && theme !== undefined
      ? `<style>${(
          typeof theme === "object"
            ? highlightRulesFromPalette(theme)
            : highlightRules(theme)
        ).replaceAll(
          "::highlight(hljs-",
          `::highlight(hljs-${instanceId}-`,
        )}</style>`
      : "";

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

  function nodeAtOffset(offset, root = editor) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let count = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const next = count + node.textContent.length;
      if (offset <= next) return { node, offset: offset - count };
      count = next;
    }
    return null;
  }

  // Firefox's contenteditable undo manager treats a boundary set exactly at
  // a text node's start/end (setStart/setEnd with a text node + offset)
  // differently from the equivalent boundary expressed via the parent's
  // child index (setStartBefore/After): after our repaint rebuilds the text
  // node, the former leaves Firefox unable to recognize a later native
  // undo (execCommand/Edit menu), which then silently does nothing. Prefer
  // the parent-anchored form whenever the offset lands on a node edge.
  function setRangeBoundary(range, side, node, offset) {
    if (offset === 0) range[`set${side}Before`](node);
    else if (offset === node.textContent.length) range[`set${side}After`](node);
    else range[side === "Start" ? "setStart" : "setEnd"](node, offset);
  }

  function setSelection(start, end, root = editor) {
    const from = nodeAtOffset(start, root);
    if (!from) return;
    const range = document.createRange();
    setRangeBoundary(range, "Start", from.node, from.offset);
    const to = end != null && end !== start ? nodeAtOffset(end, root) : null;
    if (to) setRangeBoundary(range, "End", to.node, to.offset);
    else range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // Character offset (in the same space as getSelectionRange/setSelection)
  // where line `index` starts.
  function lineStartOffset(index) {
    let start = index; // one "\n" separator per preceding line
    for (let i = 0; i < index; i++) start += lineLengths[i];
    return start;
  }

  const setHtml = (el, line) => {
    el.innerHTML = line;
  };
  const setText = (el, line) => {
    el.textContent = line;
  };

  // Patches `editor` to match `lines` (one <span> per line, joined by literal
  // "\n" text nodes so caret offset math stays identical to a flat paint).
  // Only lines whose content actually changed touch the DOM (assigned via
  // `setContent`: innerHTML for the "dom" engine, textContent for
  // "css-highlights"). Returns the index of the single changed line when
  // nothing else shifted (used to scope caret restoration), or null.
  function renderLines(lines, setContent) {
    // Some browsers can place a native selection boundary just outside a
    // line's <span> (e.g. Firefox collapsing a select-all there); typing at
    // that point inserts a stray sibling text node our diffing never touches.
    // Detect the drift by child count and self-heal with a full rebuild.
    const expectedChildren = lineEls.length === 0 ? 0 : lineEls.length * 2 - 1;
    if (editor.childNodes.length !== expectedChildren) {
      editor.textContent = "";
      lineEls = [];
      lineLengths = [];
      renderedLines = [];
      clearCssHighlights();
    }

    const prevLen = lineEls.length;
    const newLen = lines.length;
    const commonLen = Math.min(prevLen, newLen);

    let changedIndex = null;
    let changedCount = 0;
    for (let i = 0; i < commonLen; i++) {
      if (renderedLines[i] === lines[i]) continue;
      setContent(lineEls[i], lines[i]);
      lineLengths[i] = lineEls[i].textContent.length;
      changedIndex = i;
      changedCount++;
    }

    for (let i = prevLen; i < newLen; i++) {
      if (lineEls.length > 0) editor.appendChild(document.createTextNode("\n"));
      const span = document.createElement("span");
      setContent(span, lines[i]);
      editor.appendChild(span);
      lineEls.push(span);
      lineLengths.push(span.textContent.length);
    }

    while (lineEls.length > newLen) {
      editor.removeChild(lineEls.pop());
      lineLengths.pop();
      clearLineHighlights(lineHighlightRanges.length - 1);
      lineHighlightRanges.pop();
      // Drop the separator that used to precede the removed line.
      if (lineEls.length > 0) editor.removeChild(editor.lastChild);
    }

    renderedLines = lines;
    return prevLen === newLen && changedCount === 1 ? changedIndex : null;
  }

  /** @type {Map<string, InstanceType<typeof Highlight>>} scope -> registered Highlight. */
  let cssHighlights = new Map();
  /** @type {{ scope: string; range: Range }[][]} Ranges registered per line. */
  let lineHighlightRanges = [];

  function cssHighlightFor(scope) {
    let highlight = cssHighlights.get(scope);
    if (!highlight) {
      highlight = new Highlight();
      cssHighlights.set(scope, highlight);
      CSS.highlights.set(`hljs-${instanceId}-${scope}`, highlight);
    }
    return highlight;
  }

  function clearLineHighlights(index) {
    const previous = lineHighlightRanges[index];
    if (!previous) return;
    for (const { scope, range } of previous) {
      cssHighlights.get(scope)?.delete(range);
    }
  }

  function clearCssHighlights() {
    for (const scope of cssHighlights.keys()) {
      CSS.highlights.delete(`hljs-${instanceId}-${scope}`);
    }
    cssHighlights = new Map();
    lineHighlightRanges = [];
  }

  // Rebuilds only line `index`'s Highlight Range registrations from
  // `tokenRanges` (absolute offsets into the full document); the line's text
  // node itself is untouched by this, so it never disturbs the caret.
  function paintLineHighlights(index, tokenRanges) {
    clearLineHighlights(index);
    const textNode = lineEls[index].firstChild;
    const next = [];
    if (textNode) {
      const lineStart = lineStartOffset(index);
      const lineEnd = lineStart + lineLengths[index];
      for (const token of tokenRanges) {
        if (token.end <= lineStart || token.start >= lineEnd) continue;
        const start = Math.max(token.start, lineStart) - lineStart;
        const end = Math.min(token.end, lineEnd) - lineStart;
        if (start === end) continue;
        const range = new Range();
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        cssHighlightFor(token.scope).add(range);
        next.push({ scope: token.scope, range });
      }
    }
    lineHighlightRanges[index] = next;
  }

  function paintCssHighlights() {
    const changedIndex = renderLines(code.split("\n"), setText);
    const tokenRanges = toRanges(getEvents());

    if (changedIndex == null) {
      for (let i = 0; i < lineEls.length; i++) {
        paintLineHighlights(i, tokenRanges);
      }
    } else {
      paintLineHighlights(changedIndex, tokenRanges);
    }
    return changedIndex;
  }

  function paint() {
    if (resolvedEngineValue === "css-highlights") return paintCssHighlights();
    const html = renderHtml(getEvents());
    // Trailing empty line needs a phantom `\n` for caret placement.
    const paintHtml = code === "" || code.endsWith("\n") ? `${html}\n` : html;
    return renderLines(splitLines(paintHtml), setHtml);
  }

  function renderAt(start, end) {
    const changedIndex = paint();
    if (start == null) return;
    restoringSelection = true;
    if (changedIndex != null) {
      const lineStart = lineStartOffset(changedIndex);
      const lineEnd = lineStart + lineLengths[changedIndex];
      const inLine = (offset) =>
        offset == null || (offset >= lineStart && offset <= lineEnd);
      if (start >= lineStart && start <= lineEnd && inLine(end)) {
        setSelection(
          start - lineStart,
          end == null ? end : end - lineStart,
          lineEls[changedIndex],
        );
        restoringSelection = false;
        return;
      }
    }
    setSelection(start, end);
    restoringSelection = false;
  }

  function repaintForLanguageChange() {
    const caret = document.activeElement === editor ? getCaretOffset() : null;
    if (caret == null) paint();
    else renderAt(caret, caret);
  }

  function syncCaretToHistory() {
    if (!editor.contains(document.activeElement)) return;
    if (restoringSelection || composing || undoStack.length === 0) return;
    const sel = getSelectionRange();
    if (!sel) return;
    const top = undoStack[undoStack.length - 1];
    if (top.resultLength !== code.length) return;
    undoStack[undoStack.length - 1] = {
      ...top,
      selectionAfter: { start: sel.start, end: sel.end },
    };
  }

  /**
   * @typedef {{ start: number; end: number }} Selection
   * @typedef {{
   *   start: number;
   *   removed: string;
   *   inserted: string;
   *   resultLength: number;
   *   selectionBefore: Selection;
   *   selectionAfter: Selection;
   * }} HistoryEntry
   */

  /** @type {HistoryEntry[]} */
  let undoStack = [];
  /** @type {HistoryEntry[]} */
  let redoStack = [];
  let lastRecord = 0;

  function emitHistory() {
    const future = redoStack.slice().reverse();
    dispatch("history", {
      entries: [...undoStack, ...future].map((snap) => ({
        size: snap.resultLength,
      })),
      index: undoStack.length - 1,
      canUndo: canUndo(),
      canRedo: canRedo(),
    });
  }

  /** @returns {HistoryEntry} */
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

  // The code an entry transformed *from*, given the code it produced.
  function beforeCodeOf(entry, resultCode) {
    return (
      resultCode.slice(0, entry.start) +
      entry.removed +
      resultCode.slice(entry.start + entry.inserted.length)
    );
  }

  // Coalesce typing within 250ms; Enter/Tab/paste pass coalesce=false.
  function pushHistory(previousCode, newCode, selectionAfter, coalesce) {
    redoStack = [];
    const now = Date.now();
    const top = undoStack[undoStack.length - 1];

    if (coalesce && undoStack.length > 1 && now - lastRecord < 250) {
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
      const limit = Math.max(1, historyLimit);
      if (undoStack.length > limit) {
        undoStack.splice(0, undoStack.length - limit);
      }
    }
    lastRecord = coalesce ? now : 0;
    emitHistory();
  }

  function applyHistoryMove(newCode, selection) {
    code = newCode;
    internalCode = newCode;
    dispatch("change", { code });
    emitHistory();
    renderAt(selection.start, selection.end);
  }

  function commit(value, start, end, coalesce) {
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
    const entry = undoStack.pop();
    redoStack.push(entry);
    applyHistoryMove(beforeCodeOf(entry, code), entry.selectionBefore);
  }

  export function redo() {
    if (redoStack.length === 0) return;
    const entry = redoStack.pop();
    const nextCode =
      code.slice(0, entry.start) +
      entry.inserted +
      code.slice(entry.start + entry.removed.length);
    undoStack.push(entry);
    applyHistoryMove(nextCode, entry.selectionAfter);
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
    return undoStack.length > 1;
  }

  export function canRedo() {
    return redoStack.length > 0;
  }

  /** The engine actually in use: `engine`, or `"dom"` if it was requested but unsupported. */
  export function resolvedEngine() {
    return resolvedEngineValue;
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
    const previousCode = code;
    // textContent (not innerText): innerText forces a synchronous layout
    // and Firefox can return a stale value immediately after editing a text
    // node last written via `textContent` (see setText in
    // paintCssHighlights), losing the just-typed content. The `<pre>`
    // wrapper's `white-space: pre` means every native text-insertion path
    // (typing, execCommand insertText, paste/drop as plain text) already
    // uses literal "\n" characters rather than <br> elements, so
    // textContent loses nothing textContent would have kept anyway.
    code = editor.textContent.replace(TRAILING_NEWLINE, "");
    internalCode = code;
    const caret = getCaretOffset() ?? code.length;
    dispatch("change", { code });
    pushHistory(previousCode, code, { start: caret, end: caret }, true);
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

  // Selection changes can only affect this editor while it holds focus, so
  // only pay for the document-wide listener (range clone + full-content
  // toString()) during that window instead of for the component's whole
  // lifetime.
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
    mounted = true;
    emitHistory();

    editor.addEventListener("input", onInput);
    editor.addEventListener("keydown", onKeydown);
    editor.addEventListener("beforeinput", onBeforeInput);
    editor.addEventListener("paste", onPaste);
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
      editor.removeEventListener("mouseup", syncCaretToHistory);
      editor.removeEventListener("keyup", syncCaretToHistory);
      editor.removeEventListener("focusin", onFocusIn);
      editor.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("selectionchange", syncCaretToHistory);
      editor.removeEventListener("blur", onBlur);
      editor.removeEventListener("compositionstart", onCompositionStart);
      editor.removeEventListener("compositionend", onCompositionEnd);
      clearCssHighlights();
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
    contenteditable="true"
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
