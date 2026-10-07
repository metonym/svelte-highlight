/** editable-line-dom.js line updates and caret placement on a fake DOM. */
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

/** Line HTML before/after `edit` at the middle line; unchanged lines keep string identity. */
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
