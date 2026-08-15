/**
 * editable-dom-paint.js: HighlightEditable's "dom" engine line-painting
 * cost. createDomLinePainter feeds pure-append edits through a streaming
 * session so paint work is O(delta) per keystroke; lineHtmlFromEvents is
 * the full-recompute path (renderHtml + splitLines over the whole event
 * stream), which is what a naive editable component pays on every
 * keystroke without the incremental painter.
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
import {
  createDomLinePainter,
  lineHtmlFromEvents,
} from "../src/editable-dom-paint.js";
import {
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import { buildRegistry, jsSource } from "./_shared.ts";

const registry = await buildRegistry();

function typeWithIncrementalPainter(targetLength: number) {
  const source = jsSource(targetLength);
  const painter = createDomLinePainter({ registry });
  let code = "";
  let state: ReturnType<typeof parseIncremental> | undefined;
  for (const ch of source) {
    code += ch;
    state = state
      ? reparseIncremental(registry, "javascript", state, code)
      : parseIncremental(registry, "javascript", code);
    painter.paint(state.events, code, "javascript");
  }
}

function typeWithFullRepaint(targetLength: number) {
  const source = jsSource(targetLength);
  let code = "";
  for (const ch of source) {
    code += ch;
    const { events } = parseIncremental(registry, "javascript", code);
    do_not_optimize(lineHtmlFromEvents(events, code));
  }
}

group("HighlightEditable paint: typing simulation", () => {
  summary(() => {
    for (const length of [1_000, 4_000]) {
      bench(
        `incremental painter @ ${length.toLocaleString()} chars typed`,
        () => {
          typeWithIncrementalPainter(length);
        },
      );
      bench(
        `full repaint every keystroke @ ${length.toLocaleString()} chars typed`,
        () => {
          typeWithFullRepaint(length);
        },
      );
    }
  });
});

// Run this suite alone with `bun bench/dom-paint.bench.ts` for a fast
// feedback loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
