/** Event stream consumers side by side: renderHtml, splitLines, extendLines, toRanges, tokenLines. */
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
