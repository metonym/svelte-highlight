import {
  createRegistry,
  registerAll,
  renderHtml,
  toRanges,
} from "../src/engine.js";
import {
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
    state = reparseIncremental(registry, language, state, code);
    expect(render(state.events)).toEqual(oneShotRender(code, language));
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
