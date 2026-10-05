import {
  createRegistry,
  registerAll,
  renderHtml,
  toRanges,
} from "../src/engine.js";
import {
  CHECKPOINT_INTERVAL,
  type IncrementalParse,
  parseIncremental,
  reparseIncremental,
} from "../src/incremental-tokenize.js";
import * as languages from "../src/languages/index.js";

const registry = createRegistry();
for (const language of Object.values(languages))
  registerAll(registry, language);

/**
 * The observable contract - rendered HTML and flat ranges, exactly what
 * HighlightEditable's two engines actually consume - not raw events.
 * A rule with a greedy trailing quantifier (e.g. javascript's punctuation
 * rule's `\s*` tail) can legitimately commit to less whitespace when less
 * of the document is available yet, splitting one plain-text run into more
 * TEXT events than a one-shot parse would (hljs's own documented
 * multi-line-lookahead streaming limitation, just via a common quantifier
 * instead of a heredoc). `renderHtml`/`toRanges` are unaffected: adjacent
 * TEXT events concatenate associatively, and unscoped runs produce no
 * ranges regardless of how many events represent them.
 */
function render(events: ReturnType<typeof registry.tokenize>["events"]) {
  return { html: renderHtml(events), ranges: toRanges(events) };
}

function oneShotRender(code: string, language: string) {
  return render(registry.tokenize(code, language).events);
}

/** Applies a sequence of edits, asserting every intermediate result renders identically to a full re-parse. */
function assertEditSequenceMatchesOneShot(
  language: string,
  versions: string[],
) {
  const [first, ...rest] = versions;
  if (first === undefined) throw new Error("versions must be non-empty");

  let state = parseIncremental(registry, language, first);
  expect(render(state.events)).toEqual(oneShotRender(first, language));

  for (const code of rest) {
    const previous = state;
    state = reparseIncremental(registry, language, state, code);
    expect(render(state.events)).toEqual(oneShotRender(code, language));
    if (state !== previous) expectReuseHolds(previous, state);
  }
}

/** `next.reuse` names events that really are `previous`'s, by identity. */
function expectReuseHolds(previous: IncrementalParse, next: IncrementalParse) {
  const reuse = next.reuse;
  if (!reuse) throw new Error("reparse result has no reuse");
  expect(reuse.from).toBe(previous.events);
  const prevCount = previous.events.length;
  const count = next.events.length;
  expect(reuse.head + reuse.tail).toBeLessThanOrEqual(
    Math.min(prevCount, count),
  );
  for (let i = 0; i < reuse.head; i++) {
    expect(next.events[i]).toBe(previous.events[i] as never);
  }
  for (let i = 1; i <= reuse.tail; i++) {
    expect(next.events[count - i]).toBe(
      previous.events[prevCount - i] as never,
    );
  }
}

