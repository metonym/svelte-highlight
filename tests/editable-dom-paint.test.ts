import {
  createDomLinePainter,
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

describe("createDomLinePainter", () => {
  it("matches the historical renderHtml+splitLines path on a one-shot paint", () => {
    const code = "function add(a, b) {\n  return a + b;\n}\n";
    const painter = createDomLinePainter();
    const events = eventsFor(code);
    // First paint is a pure append from "" → code, still must match historical.
    expect(painter.paint(events, code, "javascript")).toEqual(
      lineHtmlFromEvents(events, code),
    );
  });

  it("patches across pure appends and matches full paint", () => {
    const painter = createDomLinePainter();
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
      const lines = painter.paint(
        state.events,
        code,
        "javascript",
        state.reuse,
      );
      expect(lines).toEqual(lineHtmlFromEvents(state.events, code));
    }
  });

  it("matches full paint after a mid-document edit", () => {
    const painter = createDomLinePainter();
    let code = "const a = 1;\nconst b = 2;\n";
    let state = parseIncremental(registry, "javascript", code);
    painter.paint(state.events, code, "javascript", state.reuse);

    code = "const a = 99;\nconst b = 2;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    const lines = painter.paint(state.events, code, "javascript", state.reuse);
    expect(lines).toEqual(lineHtmlFromEvents(state.events, code));
  });

  it("character-by-character append stays equivalent to full paint", () => {
    const painter = createDomLinePainter();
    const target =
      "export function sum(xs) {\n  return xs.reduce((a, b) => a + b, 0);\n}\n";
    let state = parseIncremental(registry, "javascript", "");
    let code = "";
    for (let i = 1; i <= target.length; i++) {
      code = target.slice(0, i);
      state = reparseIncremental(registry, "javascript", state, code);
      const lines = painter.paint(
        state.events,
        code,
        "javascript",
        state.reuse,
      );
      expect(lines).toEqual(lineHtmlFromEvents(state.events, code));
    }
  });

  it("matches full paint across append → mid-edit → append", () => {
    const painter = createDomLinePainter();
    let code = "const a = 1;\n";
    let state = parseIncremental(registry, "javascript", code);
    expect(
      painter.paint(state.events, code, "javascript", state.reuse),
    ).toEqual(lineHtmlFromEvents(state.events, code));

    code += "const b = 2;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(
      painter.paint(state.events, code, "javascript", state.reuse),
    ).toEqual(lineHtmlFromEvents(state.events, code));

    code = "const a = 99;\nconst b = 2;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(
      painter.paint(state.events, code, "javascript", state.reuse),
    ).toEqual(lineHtmlFromEvents(state.events, code));

    code += "const c = 3;\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(
      painter.paint(state.events, code, "javascript", state.reuse),
    ).toEqual(lineHtmlFromEvents(state.events, code));

    code += "console.log(a + b + c);\n";
    state = reparseIncremental(registry, "javascript", state, code);
    expect(
      painter.paint(state.events, code, "javascript", state.reuse),
    ).toEqual(lineHtmlFromEvents(state.events, code));
  });

  it("never tokenizes: the first paint and later edits reuse the parse", () => {
    let sessions = 0;
    const createSession = registry.createSession.bind(registry);
    registry.createSession = ((...args: Parameters<typeof createSession>) => {
      sessions++;
      return createSession(...args);
    }) as typeof registry.createSession;

    try {
      const painter = createDomLinePainter();
      let code = "const a = 1;\nconst b = 2;\nconst c = 3;\n";
      const events = eventsFor(code);
      painter.paint(events, code, "javascript");
      for (const next of ["const a = 9;\n", "const d = 4;\n"]) {
        code = next === "const d = 4;\n" ? code + next : next + code;
        const nextEvents = eventsFor(code);
        expect(painter.paint(nextEvents, code, "javascript")).toEqual(
          lineHtmlFromEvents(nextEvents, code),
        );
      }
      expect(sessions).toBe(0);
    } finally {
      registry.createSession = createSession;
    }
  });

  it("repaints from scratch after a language change or reset", () => {
    const painter = createDomLinePainter();
    const code = "x = 1\n";
    painter.paint(eventsFor(code), code, "javascript");
    const python = registry.tokenize(code, "python").events;
    expect(painter.paint(python, code, "python")).toEqual(
      lineHtmlFromEvents(python, code),
    );
    painter.reset();
    const js = eventsFor(code);
    expect(painter.paint(js, code, "javascript")).toEqual(
      lineHtmlFromEvents(js, code),
    );
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

  function fuzz(
    languageName: string,
    base: string,
    seed: number,
    withReuse = true,
  ) {
    const random = rng(seed);
    const painter = createDomLinePainter();
    let code = base;
    let state = parseIncremental(registry, languageName, code);
    painter.paint(state.events, code, languageName);
    let at = 0;
    for (let step = 0; step < 60; step++) {
      // Half the edits land near the last one, like typing in one spot.
      at =
        random() < 0.5
          ? Math.min(
              code.length,
              Math.max(0, at + Math.floor(random() * 5) - 2),
            )
          : Math.floor(random() * code.length);
      if (random() < 0.35 && code.length > 0) {
        const length = 1 + Math.floor(random() * 4);
        code = code.slice(0, at) + code.slice(at + length);
      } else {
        const text = inserts[Math.floor(random() * inserts.length)] as string;
        code = code.slice(0, at) + text + code.slice(at);
      }
      state = reparseIncremental(registry, languageName, state, code);
      const lines = painter.paint(
        state.events,
        code,
        languageName,
        withReuse ? state.reuse : undefined,
      );
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
    // Without `reuse`, the changed span comes from comparing events.
    for (let seed = 1; seed <= 4; seed++) fuzz("javascript", js, seed, false);
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
