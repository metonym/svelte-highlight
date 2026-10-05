import {
  type FakeElement,
  type FakeNode,
  type FakeRange,
  FakeText,
  h,
  installFakeDom,
} from "../bench/_fake-search-dom.ts";
import { highlightMatches } from "../src/search.js";

type Match = { line: number; start: number; end: number };

function paint(
  root: FakeElement,
  matches: Match[],
  options: { current?: number } = {},
) {
  return highlightMatches(root as unknown as Element, matches, options);
}

/** `pre > code` with one `<span data-line>` row of token spans per line. */
function rows(lines: string[][]) {
  const code = h("code");
  lines.forEach((tokens, i) => {
    if (i > 0) code.appendChild(new FakeText("\n"));
    code.appendChild(
      h(
        "span",
        { dataset: { line: String(i) } },
        ...tokens.map((t) => h("span", {}, t)),
      ),
    );
  });
  return h("pre", {}, code);
}

/** `pre > code` of token spans with no row elements. */
function flat(lines: string[][]) {
  const code = h("code");
  lines.forEach((tokens, i) => {
    if (i > 0) code.appendChild(new FakeText("\n"));
    for (const t of tokens) code.appendChild(h("span", {}, t));
  });
  return h("pre", {}, code);
}

function describeRange(range: FakeRange) {
  const text = (node: FakeNode | null) => (node as FakeText).data;
  return `${text(range.startContainer)}@${range.startOffset}..${text(range.endContainer)}@${range.endOffset}`;
}

function serialize(node: FakeNode): string {
  if (node instanceof FakeText) return node.data;
  const el = node as FakeElement;
  const inner = el.childNodes.map(serialize).join("");
  if (el.localName !== "mark") return inner;
  return "shlSearchCurrent" in el.dataset ? `{${inner}}` : `[${inner}]`;
}

describe("highlightMatches with CSS.highlights", () => {
  it("resolves ranges in [data-line] rows", () => {
    const registry = installFakeDom();
    const root = rows([
      ["const ", "foo", " = ", "1"],
      ["foo", "(", "foo", ")"],
    ]);
    paint(
      root,
      [
        { line: 0, start: 6, end: 9 },
        { line: 1, start: 0, end: 3 },
        { line: 1, start: 4, end: 7 },
      ],
      { current: 1 },
    );
    expect([...(registry.get("shl-search") ?? [])].map(describeRange)).toEqual([
      "const @6..foo@3",
      "(@1..foo@3",
    ]);
    expect(
      [...(registry.get("shl-search-current") ?? [])].map(describeRange),
    ).toEqual(["foo@0..foo@3"]);
  });

  it("puts an offset on a node seam at the end of the earlier node", () => {
    const registry = installFakeDom();
    paint(rows([["ab", "cd", "ef"]]), [{ line: 0, start: 2, end: 4 }]);
    expect([...(registry.get("shl-search") ?? [])].map(describeRange)).toEqual([
      "ab@2..cd@2",
    ]);
  });

  it("resolves <code> fallback offsets across lines in one container", () => {
    const registry = installFakeDom();
    const root = flat([
      ["let ", "a"],
      ["let ", "b"],
      ["let ", "c"],
    ]);
    paint(root, [
      { line: 2, start: 4, end: 5 },
      { line: 0, start: 0, end: 3 },
      { line: 1, start: 4, end: 5 },
      { line: 7, start: 0, end: 1 },
    ]);
    // Range order follows first appearance of each line in `matches`.
    expect([...(registry.get("shl-search") ?? [])].map(describeRange)).toEqual([
      "let @4..c@1",
      "let @0..let @3",
      "let @4..b@1",
    ]);
  });

  it("falls back to the line-th .line element", () => {
    const registry = installFakeDom();
    const root = h(
      "pre",
      {},
      h(
        "code",
        {},
        h("span", { className: "line" }, "one"),
        "\n",
        h("span", { className: "line" }, "two"),
      ),
    );
    paint(root, [{ line: 1, start: 1, end: 3 }]);
    expect([...(registry.get("shl-search") ?? [])].map(describeRange)).toEqual([
      "two@1..two@3",
    ]);
  });
});