describe("incremental re-tokenization matches a full re-parse", () => {
  const JsDoc = `import { readFile } from "node:fs/promises";

export function load(path) {
  const raw = readFile(path);
  return raw.length;
}

export const DEFAULT = "config.json";
`;

  it("insert at the end", () => {
    assertEditSequenceMatchesOneShot("javascript", [
      JsDoc,
      `${JsDoc}\nconsole.log(DEFAULT);\n`,
    ]);
  });

  it("insert at the start", () => {
    assertEditSequenceMatchesOneShot("javascript", [
      JsDoc,
      `"use strict";\n${JsDoc}`,
    ]);
  });

  it("insert in the middle, on its own line", () => {
    const edited = JsDoc.replace(
      "  const raw = readFile(path);\n",
      "  const raw = readFile(path);\n  const trimmed = raw.trim();\n",
    );
    assertEditSequenceMatchesOneShot("javascript", [JsDoc, edited]);
  });

  it("delete an entire line", () => {
    const edited = JsDoc.replace("  const raw = readFile(path);\n", "");
    assertEditSequenceMatchesOneShot("javascript", [JsDoc, edited]);
  });

  it("replace a single word", () => {
    const edited = JsDoc.replace("DEFAULT", "DEFAULT_PATH");
    assertEditSequenceMatchesOneShot("javascript", [JsDoc, edited]);
  });

  it("multi-line paste", () => {
    const pasted = JsDoc.replace(
      "export const DEFAULT",
      'export function validate(path) {\n  return typeof path === "string";\n}\n\nexport const DEFAULT',
    );
    assertEditSequenceMatchesOneShot("javascript", [JsDoc, pasted]);
  });

  it("edit that opens an unbalanced block comment (never re-converges)", () => {
    const edited = JsDoc.replace(
      'import { readFile } from "node:fs/promises";',
      'import { readFile } from "node:fs/promises";\n/* unterminated comment',
    );
    assertEditSequenceMatchesOneShot("javascript", [JsDoc, edited]);
  });

  it("editing inside an open template literal that spans lines", () => {
    const withTemplate = `const msg = \`line one
line two
line three\`;
const after = 1;
`;
    const edited = withTemplate.replace("line two", "line TWO edited");
    assertEditSequenceMatchesOneShot("javascript", [withTemplate, edited]);
  });

  it("simulates typing a function character by character", () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: this is JS *source text* fed to the tokenizer, not a template literal to evaluate
    const target = "function greet(name) {\n  return `hi ${name}`;\n}\n";
    const versions: string[] = [""];
    for (let i = 1; i <= target.length; i++) versions.push(target.slice(0, i));
    assertEditSequenceMatchesOneShot("javascript", versions);
  });

  it("no-op edit (identical code) returns the same parse without re-tokenizing", () => {
    const state = parseIncremental(registry, "javascript", JsDoc);
    const again = reparseIncremental(registry, "javascript", state, JsDoc);
    expect(again).toBe(state);
  });

  it("language change forces a fresh full parse", () => {
    const jsState = parseIncremental(registry, "javascript", "const x = 1;\n");
    const pyState = reparseIncremental(registry, "python", jsState, "x = 1\n");
    expect(render(pyState.events)).toEqual(oneShotRender("x = 1\n", "python"));
  });

  it("empty document and single-character edits", () => {
    assertEditSequenceMatchesOneShot("javascript", ["", "a", "ab", "a"]);
  });

  it("code without a trailing newline", () => {
    assertEditSequenceMatchesOneShot("javascript", [
      "const a = 1",
      "const a = 12",
    ]);
  });
});

describe("incremental re-tokenization resumes embedded sublanguages correctly", () => {
  it("editing inside a markdown fenced code block", () => {
    const doc = `# Title

\`\`\`js
const a = 1;
const b = 2;
\`\`\`

Done.
`;
    const edited = doc.replace("const b = 2;", "const b = 22;");
    assertEditSequenceMatchesOneShot("markdown", [doc, edited]);
  });

  it("editing astro frontmatter (embedded typescript) after the template", () => {
    const doc = `---
const title: string = "Hello";
---

<h1>{title}</h1>
`;
    const edited = doc.replace('"Hello"', '"Hello, world"');
    assertEditSequenceMatchesOneShot("astro", [doc, edited]);
  });

  it("editing the html template below astro frontmatter", () => {
    const doc = `---
const title: string = "Hello";
---

<h1 class="hero">{title}</h1>
`;
    const edited = doc.replace('class="hero"', 'class="hero large"');
    assertEditSequenceMatchesOneShot("astro", [doc, edited]);
  });
});

describe("incremental re-tokenization survives a realistic mixed editing session", () => {
  it("types forward, then edits earlier lines, then deletes and retypes", () => {
    const versions: string[] = [];
    let code = "";
    const push = (next: string) => {
      code = next;
      versions.push(code);
    };

    push("class Counter {\n");
    push("class Counter {\n  count = 0;\n");
    push(
      "class Counter {\n  count = 0;\n\n  increment() {\n    this.count++;\n  }\n}\n",
    );
    // Go back and edit an earlier line.
    push(code.replace("count = 0;", "count = 1;"));
    // Insert a new method between existing ones.
    push(
      code.replace(
        "  increment() {",
        "  reset() {\n    this.count = 0;\n  }\n\n  increment() {",
      ),
    );
    // Delete a chunk spanning multiple lines.
    push(code.replace("  reset() {\n    this.count = 0;\n  }\n\n", ""));
    // Retype it slightly differently.
    push(
      code.replace(
        "  increment() {",
        "  reset() {\n    this.count = 1;\n  }\n\n  increment() {",
      ),
    );

    assertEditSequenceMatchesOneShot("javascript", versions);
  });

  it("mixed edits across several languages with sublanguage embedding", () => {
    const cssDoc =
      ".card {\n  color: red;\n}\n\n.title {\n  font-weight: bold;\n}\n";
    assertEditSequenceMatchesOneShot("css", [
      cssDoc,
      cssDoc.replace("color: red;", "color: blue;"),
      cssDoc
        .replace("color: red;", "color: blue;")
        .replace(".title", ".subtitle"),
    ]);

    const pyDoc =
      "def add(a, b):\n    return a + b\n\n\ndef main():\n    print(add(1, 2))\n";
    assertEditSequenceMatchesOneShot("python", [
      pyDoc,
      pyDoc.replace("return a + b", "return a + b  # sum"),
      pyDoc.replace("def add(a, b):", "def add(a: int, b: int) -> int:"),
    ]);

    const htmlDoc =
      "<div>\n  <style>\n    .a { color: red; }\n  </style>\n  <script>\n    const x = 1;\n  </script>\n</div>\n";
    assertEditSequenceMatchesOneShot("html", [
      htmlDoc,
      htmlDoc.replace("color: red", "color: blue"),
      htmlDoc.replace("const x = 1", "const x = 2"),
    ]);
  });
});

