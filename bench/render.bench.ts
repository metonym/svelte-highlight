/**
 * The rendering layer every component sits on top of: turning a tokenize()
 * event stream into HTML (renderHtml + splitLines, used by Highlight),
 * line-indexed HTML in one pass (extendLines, used by HighlightStream/
 * HighlightEditable), CSS Custom Highlight ranges (toRanges), or
 * line-indexed token objects (tokenLines). Same event stream in, four
 * different consumers - useful to see their relative cost side by side.
 */
import { bench, do_not_optimize, group, run, summary } from "mitata";
import {
  extendLines,
  renderHtml,
  tokenLines,
  toRanges,
} from "../src/engine.js";
import { splitLines } from "../src/split-lines.js";
import { buildRegistry, getCorpus, sizedSlice } from "./_shared.ts";

const registry = await buildRegistry();
const corpus = await getCorpus();
const SIZE = 50_000;
const code = sizedSlice(corpus.javascript, SIZE);
const { events } = registry.tokenize(code, "javascript");
const html = renderHtml(events);

group(
  `render primitives @ ${SIZE.toLocaleString()} chars of javascript`,
  () => {
    summary(() => {
      bench("renderHtml", () => {
        do_not_optimize(renderHtml(events));
      });
      bench("renderHtml + splitLines", () => {
        do_not_optimize(splitLines(renderHtml(events)));
      });
      bench("extendLines (whole stream in one call)", () => {
        do_not_optimize(extendLines(events, [], ""));
      });
      bench("toRanges", () => {
        do_not_optimize(toRanges(events));
      });
      bench("tokenLines", () => {
        do_not_optimize(tokenLines(events));
      });
      bench("splitLines (on pre-rendered HTML)", () => {
        do_not_optimize(splitLines(html));
      });
    });
  },
);

// Run this suite alone with `bun bench/render.bench.ts` for a fast feedback
// loop; bench/index.ts imports every suite for a full-baseline run.
if (import.meta.main) await run();
