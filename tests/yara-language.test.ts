import { createRegistry } from "../src/engine.js";

import yara from "../src/languages/yara";

const registry = createRegistry();

registry.register(yara.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "yara" }).value;

test("yara highlights the rule name as the relevance carrier", () => {
  const result = highlight("rule SuspiciousExecutable {");

  expect(result).toContain('<span class="hljs-keyword">rule</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">SuspiciousExecutable</span>',
  );
});

test("yara highlights sections", () => {
  const result = highlight('meta:\n  author = "analyst"');

  expect(result).toContain('<span class="hljs-section">meta:</span>');
});

test("yara highlights string identifiers", () => {
  const result = highlight('$a = "malicious_string" nocase');

  expect(result).toContain('<span class="hljs-variable">$a</span>');
  expect(result).toContain('<span class="hljs-keyword">nocase</span>');
});

test("yara highlights module prefixes as built-ins", () => {
  const result = highlight("pe.number_of_sections > 3");

  expect(result).toContain(
    '<span class="hljs-built_in">pe.number_of_sections</span>',
  );
});

test("yara highlights comments and condition keywords", () => {
  const result = highlight("// a comment\ncondition:\n  $a and $hex");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain('<span class="hljs-section">condition:</span>');
  expect(result).toContain('<span class="hljs-keyword">and</span>');
});

test("yara styles every byte of a hex string as a number", () => {
  const result = highlight(
    "strings:\n  $b = { 6A 40 ?? 8D ~90 [4-6] ( 55 | 56 ) 8? }\ncondition:\n  $b",
  );

  expect(result).toContain('<span class="hljs-variable">$b</span>');
  expect(result).toContain('<span class="hljs-number">6A</span>');
  expect(result).toContain('<span class="hljs-number">40</span>');
  expect(result).toContain('<span class="hljs-number">??</span>');
  expect(result).toContain('<span class="hljs-number">~90</span>');
  expect(result).toContain('<span class="hljs-number">8?</span>');
  expect(result).toContain(
    '<span class="hljs-number">55</span> | <span class="hljs-number">56</span>',
  );
});

test("yara closes a hex string at its own brace and resumes the rule", () => {
  const result = highlight(
    "rule R {\n  strings:\n    $h = { 01 02 }\n  condition:\n    $h and uint16(0) == 0x5A4D\n}",
  );

  expect(result).toContain('<span class="hljs-section">condition:</span>');
  expect(result).toContain('<span class="hljs-keyword">and</span>');
  expect(result).toContain('<span class="hljs-type">uint16</span>');
});

test("yara keeps a text string definition on the plain variable rule", () => {
  const result = highlight('$a = "text" nocase');

  expect(result).toContain('<span class="hljs-variable">$a</span>');
  expect(result).toContain('<span class="hljs-string">&quot;text&quot;</span>');
  expect(result).toContain('<span class="hljs-keyword">nocase</span>');
});

test("yara highlights float literals as one number", () => {
  const result = highlight("math.entropy(0, filesize) >= 7.0");

  expect(result).toContain('<span class="hljs-number">7.0</span>');
  expect(result).toContain('<span class="hljs-built_in">math.entropy</span>');
});

test("yara highlights the case-insensitive string operators and with", () => {
  const result = highlight(
    '$a iendswith "G" or $a istartswith "t" or $a iequals "x"\nwith n = 1 : ( n == 1 )',
  );

  expect(result).toContain('<span class="hljs-keyword">iendswith</span>');
  expect(result).toContain('<span class="hljs-keyword">istartswith</span>');
  expect(result).toContain('<span class="hljs-keyword">iequals</span>');
  expect(result).toContain('<span class="hljs-keyword">with</span>');
});

test("yara highlights the elf, dotnet, time and string module prefixes", () => {
  const result = highlight(
    'elf.type == elf.ET_EXEC and dotnet.version == "v4" and time.now() > 0 and string.length("a") == 1',
  );

  expect(result).toContain('<span class="hljs-built_in">elf.type</span>');
  expect(result).toContain('<span class="hljs-built_in">dotnet.version</span>');
  expect(result).toContain('<span class="hljs-built_in">time.now</span>');
  expect(result).toContain('<span class="hljs-built_in">string.length</span>');
});
