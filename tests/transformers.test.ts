import { createRegistry, renderHtml, TEXT } from "../src/engine.js";
import javascript from "../src/languages/javascript.js";
import {
  markLines,
  markPattern,
  markWhitespace,
  transformEvents,
} from "../src/transformers.js";

const registry = createRegistry();
registry.register(javascript.register);

describe("transformEvents", () => {
  it("is a no-op with no transforms", () => {
    const { events } = registry.tokenize("const x = 1;", "javascript");
    expect(transformEvents(events, [])).toEqual(events);
  });
});

describe("markPattern", () => {
  it("wraps exactly one match, preserving TEXT concatenation", () => {
    const { events } = registry.tokenize("const x = 1;", "javascript");
    const before = events
      .filter((e) => e.t === TEXT)
      .map((e) => e.v)
      .join("");

    const out = markPattern(/\bconst\b/g, "kw")(events);
    const after = out
      .filter((e) => e.t === TEXT)
      .map((e) => e.v)
      .join("");
    expect(after).toBe(before);

    const opens = out.filter((e) => e.t === 1 && e.s === "kw");
    expect(opens).toHaveLength(1);
  });

  it("throws on a non-global pattern", () => {
    expect(() => markPattern(/const/, "kw")).toThrow();
  });
});

describe("markWhitespace", () => {
  it("marks a tab and trailing spaces", () => {
    const events = [{ t: TEXT, v: "a\t\nb  \n" } as const];
    const out = markWhitespace()(events);

    const tabOpens = out.filter((e) => e.t === 1 && e.s === "ws-tab");
    const trailingOpens = out.filter((e) => e.t === 1 && e.s === "ws-trailing");
    expect(tabOpens.length).toBeGreaterThanOrEqual(1);
    expect(trailingOpens.length).toBeGreaterThanOrEqual(1);

    const text = out
      .filter((e) => e.t === TEXT)
      .map((e) => e.v)
      .join("");
    expect(text).toBe("a\t\nb  \n");
  });
});

describe("markLines", () => {
  it("is a no-op with no decorated lines", () => {
    const { events } = registry.tokenize("const x = 1;", "javascript");
    expect(markLines({})(events)).toEqual(events);
  });

  it("stays balanced and resumes a scope spanning into a decorated line", () => {
    const code = "/* block\n   comment */\nconsole.log(3);\n";
    const { events } = registry.tokenize(code, "javascript");

    const out = markLines({ 2: "mark" })(events);

    // TEXT concatenation is preserved.
    const before = events
      .filter((e) => e.t === TEXT)
      .map((e) => e.v)
      .join("");
    const after = out
      .filter((e) => e.t === TEXT)
      .map((e) => e.v)
      .join("");
    expect(after).toBe(before);

    // stack-depth walker never goes negative, ends at 0
    let depth = 0;
    for (const ev of out) {
      if (ev.t === 1) depth++;
      else if (ev.t === 2) {
        depth--;
        expect(depth).toBeGreaterThanOrEqual(0);
      }
    }
    expect(depth).toBe(0);

    // line 2 is wrapped, with the comment scope resumed inside it
    const html = renderHtml(out);
    expect(html).toContain('<span class="hljs-mark">');
    const markStart = html.indexOf('<span class="hljs-mark">');
    const afterMark = html.slice(
      markStart,
      markStart + '<span class="hljs-mark">'.length + 40,
    );
    expect(afterMark).toContain('<span class="hljs-comment">');
  });
});
