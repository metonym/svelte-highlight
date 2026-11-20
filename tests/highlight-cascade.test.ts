import type { ScopeEvent } from "../src/engine.js";
import {
  cascadeHighlightStyle,
  cascadeRanges,
  createThemeCascade,
} from "../src/highlight-cascade.js";

const text = (v: string): ScopeEvent => ({ t: 0, v });
const open = (s: string): ScopeEvent => ({ t: 1, s });
const close: ScopeEvent = { t: 2 };

/** `[text, color, background]` for each painted range of `events`. */
function paint(
  theme: Parameters<typeof createThemeCascade>[0],
  events: ScopeEvent[],
  outside?: string,
) {
  const source = events.map((event) => (event.t === 0 ? event.v : "")).join("");
  const { ranges, styles } = cascadeRanges(
    events,
    createThemeCascade(theme, outside ? () => outside : undefined),
  );
  return ranges.map((range) => {
    const style = styles[Number(range.scope.slice(1))];
    return [
      source.slice(range.start, range.end),
      style?.color,
      style?.background,
    ];
  });
}

// The engine scope `title.function` gets the classes `hljs-title function_`.
const fn = [open("title.function"), text("load"), close];

describe("createThemeCascade", () => {
  it("applies a compound rule to a compound scope", () => {
    const theme = ".hljs-title{color:red}.hljs-title.function_{color:blue}";
    expect(paint(theme, fn)).toEqual([["load", "blue", undefined]]);
  });

  it("falls back to the base scope's rule without a compound rule", () => {
    expect(paint(".hljs-title{color:red}", fn)).toEqual([
      ["load", "red", undefined],
    ]);
  });

  it("matches descendant rules and inherits through unstyled scopes", () => {
    const theme =
      ".hljs-meta{color:gray}.hljs-meta .hljs-keyword{color:purple}";
    const events = [
      open("meta"),
      text("#"),
      open("keyword"),
      text("include"),
      close,
      open("string"),
      text("<x>"),
      close,
      close,
    ];
    expect(paint(theme, events)).toEqual([
      ["#", "gray", undefined],
      ["include", "purple", undefined],
      ["<x>", "gray", undefined],
    ]);
  });

  it("puts a token's text on its nearest painted ancestor's background", () => {
    const theme = ".hljs-addition{background:#e6ffed}.hljs-string{color:red}";
    const events = [
      open("addition"),
      open("string"),
      text('"a"'),
      close,
      close,
    ];
    expect(paint(theme, events)).toEqual([['"a"', "red", "#e6ffed"]]);
  });

  it("replaces currentColor with the inherited color", () => {
    const theme =
      ".hljs{color:#111}.hljs-comment{color:green}.hljs-doctag{color:color-mix(in srgb,currentColor,orange)}";
    const events = [
      open("comment"),
      open("doctag"),
      text("@param"),
      close,
      close,
    ];
    expect(paint(theme, events)).toEqual([
      ["@param", "color-mix(in srgb,green,orange)", undefined],
    ]);
    // With no `.hljs` color, currentColor is the page's color.
    expect(
      paint(
        ".hljs-code{color:color-mix(in srgb,currentColor,orange)}",
        [open("code"), text("x"), close],
        "rgb(1, 2, 3)",
      ),
    ).toEqual([["x", "color-mix(in srgb,rgb(1, 2, 3),orange)", undefined]]);
  });

  it("treats a palette var set to a CSS-wide keyword as unset", () => {
    const palette = {
      vars: { "--shl-attr": "#0a0", "--shl-tag-attr": "inherit" },
    } as unknown as Parameters<typeof createThemeCascade>[0];
    const events = [open("tag"), open("attr"), text("href"), close, close];
    expect(paint(palette, events)).toEqual([["href", "#0a0", undefined]]);
  });
});

describe("cascadeHighlightStyle", () => {
  it("writes one ::highlight() rule per style", () => {
    expect(
      cascadeHighlightStyle(
        [
          { key: "a", color: "red" },
          { key: "b", background: "#fff" },
        ],
        "hljs-highlight-1",
      ),
    ).toBe(
      "<style>::highlight(hljs-highlight-1-c0){color:red}::highlight(hljs-highlight-1-c1){background-color:#fff}</style>",
    );
  });
});
