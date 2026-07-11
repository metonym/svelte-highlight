/**
 * Invariants for `tokenLines`, the line-indexed structured alternative to
 * `splitLines(renderHtml(events))`, plus the `Renderer` factories that wrap
 * it (and `renderHtml`/`toRanges`) as named conforming peers.
 */
import type {
  LineToken,
  Renderer,
  ScopeEvent,
  TokenRange,
} from "../src/engine.d.ts";
import {
  CLOSE,
  createHtmlRenderer,
  createLineRenderer,
  createRangeRenderer,
  createRegistry,
  OPEN,
  registerAll,
  renderHtml,
  TEXT,
  tokenLines,
  toRanges,
} from "../src/engine.js";
import * as languages from "../src/languages/index.js";
import { splitLines } from "../src/split-lines.js";
import { CUSTOM_SNIPPETS } from "./differential-corpus.ts";

const registry = createRegistry();
for (const language of Object.values(languages)) {
  registerAll(registry, language);
}

// biome-ignore lint/suspicious/noTemplateCurlyInString: literal JS source text being tokenized, not a template placeholder
const JS_TEMPLATE_LITERAL = "const x = `foo ${bar} baz`;\nconsole.log(x);\n";

const HTML_EMBEDDED_JS = "<script>\nconst x = 1;\n<\\/script>\n";

// Custom-grammar snippets from the differential corpus give broad,
// feature-dense coverage across ~40 languages for free.
const CORPUS: Record<string, string> = {
  javascript: JS_TEMPLATE_LITERAL,
  html: HTML_EMBEDDED_JS,
  ...CUSTOM_SNIPPETS,
};

function eventsFor(language: string, code: string): ScopeEvent[] {
  return registry.tokenize(code, language).events;
}

function joinLines(lines: LineToken[][]): string {
  return lines
    .map((line) => line.map((token) => token.text).join(""))
    .join("\n");
}

describe("tokenLines: losslessness (joined token text reproduces the source)", () => {
  for (const [language, code] of Object.entries(CORPUS)) {
    it(language, () => {
      const events = eventsFor(language, code);
      expect(joinLines(tokenLines(events))).toBe(code);
    });
  }
});

describe("tokenLines: line-count parity with splitLines(renderHtml(events))", () => {
  for (const [language, code] of Object.entries(CORPUS)) {
    it(language, () => {
      const events = eventsFor(language, code);
      expect(tokenLines(events).length).toBe(
        splitLines(renderHtml(events)).length,
      );
    });
  }
});

describe("tokenLines: scope correctness", () => {
  it("a template literal with interpolation nests the `subst` scope inside `string`", () => {
    const events = eventsFor("javascript", JS_TEMPLATE_LITERAL);
    const lines = tokenLines(events);

    expect(lines[0]).toEqual([
      { text: "const", scopes: ["keyword"] },
      { text: " x = ", scopes: [] },
      { text: "`foo ", scopes: ["string"] },
      // biome-ignore lint/suspicious/noTemplateCurlyInString: the literal token text, not a template placeholder
      { text: "${bar}", scopes: ["string", "subst"] },
      { text: " baz`", scopes: ["string"] },
      { text: ";", scopes: [] },
    ]);
  });

  it("an embedded sub-language nests its scopes under `language:<name>`", () => {
    const events = eventsFor("html", HTML_EMBEDDED_JS);
    const lines = tokenLines(events);

    expect(lines[0]).toEqual([
      { text: "<", scopes: ["tag"] },
      { text: "script", scopes: ["tag", "name"] },
      { text: ">", scopes: ["tag"] },
    ]);
    expect(lines[1]).toEqual([
      { text: "const", scopes: ["language:javascript", "keyword"] },
      { text: " x = ", scopes: ["language:javascript"] },
      { text: "1", scopes: ["language:javascript", "number"] },
      { text: ";", scopes: ["language:javascript"] },
    ]);
  });

  it("scope names are raw, unprefixed strings (no hljs- prefix)", () => {
    const events = eventsFor("javascript", JS_TEMPLATE_LITERAL);
    for (const line of tokenLines(events)) {
      for (const token of line) {
        for (const scope of token.scopes) {
          expect(scope.startsWith("hljs-")).toBe(false);
        }
      }
    }
  });
});

