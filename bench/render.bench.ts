/**
 * The rendering layer every component sits on top of: turning a tokenize()
 * event stream into HTML (renderHtml + splitLines, used by Highlight),
 * line-indexed HTML in one pass (extendLines, used by HighlightStream/
 * HighlightEditable), CSS Custom Highlight ranges (toRanges), or
 * line-indexed token objects (tokenLines). Same event stream in, four
 * different consumers - useful to see their relative cost side by side.
 */
import { group, task } from "ostia";
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
    task("renderHtml", () => renderHtml(events));
    task("renderHtml + splitLines", () => splitLines(renderHtml(events)));
    task("extendLines (whole stream in one call)", () =>
      extendLines(events, [], ""),
    );
    task("toRanges", () => toRanges(events));
    task("tokenLines", () => tokenLines(events));
    task("splitLines (on pre-rendered HTML)", () => splitLines(html));
  },
);

// Run this suite with `ostia bench bench/render.bench.ts` for a fast feedback
// loop; `bun run bench` runs every *.bench.ts suite for a full-baseline run.
