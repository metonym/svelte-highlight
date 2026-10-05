/**
 * editable-line-dom.js: what HighlightEditable pays to bring its line
 * elements up to date after an edit, and to place the caret afterwards,
 * driven against a minimal fake DOM (_fake-dom.ts). Line HTML is real
 * engine output; unchanged lines keep their string identity across the
 * edit, as `patchLineHtml` returns them.
 */
import { group, task } from "ostia";
import { lineHtmlFromEvents } from "../src/editable-dom-paint.js";
import {
  createLineView,
  editorNodeAtOffset,
  renderLines,
} from "../src/editable-line-dom.js";
import { parseIncremental } from "../src/incremental-tokenize.js";
import { createFakeEditor } from "./_fake-dom.ts";
import { buildRegistry, jsLines } from "./_shared.ts";

const registry = await buildRegistry();

const setHtml = (el: HTMLElement, line: string) => {
  el.innerHTML = line;
};
const setText = (el: HTMLElement, line: string) => {
  el.textContent = line;
};
const hooks = { onReset() {}, onSplice() {} };

/**
 * A `lines`-line document's line HTML, the same document after `edit` at
 * the start of its middle line, and the caret offset after the edit. The
 * edited lines reuse the original's strings outside the edit.
 */
function documents(lines: number, edit: string) {
  const code = jsLines(lines);
  const line = lines >> 1;
  let at = 0;
  for (let i = 0; i < line; i++) at = code.indexOf("\n", at) + 1;
  const edited = `${code.slice(0, at)}${edit}${code.slice(at)}`;
  const html = (source: string) =>
    lineHtmlFromEvents(
      parseIncremental(registry, "javascript", source).events,
      source,
    );
  const before = html(code);
  const after = html(edited);
  const added = after.length - before.length;
  return {
    before,
    after: [
      ...before.slice(0, line),
      ...after.slice(line, line + added + 1),
      ...before.slice(line + 1),
    ],
    caret: at + edit.length,
    beforeText: code.split("\n"),
    afterText: edited.split("\n"),
  };
}

// Enter at the start of a middle line, then Backspace: every later line
// shifts down one index and back.
group("HighlightEditable lines: Enter + Backspace mid-document", () => {
  for (const lines of [500, 2_000, 8_000]) {
    const docs = documents(lines, "\n");
    const label = `@ ${lines.toLocaleString()} lines`;

    const dom = createFakeEditor().editor;
    const domView = createLineView();
    renderLines(dom, domView, docs.before, setHtml, hooks);
    task(`dom engine ${label}`, () => {
      renderLines(dom, domView, docs.after, setHtml, hooks);
      editorNodeAtOffset(dom, domView, docs.caret);
      renderLines(dom, domView, docs.before, setHtml, hooks);
      editorNodeAtOffset(dom, domView, docs.caret - 1);
    });

    const css = createFakeEditor().editor;
    const cssView = createLineView();
    renderLines(css, cssView, docs.beforeText, setText, hooks);
    task(`css-highlights engine ${label}`, () => {
      renderLines(css, cssView, docs.afterText, setText, hooks);
      editorNodeAtOffset(css, cssView, docs.caret);
      renderLines(css, cssView, docs.beforeText, setText, hooks);
      editorNodeAtOffset(css, cssView, docs.caret - 1);
    });
  }
});

// Typing within one middle line: the line count holds, so only that line
// changes. A control for the path above.
group("HighlightEditable lines: type + delete a character mid-document", () => {
  for (const lines of [500, 2_000, 8_000]) {
    const docs = documents(lines, "x");
    const dom = createFakeEditor().editor;
    const view = createLineView();
    renderLines(dom, view, docs.before, setHtml, hooks);
    task(`dom engine @ ${lines.toLocaleString()} lines`, () => {
      renderLines(dom, view, docs.after, setHtml, hooks);
      renderLines(dom, view, docs.before, setHtml, hooks);
    });
  }
});

// Run this suite with `ostia bench bench/line-dom.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
