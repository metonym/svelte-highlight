import {
  createHighlightPainter,
  instanceHighlightRules,
  nextInstanceId,
  resolveEngine,
} from "../src/css-highlights.js";
import github from "../src/styles/github.js";
import githubPalette from "../src/themes/github.js";

describe("resolveEngine", () => {
  afterEach(() => {
    // @ts-expect-error test cleanup — CSS isn't a real Bun/Node global.
    globalThis.CSS = undefined;
  });

  it("stays dom when dom is requested, even with CSS.highlights present", () => {
    // @ts-expect-error test stub
    globalThis.CSS = { highlights: new Map() };
    expect(resolveEngine("dom")).toBe("dom");
  });

  it("resolves to css-highlights when requested and CSS.highlights is present", () => {
    // @ts-expect-error test stub
    globalThis.CSS = { highlights: new Map() };
    expect(resolveEngine("css-highlights")).toBe("css-highlights");
  });

  it("falls back to dom when css-highlights is requested but CSS is undefined", () => {
    expect(globalThis.CSS).toBeUndefined();
    expect(resolveEngine("css-highlights")).toBe("dom");
  });

  it("falls back to dom when css-highlights is requested but CSS.highlights is undefined", () => {
    // @ts-expect-error test stub — CSS present, no Custom Highlight API support
    globalThis.CSS = {};
    expect(resolveEngine("css-highlights")).toBe("dom");
  });
});

describe("nextInstanceId", () => {
  it("returns increasing, unique ids across calls", () => {
    const a = nextInstanceId();
    const b = nextInstanceId();
    const c = nextInstanceId();
    expect(b).toBe(a + 1);
    expect(c).toBe(b + 1);
  });
});

describe("instanceHighlightRules", () => {
  it("renames a string theme's rules with the instance id", () => {
    const out = instanceHighlightRules(".hljs-keyword{color:#c678dd}", 7);
    expect(out).toBe("::highlight(hljs-7-keyword){color:#c678dd}");
  });

  it("renames a ThemePalette's rules with the instance id", () => {
    const out = instanceHighlightRules(
      {
        name: "test",
        colorScheme: "dark",
        vars: { "--shl-keyword": "#c678dd" },
      },
      7,
    );
    expect(out).toBe("::highlight(hljs-7-keyword){color:#c678dd}");
  });

  it("produces the same instance-scoped rule name for equivalent string and palette themes", () => {
    const fromString = instanceHighlightRules(github, 3);
    const fromPalette = instanceHighlightRules(githubPalette, 3);
    expect(fromString).toContain("::highlight(hljs-3-keyword){color:#d73a49}");
    expect(fromPalette).toContain("::highlight(hljs-3-keyword){color:#d73a49}");
  });
});

describe("createHighlightPainter", () => {
  class FakeRange {
    startNode: unknown;
    startOffset = 0;
    endNode: unknown;
    endOffset = 0;
    setStart(node: unknown, offset: number) {
      this.startNode = node;
      this.startOffset = offset;
    }
    setEnd(node: unknown, offset: number) {
      this.endNode = node;
      this.endOffset = offset;
    }
  }

  class FakeHighlight {
    ranges = new Set<FakeRange>();
    add(range: FakeRange) {
      this.ranges.add(range);
    }
    delete(range: FakeRange) {
      return this.ranges.delete(range);
    }
  }

  /** @type {Map<string, FakeHighlight>} */
  let registrations: Map<string, FakeHighlight>;

  beforeEach(() => {
    registrations = new Map();
    // @ts-expect-error test stub
    globalThis.Range = FakeRange;
    // @ts-expect-error test stub
    globalThis.Highlight = FakeHighlight;
    // @ts-expect-error test stub
    globalThis.CSS = { highlights: registrations };
  });

  afterEach(() => {
    // @ts-expect-error test cleanup
    globalThis.Range = undefined;
    // @ts-expect-error test cleanup
    globalThis.Highlight = undefined;
    // @ts-expect-error test cleanup
    globalThis.CSS = undefined;
  });

  it("highlightFor lazily creates and registers a Highlight per scope, reusing it on repeat calls", () => {
    const painter = createHighlightPainter(1);
    const keyword = painter.highlightFor("keyword");
    expect(registrations.get("hljs-1-keyword")).toBe(keyword);
    expect(painter.highlightFor("keyword")).toBe(keyword);
    expect(registrations.size).toBe(1);
  });

  it("paintNode clips a token spanning the node boundary", () => {
    const painter = createHighlightPainter(1);
    const textNode = {} as Text;
    // Window is [10, 20); token runs 5..15, so only 10..15 is in range.
    const created = painter.paintNode(
      textNode,
      [{ start: 5, end: 15, scope: "string" }],
      10,
      10,
    );
    expect(created).toHaveLength(1);
    const [entry] = created;
    expect(entry?.scope).toBe("string");
    const range = entry?.range as unknown as FakeRange;
    expect(range.startNode).toBe(textNode);
    expect(range.startOffset).toBe(0);
    expect(range.endOffset).toBe(5);
  });

  it("paintNode skips a token entirely outside the window", () => {
    const painter = createHighlightPainter(1);
    const created = painter.paintNode(
      {} as Text,
      [{ start: 0, end: 5, scope: "keyword" }],
      10,
      10,
    );
    expect(created).toHaveLength(0);
    expect(registrations.size).toBe(0);
  });

  it("paintNode skips a token that becomes zero-length after clipping", () => {
    const painter = createHighlightPainter(1);
    // Window is [10, 10) (empty); the token overlaps its bounds but clips to nothing.
    const created = painter.paintNode(
      {} as Text,
      [{ start: 8, end: 12, scope: "keyword" }],
      10,
      0,
    );
    expect(created).toHaveLength(0);
  });

  it("clear removes exactly this instance's registrations, leaving a coexisting instance untouched", () => {
    const painterA = createHighlightPainter(1);
    const painterB = createHighlightPainter(2);
    painterA.highlightFor("keyword");
    painterB.highlightFor("keyword");
    expect(registrations.has("hljs-1-keyword")).toBe(true);
    expect(registrations.has("hljs-2-keyword")).toBe(true);

    painterA.clear();

    expect(registrations.has("hljs-1-keyword")).toBe(false);
    expect(registrations.has("hljs-2-keyword")).toBe(true);
  });
});
