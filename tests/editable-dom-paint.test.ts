import {
  createDomLinePainter,
  isPureAppend,
  lineHtmlFromEvents,
} from "../src/editable-dom-paint.js";
import { createRegistry, registerAll } from "../src/engine.js";
import {
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import * as languages from "../src/languages/index.js";

const registry = createRegistry();
for (const language of Object.values(languages))
  registerAll(registry, language);

function eventsFor(code: string) {
  return registry.tokenize(code, "javascript").events;
}

describe("isPureAppend", () => {
  it("accepts growth at the end only", () => {
    expect(isPureAppend("ab", "abc")).toBe(true);
    expect(isPureAppend("", "x")).toBe(true);
    expect(isPureAppend("ab", "ab")).toBe(true);
  });

  it("rejects mid-document edits and deletes", () => {
    expect(isPureAppend("abc", "ab")).toBe(false);
    expect(isPureAppend("abc", "xabc")).toBe(false);
    expect(isPureAppend("abc", "axc")).toBe(false);
  });
});

describe("createDomLinePainter", () => {
  it("matches the historical renderHtml+splitLines path on a one-shot paint", () => {
    const code = "function add(a, b) {\n  return a + b;\n}\n";
    const painter = createDomLinePainter({ registry });
    const events = eventsFor(code);
    // First paint is a pure append from "" → code, still must match historical.
    expect(painter.paint(events, code, "javascript")).toEqual(
      lineHtmlFromEvents(events, code),
    );
  });

  it("uses the incremental path across pure appends and matches full paint", () => {
    const painter = createDomLinePainter({ registry });
    let state = parseIncremental(registry, "javascript", "");
    let code = "";

    const steps = [
      "function greet(name) {\n",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: this is JS *source text* fed to the tokenizer, not a template literal to evaluate
      "  const msg = `hi ${name}`;\n",
      "  return msg;\n",
      "}\n",
      "console.log(greet('ada'));\n",
    ];

    for (const chunk of steps) {
      code += chunk;
      state = reparseIncremental(registry, "javascript", state, code);
      const lines = painter.paint(state.events, code, "javascript");
      expect(lines).toEqual(lineHtmlFromEvents(state.events, code));
    }
    expect(painter.lastUsedIncremental()).toBe(true);
  });

  it("falls back to a full rebuild after a mid-document edit", () => {
    const painter = createDomLinePainter({ registry });
    let code = "const a = 1;\nconst b = 2;\n";
    let state = parseIncremental(registry, "javascript", code);
    painter.paint(state.events, code, "javascript");

    code = "const a = 99;\nconst b = 2;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    const lines = painter.paint(state.events, code, "javascript");
    expect(lines).toEqual(lineHtmlFromEvents(state.events, code));
    expect(painter.lastUsedIncremental()).toBe(false);
  });

  it("character-by-character append stays equivalent to full paint", () => {
    const painter = createDomLinePainter({ registry });
    const target =
      "export function sum(xs) {\n  return xs.reduce((a, b) => a + b, 0);\n}\n";
    let state = parseIncremental(registry, "javascript", "");
    let code = "";
    for (let i = 1; i <= target.length; i++) {
      code = target.slice(0, i);
      state = reparseIncremental(registry, "javascript", state, code);
      const lines = painter.paint(state.events, code, "javascript");
      expect(lines).toEqual(lineHtmlFromEvents(state.events, code));
    }
    expect(painter.lastUsedIncremental()).toBe(true);
  });

  it("resumes incremental paint after append → mid-edit → append", () => {
    const painter = createDomLinePainter({ registry });
    let code = "const a = 1;\n";
    let state = parseIncremental(registry, "javascript", code);
    expect(painter.paint(state.events, code, "javascript")).toEqual(
      lineHtmlFromEvents(state.events, code),
    );

    code += "const b = 2;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(painter.paint(state.events, code, "javascript")).toEqual(
      lineHtmlFromEvents(state.events, code),
    );
    expect(painter.lastUsedIncremental()).toBe(true);

    code = "const a = 99;\nconst b = 2;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(painter.paint(state.events, code, "javascript")).toEqual(
      lineHtmlFromEvents(state.events, code),
    );
    expect(painter.lastUsedIncremental()).toBe(false);

    code += "const c = 3;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(painter.paint(state.events, code, "javascript")).toEqual(
      lineHtmlFromEvents(state.events, code),
    );

    code += "console.log(a + b + c);\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(painter.paint(state.events, code, "javascript")).toEqual(
      lineHtmlFromEvents(state.events, code),
    );
    expect(painter.lastUsedIncremental()).toBe(true);
  });

  it("does not call session.append on every mid-document edit", () => {
    let appendCount = 0;
    const createSession = registry.createSession.bind(registry);
    registry.createSession = ((...args: Parameters<typeof createSession>) => {
      const session = createSession(...args);
      const append = session.append.bind(session);
      session.append = (chunk: string) => {
        appendCount++;
        return append(chunk);
      };
      return session;
    }) as typeof registry.createSession;

    try {
      const painter = createDomLinePainter({ registry });
      let code = "const a = 1;\nconst b = 2;\nconst c = 3;\n";
      painter.paint(eventsFor(code), code, "javascript");
      const appendsAfterInit = appendCount;
      expect(appendsAfterInit).toBeGreaterThan(0);

      // Use one-shot tokenize (not reparseIncremental) so the spy only
      // observes painter-driven createSession/append calls.
      for (let i = 0; i < 20; i++) {
        code = `const a = ${i};\nconst b = 2;\nconst c = 3;\n`;
        const events = eventsFor(code);
        const lines = painter.paint(events, code, "javascript");
        expect(lines).toEqual(lineHtmlFromEvents(events, code));
      }
      // Mid-edits must not eagerly resync (createSession + append per keystroke).
      expect(appendCount).toBe(appendsAfterInit);
    } finally {
      registry.createSession = createSession;
    }
  });
});
