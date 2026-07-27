import type { TypewriterUnit } from "../src/typewriter-units.d.ts";
import {
  createTypewriterSplitter,
  tokenizeTypewriter,
} from "../src/typewriter-units.js";

/** Reference copy of the old `split()` from `src/Typewriter.svelte` (pre-incremental). */
function referenceSplit(list: TypewriterUnit[], count: number) {
  let head = "";
  let shown = 0;
  const open: { raw: string; name: string }[] = [];
  let i = 0;

  for (; i < list.length; i++) {
    const unit = list[i] as TypewriterUnit;
    if (shown >= count) break;
    head += unit.raw;
    if (unit.visible === 0) {
      if (unit.kind === "open")
        open.push({ raw: unit.raw, name: unit.name ?? "" });
      else if (unit.kind === "close") open.pop();
    } else {
      shown += unit.visible;
    }
  }

  let headClose = "";
  for (let k = open.length - 1; k >= 0; k--)
    headClose += `</${(open[k] as { raw: string; name: string }).name}>`;

  let tail = "";
  for (const tag of open) tail += tag.raw;
  for (; i < list.length; i++) tail += (list[i] as TypewriterUnit).raw;

  return { head: head + headClose, tail };
}

const CASES: Record<string, string> = {
  "nested spans": '<span class="a"><span class="b">const</span> x</span>',
  "html entities": "a &amp; b &lt;c&gt;",
  "surrogate pairs (emoji)": "hi \u{1F600} there \u{1F601}!",
  "unclosed tag": "abc <span",
  "empty string": "",
  "no tags": "plain text, no markup at all",
  mixed: '<span class="hljs-keyword">const</span> x = &amp;a; \u{1F600}\n',
};

describe("createTypewriterSplitter", () => {
  for (const [name, html] of Object.entries(CASES)) {
    it(`matches the reference split() for every count on: ${name}`, () => {
      const units = tokenizeTypewriter(html);
      const splitter = createTypewriterSplitter(units, html);
      const total = units.reduce((sum, u) => sum + u.visible, 0);

      for (let count = 0; count <= total; count++) {
        expect(splitter.splitAt(count)).toEqual(referenceSplit(units, count));
      }
    });
  }

  it("handles a non-monotonic call sequence (splitAt(5) then splitAt(2))", () => {
    const html =
      '<span class="hljs-keyword">const</span> x = &amp;a; \u{1F600}\n';
    const units = tokenizeTypewriter(html);
    const splitter = createTypewriterSplitter(units, html);

    expect(splitter.splitAt(5)).toEqual(referenceSplit(units, 5));
    expect(splitter.splitAt(2)).toEqual(referenceSplit(units, 2));
    // Resuming forward again after a rewind must still match.
    expect(splitter.splitAt(8)).toEqual(referenceSplit(units, 8));
  });
});
