import {
  createDomLinePainter,
  isPureAppend,
  lineHtmlFromEvents,
  patchLineHtml,
} from "../src/editable-dom-paint.js";
import { createRegistry, registerAll } from "../src/engine.js";
import {
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import * as languages from "../src/languages/index.js";
import { CUSTOM_SNIPPETS } from "./differential-corpus.ts";

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

describe("patchLineHtml", () => {
  // Deterministic PRNG so failures reproduce.
  function rng(seed: number) {
    let state = seed;
    return () => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  const inserts = [
    "x",
    "\n",
    "/*",
    "*/",
    "`",
    "${",
    "}",
    '"',
    "'",
    "// ",
    "<div>",
    "</div>",
    "\n\n",
    "return a;\n",
    "<!--",
    "-->",
    "```",
  ];

  function fuzz(languageName: string, base: string, seed: number) {
    const random = rng(seed);
    const painter = createDomLinePainter({ registry });
    let code = base;
    let state = parseIncremental(registry, languageName, code);
    painter.paint(state.events, code, languageName);
    for (let step = 0; step < 60; step++) {
      const at = Math.floor(random() * code.length);
      if (random() < 0.35 && code.length > 0) {
        const length = 1 + Math.floor(random() * 4);
        code = code.slice(0, at) + code.slice(at + length);
      } else {
        const text = inserts[Math.floor(random() * inserts.length)] as string;
        code = code.slice(0, at) + text + code.slice(at);
      }
      state = reparseIncremental(registry, languageName, state, code);
      const lines = painter.paint(state.events, code, languageName);
      expect(lines).toEqual(lineHtmlFromEvents(state.events, code));
    }
  }

  it("matches a full repaint across random mid-document edits", () => {
    const js =
      // biome-ignore lint/suspicious/noTemplateCurlyInString: JS *source text* fed to the tokenizer
      "function add(a, b) {\n  // sum\n  return `${a + b}`;\n}\n/* block\ncomment */\nconst s = 'x';\n".repeat(
        6,
      );
    for (let seed = 1; seed <= 12; seed++) fuzz("javascript", js, seed);
    for (const language of ["xml", "markdown", "css", "python", "svelte"]) {
      const snippet = CUSTOM_SNIPPETS[language] ?? js;
      for (let seed = 1; seed <= 4; seed++) fuzz(language, snippet, seed);
    }
  });

  it("re-renders through the end when different scopes reach the tail", () => {
    const tail = "\nb\nc";
    const shared = { t: 0, v: tail } as const;
    const prevEvents = [{ t: 0, v: "a" } as const, shared];
    const prevLines = lineHtmlFromEvents(prevEvents, `a${tail}`);
    // Same tail event object, but now inside an open scope.
    const events = [
      { t: 1, s: "comment" } as const,
      { t: 0, v: "a" } as const,
      shared,
      { t: 2 } as const,
    ];
    expect(patchLineHtml(prevEvents, prevLines, events, `a${tail}`)).toEqual(
      lineHtmlFromEvents(events, `a${tail}`),
    );
  });

  it("returns the previous lines when the events are unchanged", () => {
    const code = "const a = 1;\n";
    const events = eventsFor(code);
    const lines = lineHtmlFromEvents(events, code);
    expect(patchLineHtml(events, lines, events, code)).toBe(lines);
  });
});
