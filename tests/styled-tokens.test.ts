import { createRegistry, registerAll, tokenLines } from "../src/engine.js";
import type { ScopeEvent } from "../src/engine.js";
import diff from "../src/languages/diff.js";
import rust from "../src/languages/rust.js";
import githubCss from "../src/styles/github.js";
import github from "../src/themes/github.js";
import { createTokenStyler, styleTokens } from "../src/styled-tokens.js";

const text = (v: string): ScopeEvent => ({ t: 0, v });
const open = (s: string): ScopeEvent => ({ t: 1, s });
const close: ScopeEvent = { t: 2 };

const registry = createRegistry();
registerAll(registry, rust);
registerAll(registry, diff);

const RUST = [
  "/// Adds one.",
  "fn add(x: u32) -> u32 {",
  '    println!("{x}");',
  "    x + 1",
  "}",
  "",
].join("\n");

/** Each token as `[text, ...set style fields]`, without scopes. */
function flat(lines: ReturnType<typeof styleTokens>["lines"]) {
  return lines.map((line) => line.map(({ scopes: _, ...rest }) => rest));
}

describe("styleTokens", () => {
  const { events } = registry.highlight(RUST, { language: "rust" });

  it("splits text and scopes exactly like tokenLines", () => {
    const styled = styleTokens(events, github).lines;
    const plain = tokenLines(events);
    expect(
      styled.map((line) => line.map(({ text, scopes }) => ({ text, scopes }))),
    ).toEqual(plain);
  });

  it("styles a palette and its theme CSS the same", () => {
    expect(styleTokens(events, github)).toEqual(styleTokens(events, githubCss));
  });

  it("returns the block colors and every token's full color", () => {
    const { foreground, background, lines } = styleTokens(events, github);
    expect(foreground).toBe("#24292e");
    expect(background).toBe("#ffffff");
    expect(flat(lines)[1]?.slice(0, 3)).toEqual([
      { text: "fn", color: "#d73a49" },
      { text: " ", color: "#24292e" },
      { text: "add", color: "#6f42c1" },
    ]);
  });

  it("gives a token a background only when it paints its own", () => {
    const { events } = registry.highlight("+new\n same", { language: "diff" });
    const { lines } = styleTokens(events, github);
    expect(lines[0]?.[0]).toMatchObject({
      text: "+new",
      background: "#f0fff4",
    });
    expect(lines[1]?.[0]?.background).toBeUndefined();
  });

  it("keeps a trailing empty line, like tokenLines", () => {
    expect(styleTokens([text("a\n")], ".hljs{color:red}").lines).toEqual([
      [{ text: "a", scopes: [], color: "red" }],
      [],
    ]);
    expect(styleTokens([], ".hljs{color:red}").lines).toEqual([[]]);
  });
});

describe("font styles", () => {
  const style = (css: string, events: ScopeEvent[]) =>
    flat(styleTokens(events, css).lines)[0];

  it("reads bold, italic, underline and strikethrough", () => {
    const css = [
      ".hljs-strong{font-weight:bold}",
      ".hljs-emphasis{font-style:italic}",
      ".hljs-link{text-decoration:underline}",
      ".hljs-deletion{text-decoration-line:line-through}",
    ].join("");
    const events = ["strong", "emphasis", "link", "deletion"].flatMap(
      (scope) => [open(scope), text(scope), close],
    );
    expect(style(css, events)).toEqual([
      { text: "strong", bold: true },
      { text: "emphasis", italic: true },
      { text: "link", underline: true },
      { text: "deletion", strikethrough: true },
    ]);
  });

  it("treats numeric weights of 600 and up as bold", () => {
    const events = [open("a"), text("a"), close, open("b"), text("b"), close];
    expect(
      style(".hljs-a{font-weight:700}.hljs-b{font-weight:400}", events),
    ).toEqual([{ text: "a", bold: true }, { text: "b" }]);
  });

  it("inherits weight and style, and lets a descendant reset them", () => {
    const css =
      ".hljs-meta{font-weight:bold;font-style:italic}.hljs-meta .hljs-string{font-weight:normal}";
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
    expect(style(css, events)).toEqual([
      { text: "#", bold: true, italic: true },
      { text: "include", bold: true, italic: true },
      { text: "<x>", italic: true },
    ]);
  });

  it("draws an ancestor's underline under descendants that set none", () => {
    const css =
      ".hljs-link{text-decoration:underline}.hljs-string{text-decoration:none}";
    const events = [open("link"), open("string"), text("x"), close, close];
    expect(style(css, events)).toEqual([{ text: "x", underline: true }]);
  });

  it("falls back to the parent's value when a var() can't resolve", () => {
    const css =
      ".hljs{font-weight:bold}.hljs-keyword{font-weight:var(--missing)}";
    expect(style(css, [open("keyword"), text("fn"), close])).toEqual([
      { text: "fn", bold: true },
    ]);
  });

  it("matches the shipped themes' fonts for a palette and its CSS", async () => {
    const md = (await import("../src/languages/markdown.js")).default;
    const local = createRegistry();
    registerAll(local, md);
    const { events } = local.highlight("*em* **strong** [a](b)", {
      language: "markdown",
    });
    const palette = styleTokens(events, github).lines.flat();
    const scoped = (scope: string) =>
      palette.find((t) => t.scopes.includes(scope));
    expect(scoped("emphasis")).toMatchObject({ italic: true });
    expect(scoped("strong")).toMatchObject({ bold: true });
    expect(styleTokens(events, githubCss).lines.flat()).toEqual(palette);
  });
});

describe("the color option", () => {
  it("colors text a theme leaves uncolored", () => {
    const { foreground, lines } = styleTokens(
      [text("a"), open("keyword"), text("b"), close],
      ".hljs-keyword{color:blue}",
      { color: "white" },
    );
    expect(foreground).toBe("white");
    expect(flat(lines)[0]).toEqual([
      { text: "a", color: "white" },
      { text: "b", color: "blue" },
    ]);
  });

  it("resolves currentColor against it", () => {
    const { lines } = styleTokens(
      [open("keyword"), text("b"), close],
      ".hljs-keyword{background:currentColor}",
      { color: "white" },
    );
    expect(flat(lines)[0]).toEqual([
      { text: "b", color: "white", background: "white" },
    ]);
  });
});

describe("createTokenStyler", () => {
  it("styles many event streams with one resolved theme", () => {
    const styler = createTokenStyler(github);
    const a = registry.highlight("fn a() {}", { language: "rust" }).events;
    const b = registry.highlight("let b = 1;", { language: "rust" }).events;
    expect(styler.lines(a)).toEqual(styleTokens(a, github).lines);
    expect(styler.lines(b)).toEqual(styleTokens(b, github).lines);
    expect(styler.lines(a)).toEqual(styleTokens(a, github).lines);
    expect([styler.foreground, styler.background]).toEqual([
      "#24292e",
      "#ffffff",
    ]);
  });
});
