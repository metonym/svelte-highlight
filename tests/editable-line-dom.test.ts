import { createFakeEditor } from "../bench/_fake-dom.ts";
import {
  createLineView,
  editorNodeAtOffset,
  nodeAtOffset,
  renderLines,
} from "../src/editable-line-dom.js";

const setHtml = (el: HTMLElement, line: string) => {
  el.innerHTML = line;
};
const setText = (el: HTMLElement, line: string) => {
  el.textContent = line;
};

function setup(lines: string[], setContent = setText) {
  const { editor, counters } = createFakeEditor();
  const view = createLineView();
  const splices: [number, number, number][] = [];
  const hooks = {
    onReset() {},
    onSplice(index: number, removed: number, inserted: number) {
      splices.push([index, removed, inserted]);
    },
  };
  renderLines(editor, view, lines, setContent, hooks);
  const render = (next: string[]) => {
    counters.contentWrites = 0;
    counters.inserts = 0;
    counters.removals = 0;
    splices.length = 0;
    return renderLines(editor, view, next, setContent, hooks);
  };
  return { editor, view, counters, splices, render };
}

/** The editor matches `lines`: one element per line, "\n" between. */
function expectPainted(
  editor: HTMLElement,
  view: ReturnType<typeof createLineView>,
  lines: string[],
) {
  expect(editor.textContent).toBe(lines.join("\n"));
  expect(editor.childNodes.length).toBe(Math.max(0, lines.length * 2 - 1));
  let node = editor.firstChild;
  for (let i = 0; i < lines.length; i++) {
    expect(node).toBe(view.lineEls[i] as HTMLElement);
    expect(view.lineLengths[i]).toBe((lines[i] as string).length);
    node = node?.nextSibling ?? null;
    if (i < lines.length - 1) {
      expect(node?.textContent).toBe("\n");
      node = node?.nextSibling ?? null;
    }
  }
}

const doc = (n: number) => Array.from({ length: n }, (_, i) => `line ${i}`);

describe("renderLines", () => {
  it("writes a constant number of lines for a mid-file Enter", () => {
    for (const n of [500, 2_000, 8_000]) {
      const before = doc(n);
      const mid = n >> 1;
      const { editor, view, counters, splices, render } = setup(before);
      const kept = view.lineEls.slice();

      // Enter in the middle of line `mid`.
      const after = [
        ...before.slice(0, mid),
        "line",
        ` ${mid}`,
        ...before.slice(mid + 1),
      ];
      expect(render(after)).toBeNull();
      // One rewritten line, one new line (span + separator).
      expect(counters).toEqual({ contentWrites: 2, inserts: 2, removals: 0 });
      expect(splices).toEqual([[mid + 1, 0, 1]]);
      expectPainted(editor, view, after);
      expect(view.lineEls[0]).toBe(kept[0] as HTMLElement);
      expect(view.lineEls[n]).toBe(kept[n - 1] as HTMLElement);

      // Backspace joins them again.
      expect(render(before)).toBeNull();
      expect(counters).toEqual({ contentWrites: 1, inserts: 0, removals: 2 });
      expect(splices).toEqual([[mid + 1, 1, 0]]);
      expectPainted(editor, view, before);
      expect(view.lineEls).toEqual(kept);
    }
  });

  it("returns the index of a lone changed line", () => {
    const { editor, view, counters, render } = setup(doc(10), setHtml);
    const next = doc(10);
    next[4] = '<span class="hljs-keyword">let</span> x &amp;';
    expect(render(next)).toBe(4);
    expect(counters.contentWrites).toBe(1);
    expect(view.lineLengths[4]).toBe("let x &".length);
    expect(editor.textContent).toContain("let x &");
  });

  it("matches the lines across inserts, deletes, and rewrites anywhere", () => {
    let seed = 7;
    const random = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed % n;
    };
    let lines = doc(30);
    const { editor, view, render } = setup(lines);
    for (let step = 0; step < 300; step++) {
      const next = lines.slice();
      const at = random(next.length + 1);
      const removed = Math.min(random(4), next.length - at);
      const added = Array.from({ length: random(4) }, () =>
        // Repeated values make the head/tail matching ambiguous on purpose.
        random(3) === 0 ? "" : `new ${step} ${random(5)}`,
      );
      next.splice(at, removed, ...added);
      if (next.length === 0) next.push("");
      render(next);
      expectPainted(editor, view, next);
      lines = next;
    }
  });

  it("rebuilds from scratch when the DOM drifted", () => {
    const { editor, view, render } = setup(doc(3));
    editor.appendChild(editor.ownerDocument.createTextNode("stray"));
    render(doc(4));
    expectPainted(editor, view, doc(4));
  });
});

describe("editorNodeAtOffset", () => {
  it("finds the same node and offset as a walk from the editor root", () => {
    const lines = ["", "ab", "", "", "cde", "f", ""];
    const { editor, view } = setup(lines, setHtml);
    const total = lines.join("\n").length;
    for (let offset = 0; offset <= total + 1; offset++) {
      expect(editorNodeAtOffset(editor, view, offset)).toEqual(
        nodeAtOffset(editor, offset),
      );
    }
  });
});
