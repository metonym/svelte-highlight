/**
 * editable-dom-paint.js: HighlightEditable's "dom" engine line-painting
 * cost. createDomLinePainter feeds pure-append edits through a streaming
 * session so paint work is O(delta) per keystroke; lineHtmlFromEvents is
 * the full-recompute path (renderHtml + splitLines over the whole event
 * stream), which is what a naive editable component pays on every
 * keystroke without the incremental painter.
 */
import { group, task } from "ostia";
import {
  createDomLinePainter,
  lineHtmlFromEvents,
} from "../src/editable-dom-paint.js";
import {
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import { buildRegistry, jsLines, jsSource } from "./_shared.ts";

const registry = await buildRegistry();

function typeWithIncrementalPainter(targetLength: number) {
  const source = jsSource(targetLength);
  const painter = createDomLinePainter();
  let code = "";
  let state: ReturnType<typeof parseIncremental> | undefined;
  for (const ch of source) {
    code += ch;
    state = state
      ? reparseIncremental(registry, "javascript", state, code)
      : parseIncremental(registry, "javascript", code);
    painter.paint(state.events, code, "javascript", state.reuse);
  }
}

function typeWithFullRepaint(targetLength: number) {
  const source = jsSource(targetLength);
  let code = "";
  const results: unknown[] = [];
  for (const ch of source) {
    code += ch;
    const { events } = parseIncremental(registry, "javascript", code);
    results.push(lineHtmlFromEvents(events, code));
  }
  return results;
}

group("HighlightEditable paint: typing simulation", () => {
  for (const length of [1_000, 4_000]) {
    task(`incremental painter @ ${length.toLocaleString()} chars typed`, () => {
      typeWithIncrementalPainter(length);
    });
    task(
      `full repaint every keystroke @ ${length.toLocaleString()} chars typed`,
      () => typeWithFullRepaint(length),
    );
  }
});

// Typing in the middle of an already-open document: every keystroke is a
// non-append edit, so the painter takes its mid-document path. Parse
// states are precomputed so only painting is timed; one painter is reused
// across samples, cycling from the last state back to the first (itself a
// mid-document edit, a 12-character delete).
function midDocumentStates(lines: number) {
  const base = jsLines(lines);
  const at = base.indexOf("\n", base.length >> 1) + 1;
  const typed = "let x = 1; ";
  const states = [parseIncremental(registry, "javascript", base)];
  for (let i = 1; i <= typed.length; i++) {
    const code = `${base.slice(0, at)}${typed.slice(0, i)}${base.slice(at)}`;
    states.push(
      reparseIncremental(
        registry,
        "javascript",
        states[states.length - 1] as (typeof states)[number],
        code,
      ),
    );
  }
  return states;
}

group("HighlightEditable paint: mid-document typing", () => {
  for (const lines of [500, 2_000, 8_000]) {
    const states = midDocumentStates(lines);
    const painter = createDomLinePainter();
    task(
      `painter, ${states.length - 1} keystrokes @ ${lines.toLocaleString()} lines`,
      () => {
        for (const state of states)
          painter.paint(state.events, state.code, "javascript", state.reuse);
      },
    );
  }
});

// Opening a document: the component's first parse and first paint, then
// the same plus one keystroke typed at the end (the first append after
// mount).
group("HighlightEditable paint: mount", () => {
  for (const lines of [2_000, 8_000]) {
    const code = jsLines(lines);
    const typed = `${code}x`;
    const label = `@ ${lines.toLocaleString()} lines`;
    task(`parse + first paint ${label}`, () => {
      const state = parseIncremental(registry, "javascript", code);
      createDomLinePainter().paint(state.events, code, "javascript");
    });
    task(`parse + first paint + 1 char appended ${label}`, () => {
      const state = parseIncremental(registry, "javascript", code);
      const painter = createDomLinePainter();
      painter.paint(state.events, code, "javascript");
      const next = reparseIncremental(registry, "javascript", state, typed);
      painter.paint(next.events, typed, "javascript", next.reuse);
    });
  }
});

// What a painter keeps alive once editing moves mid-document: open a
// document (first paint, the append path), then make one mid-document
// edit. Each call's painter is kept, so `--alloc` (heap retained per call)
// shows the painter's footprint.
const keptPainters: unknown[] = [];
group("HighlightEditable paint: retained after a mid-document edit", () => {
  const [opened, edited] = midDocumentStates(2_000) as [
    ReturnType<typeof parseIncremental>,
    ReturnType<typeof parseIncremental>,
  ];
  task("painter @ 2,000 lines", () => {
    const painter = createDomLinePainter();
    painter.paint(opened.events, opened.code, "javascript");
    painter.paint(edited.events, edited.code, "javascript", edited.reuse);
    keptPainters.push(painter);
  });
});

// Run this suite with `ostia bench bench/dom-paint.bench.ts` for a fast
// feedback loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