describe("parseIncremental checkpoint density", () => {
  /** Build N one-statement lines of javascript. */
  function manyLines(n: number): string {
    let code = "";
    for (let i = 0; i < n; i++) code += `const v${i} = ${i};\n`;
    return code;
  }

  it("stores O(lines / interval) checkpoints, not one per line", () => {
    const lineCount = 320;
    const code = manyLines(lineCount);
    const state = parseIncremental(registry, "javascript", code);
    // Start checkpoint + one per interval + final (if not already on boundary).
    // With interval 32: 320/32 = 10 interior boundaries → at most ~12 checkpoints,
    // never one per line (321).
    expect(state.checkpoints.length).toBeLessThan(lineCount / 4);
    expect(state.checkpoints.length).toBeGreaterThan(2);
    // Still ends at the document end so resume can reach the tail.
    const last = state.checkpoints[state.checkpoints.length - 1];
    expect(last?.pos).toBe(code.length);
  });

  it("reparse after a mid-document edit still matches a full re-parse", () => {
    const code = manyLines(100);
    const edited = code.replace("const v50 = 50;", "const v50 = 500;");
    assertEditSequenceMatchesOneShot("javascript", [code, edited]);
  });

  it("follow-up edit near a prior edit converges in O(1) appended lines", () => {
    const code = manyLines(320);
    let state = parseIncremental(registry, "javascript", code);

    const edit1 = code.replace("const v50 = 50;", "const v50 = 500;");
    state = reparseIncremental(registry, "javascript", state, edit1);
    expect(render(state.events)).toEqual(oneShotRender(edit1, "javascript"));

    // First mid-doc edit densifies a pocket; the second edit on the same
    // line must resume from that pocket and converge without walking a
    // full CHECKPOINT_INTERVAL of sparse boundaries.
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
      const edit2 = edit1.replace("const v50 = 500;", "const v50 = 5000;");
      state = reparseIncremental(registry, "javascript", state, edit2);
      expect(render(state.events)).toEqual(oneShotRender(edit2, "javascript"));
      expect(appendCount).toBeLessThan(CHECKPOINT_INTERVAL);
      expect(appendCount).toBeLessThan(4);
    } finally {
      registry.createSession = createSession;
    }
  });
});

describe("reparseIncremental reuse", () => {
  const code = "function add(a, b) {\n  return a + b;\n}\n".repeat(200);

  it("reports the reused head and converged tail of a mid-document edit", () => {
    const state = parseIncremental(registry, "javascript", code);
    const at = code.indexOf("\n", code.length >> 1) + 1;
    const edited = `${code.slice(0, at)}x${code.slice(at)}`;
    const next = reparseIncremental(registry, "javascript", state, edited);
    expectReuseHolds(state, next);
    const head = next.reuse?.head ?? 0;
    const tail = next.reuse?.tail ?? 0;
    expect(head).toBeGreaterThan(0);
    expect(tail).toBeGreaterThan(0);
    // Everything but a few lines around the edit is reused.
    expect(next.events.length - head - tail).toBeLessThan(
      next.events.length / 10,
    );
  });

  it("reports no tail when the edit never re-converges", () => {
    const state = parseIncremental(registry, "javascript", code);
    const next = reparseIncremental(registry, "javascript", state, `/*${code}`);
    expectReuseHolds(state, next);
    expect(next.reuse?.tail).toBe(0);
  });

  it("is absent from a full parse", () => {
    expect(
      parseIncremental(registry, "javascript", code).reuse,
    ).toBeUndefined();
  });
});
