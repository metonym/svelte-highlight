import { createRegistry } from "../src/engine.js";

import hcl from "../src/languages/hcl";

const registry = createRegistry();

registry.register(hcl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "hcl" }).value;

test("hcl highlights block type keywords", () => {
  const result = highlight(`resource "aws_instance" "web" {}`);

  expect(result).toContain('<span class="hljs-keyword">resource</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;aws_instance&quot;</span>',
  );
  expect(result).toContain('<span class="hljs-string">&quot;web&quot;</span>');
});

test("hcl highlights attributes", () => {
  const result = highlight(`instance_type = "t3.micro"`);

  expect(result).toContain('<span class="hljs-attr">instance_type</span>');
});

test("hcl highlights interpolation as subst", () => {
  const result = highlight(`name = "web-\${count.index}"`);

  expect(result).toContain("hljs-subst");
});

test("hcl interpolation is self-nesting past inner interpolations", () => {
  const result = highlight(`x = "\${format("\${nested}")}"`);

  // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
  expect(result).toContain('<span class="hljs-subst">${nested}</span>');
  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
    '<span class="hljs-subst">${<span class="hljs-built_in">format</span>(&quot;<span class="hljs-subst">${nested}</span>&quot;)}</span>',
  );
});

test("hcl interpolation balances a nested bare-brace object literal", () => {
  const result = highlight(`x = "\${merge(local.tags, { Name = "test" })}"`);

  expect(result).toContain(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal ${} under test, not JS interpolation
    '<span class="hljs-subst">${<span class="hljs-built_in">merge</span>(local.tags, { Name = &quot;test&quot; })}</span>',
  );
});

test("hcl highlights heredoc strings", () => {
  const result = highlight("policy = <<-EOT\n  hello\nEOT");

  expect(result).toContain("hljs-string");
});

test("hcl heredoc only closes at the matching delimiter", () => {
  const result = highlight("x = <<EOT\ntrue\nstill string\nEOT");

  expect(result).toContain("true\nstill string");
});

test("hcl highlights hash and slash comments", () => {
  const result = highlight("# a comment\n// another\nx = 1");

  expect(result).toContain("hljs-comment");
});

test("hcl highlights nested block types", () => {
  const result = highlight(
    'variable "n" {\n  validation {\n    condition = var.n > 0\n  }\n}\nresource "x" "y" {\n  lifecycle {\n    precondition {}\n  }\n  dynamic "d" {\n    content {}\n  }\n}\nrun "plan" {\n  assert {}\n}',
  );

  expect(result).toContain('<span class="hljs-keyword">validation</span>');
  expect(result).toContain('<span class="hljs-keyword">precondition</span>');
  expect(result).toContain('<span class="hljs-keyword">content</span>');
  expect(result).toContain('<span class="hljs-keyword">run</span>');
  expect(result).toContain('<span class="hljs-keyword">assert</span>');
});

test("hcl does not treat an attribute named like a block type as a block header", () => {
  const result = highlight(
    'resource "aws_instance" "web" {\n  provider = aws.west\n  ami      = "ami-1"\n  content  = "x"\n}\nmodule "m" {}',
  );

  expect(result).toContain(
    '<span class="hljs-attr">provider</span> = aws.west',
  );
  expect(result).toContain('<span class="hljs-attr">ami</span>');
  expect(result).toContain('<span class="hljs-attr">content</span>');
  expect(result).toContain(
    '<span class="hljs-keyword">module</span> <span class="hljs-string">&quot;m&quot;</span>',
  );
});
