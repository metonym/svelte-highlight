import hljs from "highlight.js/lib/core";
import hcl from "../src/languages/hcl";

hljs.registerLanguage(hcl.name, hcl.register);

const highlight = (code: string) =>
  hljs.highlight(code, { language: "hcl" }).value;

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

test("hcl highlights heredoc strings", () => {
  const result = highlight("policy = <<-EOT\n  hello\nEOT");

  expect(result).toContain("hljs-string");
});

test("hcl highlights hash and slash comments", () => {
  const result = highlight("# a comment\n// another\nx = 1");

  expect(result).toContain("hljs-comment");
});