describe("highlightMatches <mark> fallback", () => {
  it("wraps matches spanning token spans in [data-line] rows", () => {
    installFakeDom({ highlights: false });
    const root = rows([
      ["const ", "foo", " = ", "1"],
      ["foo", "(", "foo", ")"],
    ]);
    const { dispose } = paint(
      root,
      [
        { line: 0, start: 4, end: 8 },
        { line: 1, start: 0, end: 3 },
        { line: 1, start: 4, end: 7 },
      ],
      { current: 2 },
    );
    expect(serialize(root)).toBe("cons[t ][fo]o = 1\n[foo]({foo})");
    dispose();
    expect(serialize(root)).toBe("const foo = 1\nfoo(foo)");
    expect(root.querySelectorAll("mark")).toEqual([]);
  });

  it("wraps <code> fallback matches across lines", () => {
    installFakeDom({ highlights: false });
    const root = flat([
      ["let ", "a"],
      ["let ", "b"],
    ]);
    paint(root, [
      { line: 0, start: 2, end: 5 },
      { line: 1, start: 0, end: 5 },
    ]);
    expect(serialize(root)).toBe("le[t ][a]\n[let ][b]");
  });

  it("keeps the original text node holding the text before the first mark", () => {
    installFakeDom({ highlights: false });
    const root = flat([["abcdef"], ["abcdef"]]);
    const first = (root.querySelector("span") as FakeElement)
      .firstChild as FakeText;
    paint(root, [
      { line: 0, start: 1, end: 2 },
      { line: 0, start: 4, end: 5 },
    ]);
    expect(first.data).toBe("a");
    expect(serialize(root)).toBe("a[b]cd[e]f\nabcdef");
  });

  it("still nests overlapping matches the way a per-match wrap does", () => {
    installFakeDom({ highlights: false });
    const root = rows([["abcdef"]]);
    paint(root, [
      { line: 0, start: 1, end: 4 },
      { line: 0, start: 2, end: 5 },
    ]);
    expect(serialize(root)).toBe("a[b][[cd]e]f");
  });

  it("handles <code> fallback lines around rendered rows", () => {
    installFakeDom({ highlights: false });
    // Only row 1 is rendered as a [data-line] row; line 0 falls back to
    // offsets into the whole <code>, which contains that row.
    const code = h(
      "code",
      {},
      h("span", {}, "abc"),
      "\n",
      h("span", { dataset: { line: "1" } }, h("span", {}, "def")),
    );
    const root = h("pre", {}, code);
    paint(root, [
      { line: 0, start: 1, end: 2 },
      { line: 1, start: 0, end: 2 },
    ]);
    expect(serialize(root)).toBe("a[b]c\n[de]f");
  });

  it("keeps line order when a fallback span covers a row's match", () => {
    installFakeDom({ highlights: false });
    // Line 1 is a row; lines 0 and 2 fall back to the whole <code>. Line
    // 0's span runs past its end into row 1 and over row 1's match, so
    // which <mark> ends up outside depends on wrap order: row 1 (second
    // in `matches`, and current) wraps before line 0 (third).
    const code = h(
      "code",
      {},
      "a\n",
      h("span", { dataset: { line: "1" } }, "bcd"),
      "\nef",
    );
    const root = h("pre", {}, code);
    paint(
      root,
      [
        { line: 2, start: 0, end: 1 },
        { line: 1, start: 0, end: 2 },
        { line: 0, start: 0, end: 4 },
      ],
      { current: 1 },
    );
    expect(serialize(root)).toBe("[a\n]{[bc]}d\n[e]f");
  });
});