describe("tokenLines: edge cases", () => {
  it('empty events array is a single empty line, matching splitLines("")', () => {
    expect(tokenLines([])).toEqual([[]]);
    expect(tokenLines([]).length).toBe(splitLines(renderHtml([])).length);
  });

  it("a single newline produces two empty lines", () => {
    const events: ScopeEvent[] = [{ t: TEXT, v: "\n" }];
    expect(tokenLines(events)).toEqual([[], []]);
    expect(tokenLines(events).length).toBe(
      splitLines(renderHtml(events)).length,
    );
  });

  it("a trailing newline produces a trailing empty line", () => {
    const events: ScopeEvent[] = [{ t: TEXT, v: "a\n" }];
    expect(tokenLines(events)).toEqual([[{ text: "a", scopes: [] }], []]);
    expect(tokenLines(events).length).toBe(
      splitLines(renderHtml(events)).length,
    );
  });

  it("CRLF: the CR lands on the preceding line's trailing token, matching splitLines", () => {
    const events: ScopeEvent[] = [{ t: TEXT, v: "a\r\nb" }];
    expect(tokenLines(events)).toEqual([
      [{ text: "a\r", scopes: [] }],
      [{ text: "b", scopes: [] }],
    ]);
    expect(tokenLines(events).length).toBe(
      splitLines(renderHtml(events)).length,
    );
    expect(joinLines(tokenLines(events))).toBe("a\r\nb");
  });

  it("a line with no tokens between two full lines is an empty array", () => {
    const events: ScopeEvent[] = [
      { t: TEXT, v: "a\n" },
      { t: OPEN, s: "keyword" },
      { t: TEXT, v: "b" },
      { t: CLOSE },
      { t: TEXT, v: "\nc" },
    ];
    const lines = tokenLines(events);
    expect(lines).toEqual([
      [{ text: "a", scopes: [] }],
      [{ text: "b", scopes: ["keyword"] }],
      [{ text: "c", scopes: [] }],
    ]);
  });

  it("adjacent text under an identical scope stack may be merged into one token", () => {
    const events: ScopeEvent[] = [
      { t: OPEN, s: "keyword" },
      { t: TEXT, v: "foo" },
      { t: TEXT, v: "bar" },
      { t: CLOSE },
    ];
    expect(tokenLines(events)).toEqual([
      [{ text: "foobar", scopes: ["keyword"] }],
    ]);
  });

  it("zero-length tokens are never emitted", () => {
    const events: ScopeEvent[] = [
      { t: TEXT, v: "" },
      { t: OPEN, s: "keyword" },
      { t: TEXT, v: "" },
      { t: CLOSE },
      { t: TEXT, v: "a" },
    ];
    expect(tokenLines(events)).toEqual([[{ text: "a", scopes: [] }]]);
  });
});

describe("Renderer factories", () => {
  const events = eventsFor("javascript", JS_TEMPLATE_LITERAL);

  it("createHtmlRenderer matches renderHtml", () => {
    const renderer: Renderer<string> = createHtmlRenderer();
    expect(renderer.render(events)).toBe(renderHtml(events));
  });

  it("createHtmlRenderer forwards options to renderHtml", () => {
    const renderer: Renderer<string> = createHtmlRenderer({
      classPrefix: "x-",
    });
    expect(renderer.render(events)).toBe(
      renderHtml(events, { classPrefix: "x-" }),
    );
  });

  it("createRangeRenderer matches toRanges", () => {
    const renderer: Renderer<TokenRange[]> = createRangeRenderer();
    expect(renderer.render(events)).toEqual(toRanges(events));
  });

  it("createLineRenderer matches tokenLines", () => {
    const renderer: Renderer<LineToken[][]> = createLineRenderer();
    expect(renderer.render(events)).toEqual(tokenLines(events));
  });
});
