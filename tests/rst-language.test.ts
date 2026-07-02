import hljs from "highlight.js/lib/core";
import rst from "../src/languages/rst";

hljs.registerLanguage(rst.name, rst.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "rst" }).value;

test("rst highlights section title underlines", () => {
  const result = highlight("Title\n=====\n\nBody text.");

  expect(result).toContain('<span class="hljs-section">=====</span>');
});

test("rst highlights directives like code-block", () => {
  const result = highlight(".. code-block:: python\n\n   print(1)");

  expect(result).toContain(
    '<span class="hljs-meta">..</span> <span class="hljs-keyword">code-block</span><span class="hljs-meta">::</span> python',
  );
});

test("rst highlights inline roles", () => {
  const result = highlight("See :func:`foo` for details.");

  expect(result).toContain('<span class="hljs-symbol">:func:</span>');
  expect(result).toContain('<span class="hljs-string">`foo`</span>');
});

test("rst highlights strong, emphasis, and literal markup", () => {
  const result = highlight("This is **strong**, *emphasis*, and ``literal``.");

  expect(result).toContain('<span class="hljs-strong">**strong**</span>');
  expect(result).toContain('<span class="hljs-emphasis">*emphasis*</span>');
  expect(result).toContain('<span class="hljs-code">``literal``</span>');
});

test("rst highlights field lists", () => {
  const result = highlight(":param x: the input\n:returns: the output");

  expect(result).toContain('<span class="hljs-attr">:param x:</span>');
  expect(result).toContain('<span class="hljs-attr">:returns:</span>');
});

test("rst highlights comments distinctly from directives", () => {
  const result = highlight(".. This is a comment\n   spanning lines");

  expect(result).toContain(
    '<span class="hljs-comment">.. This is a comment</span>',
  );
});

test("rst highlights bullet and numbered lists", () => {
  const result = highlight("- item one\n* item two\n1. first\n#. second");

  expect(result).toContain('<span class="hljs-bullet">-</span> item one');
  expect(result).toContain('<span class="hljs-bullet">*</span> item two');
  expect(result).toContain('<span class="hljs-bullet">1.</span> first');
  expect(result).toContain('<span class="hljs-bullet">#.</span> second');
});

test("rst highlights hyperlink and substitution references", () => {
  const result = highlight(
    "See `Python <https://python.org>`_ or target_ or |name|.",
  );

  expect(result).toContain(
    '<span class="hljs-string">`Python &lt;https://python.org&gt;`_</span>',
  );
  expect(result).toContain('<span class="hljs-link">target_</span>');
  expect(result).toContain(
    '<span class="hljs-template-variable">|name|</span>',
  );
});
