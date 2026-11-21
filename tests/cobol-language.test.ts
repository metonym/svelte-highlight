import { createRegistry } from "../src/engine.js";

import cobol from "../src/languages/cobol";

const registry = createRegistry();

registry.register(cobol.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cobol" }).value;

test("cobol highlights divisions, sections and the program id", () => {
  const result = highlight(
    "       IDENTIFICATION DIVISION.\n       PROGRAM-ID. HELLO.\n       WORKING-STORAGE SECTION.",
  );

  expect(result).toContain(
    '<span class="hljs-section">IDENTIFICATION DIVISION</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">PROGRAM-ID</span>');
  expect(result).toContain('<span class="hljs-title class_">HELLO</span>');
  expect(result).toContain(
    '<span class="hljs-section">WORKING-STORAGE SECTION</span>',
  );
});

test("cobol highlights level numbers, data names and PIC clauses", () => {
  const result = highlight(
    "       01 WS-RECORD.\n          05 WS-AMOUNT PIC S9(7)V99 COMP-3.\n          05 FILLER PIC X(10).",
  );

  expect(result).toContain('<span class="hljs-number">01</span>');
  expect(result).toContain('<span class="hljs-variable">WS-RECORD</span>');
  expect(result).toContain('<span class="hljs-variable">WS-AMOUNT</span>');
  expect(result).toContain('<span class="hljs-keyword">PIC</span>');
  expect(result).toContain('<span class="hljs-type">S9(7)V99</span>');
  expect(result).toContain('<span class="hljs-type">COMP-3</span>');
  expect(result).toContain('<span class="hljs-keyword">FILLER</span>');
  expect(result).toContain('<span class="hljs-type">X(10)</span>.');
});

test("cobol highlights verbs case-insensitively and leaves hyphenated names alone", () => {
  const result = highlight(
    "           move ws-total-1 to ws-out\n           Display ws-count",
  );

  expect(result).toContain('<span class="hljs-keyword">move</span>');
  expect(result).toContain('<span class="hljs-keyword">to</span>');
  expect(result).toContain('<span class="hljs-keyword">Display</span>');
  expect(result).toContain("ws-total-1");
  expect(result).not.toContain('<span class="hljs-number">1</span>');
  expect(result).not.toContain(">count<");
});

test("cobol highlights paragraphs and PERFORM targets", () => {
  const result = highlight(
    "       MAIN-PARA.\n           PERFORM 1000-INIT\n           GOBACK.\n       1000-INIT.",
  );

  expect(result).toContain(
    '<span class="hljs-title function_">MAIN-PARA</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">PERFORM</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">1000-INIT</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">GOBACK</span>');
});

test("cobol highlights fixed-form and free-form comments", () => {
  const result = highlight(
    "000100* fixed comment\n       DISPLAY 'HI' *> inline comment",
  );

  expect(result).toContain(
    '<span class="hljs-comment">000100* fixed comment</span>',
  );
  expect(result).toContain(
    '<span class="hljs-comment">*&gt; inline comment</span>',
  );
  expect(result).toContain('<span class="hljs-string">&#x27;HI&#x27;</span>');
});

test("cobol highlights doubled-quote strings, figurative constants and intrinsics", () => {
  const result = highlight(
    '           MOVE "say ""hi""" TO WS-MSG\n           MOVE SPACES TO WS-OUT\n           DISPLAY FUNCTION CURRENT-DATE',
  );

  expect(result).toContain(
    '<span class="hljs-string">&quot;say &quot;&quot;hi&quot;&quot;&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-literal">SPACES</span>');
  expect(result).toContain('<span class="hljs-keyword">FUNCTION</span>');
  expect(result).toContain('<span class="hljs-built_in">CURRENT-DATE</span>');
});

test("cobol keeps reserved paragraph headers as keywords", () => {
  const result = highlight(
    "       FILE-CONTROL.\n           SELECT IN-FILE ASSIGN TO 'IN.DAT'.",
  );

  expect(result).toContain('<span class="hljs-keyword">FILE-CONTROL</span>');
  expect(result).not.toContain("hljs-title");
});
