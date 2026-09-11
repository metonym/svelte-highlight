import { createRegistry } from "../src/engine.js";

import kdl from "../src/languages/kdl";

const registry = createRegistry();

registry.register(kdl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "kdl" }).value;

test("kdl highlights node names and nested children", () => {
  const result = highlight(
    `package {
  name "svelte-highlight"
  version 1.0
}`,
  );

  expect(result).toContain('<span class="hljs-title function_">package</span>');
  expect(result).toContain('<span class="hljs-title function_">name</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;svelte-highlight&quot;</span>',
  );
});

test("kdl highlights properties and literals", () => {
  const result = highlight('server host="localhost" port=8080 enabled=#true');

  expect(result).toContain('<span class="hljs-attr">host</span>');
  expect(result).toContain('<span class="hljs-attr">port</span>');
  expect(result).toContain('<span class="hljs-literal">#true</span>');
  expect(result).toContain('<span class="hljs-number">8080</span>');
});

test("kdl highlights comments including slashdash", () => {
  const line = highlight("// a comment\nnode 1");
  const slashdash = highlight("/- skipped 1\nnode 2");

  expect(line).toContain('<span class="hljs-comment">// a comment</span>');
  expect(slashdash).toContain('<span class="hljs-comment">/- skipped 1</span>');
});

test("kdl highlights type annotations", () => {
  const result = highlight('created (date)"2024-01-01"');

  expect(result).toContain('<span class="hljs-type">(date)</span>');
});

test("kdl highlights KDL 2.0 raw strings as one string", () => {
  const result = highlight(
    'author email=#"kat@example.com"# features=#"["small_rng"]"# deep=##"a "# b"##',
  );

  expect(result).toContain(
    '<span class="hljs-string">#&quot;kat@example.com&quot;#</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">#&quot;[&quot;small_rng&quot;]&quot;#</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">##&quot;a &quot;# b&quot;##</span>',
  );
  expect(result).not.toContain(
    '<span class="hljs-title function_">small_rng</span>',
  );
});

test("kdl highlights multi-line and raw multi-line strings", () => {
  const result = highlight(
    'text """\n    line one\n    line "two"\n    """\nraw #"""\n    r\\n\n    """#\nnext 1',
  );

  expect(result).toContain(
    '<span class="hljs-string">&quot;&quot;&quot;\n    line one\n    line &quot;two&quot;\n    &quot;&quot;&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">#&quot;&quot;&quot;\n    r\\n\n    &quot;&quot;&quot;#</span>',
  );
  expect(result).toContain('<span class="hljs-title function_">next</span>');
});

test("kdl keeps KDL 1.0 raw strings, hash literals, and plain strings", () => {
  const result = highlight('node r#"raw"# #true "a" "b"');

  expect(result).toContain(
    '<span class="hljs-string">r#&quot;raw&quot;#</span>',
  );
  expect(result).toContain('<span class="hljs-literal">#true</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;a&quot;</span> <span class="hljs-string">&quot;b&quot;</span>',
  );
});
