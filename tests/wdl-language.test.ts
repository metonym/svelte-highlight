import { createRegistry } from "../src/engine.js";
import hcl from "../src/languages/hcl";
import nextflow from "../src/languages/nextflow";
import python from "../src/languages/python";
import wdl from "../src/languages/wdl";
import yaml from "../src/languages/yaml";
import { CUSTOM_SNIPPETS } from "./differential-corpus";

const registry = createRegistry();

registry.register(wdl.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "wdl" }).value;

test("wdl highlights a named task declaration", () => {
  const result = highlight("task HelloWorld {\n}");

  expect(result).toContain('<span class="hljs-keyword">task</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">HelloWorld</span>',
  );
});

test("wdl highlights a named workflow declaration", () => {
  const result = highlight("workflow Greet {\n}");

  expect(result).toContain('<span class="hljs-keyword">workflow</span>');
  expect(result).toContain('<span class="hljs-title function_">Greet</span>');
});

test("wdl highlights section openers, scatter, and call", () => {
  const result = highlight(
    "input {\noutput {\nruntime {\nscatter (n in names) {\ncall HelloWorld",
  );

  expect(result).toContain('<span class="hljs-keyword">input</span>');
  expect(result).toContain('<span class="hljs-keyword">output</span>');
  expect(result).toContain('<span class="hljs-keyword">runtime</span>');
  expect(result).toContain('<span class="hljs-keyword">scatter</span>');
  expect(result).toContain('<span class="hljs-keyword">call</span>');
});

test("wdl highlights the command heredoc, its interpolation, and types", () => {
  const result = highlight(
    'String name\nArray[File] reads\ncommand <<<\n  echo "~{name}"\n>>>',
  );

  expect(result).toContain('<span class="hljs-built_in">String</span>');
  expect(result).toContain('<span class="hljs-built_in">Array</span>');
  expect(result).toContain('<span class="hljs-keyword">command</span>');
  expect(result).toContain('<span class="hljs-string">');
  expect(result).toContain('<span class="hljs-subst">~{name}</span>');
});

test("wdl does not treat a plain `runtime`/`output` word as a section opener without a brace", () => {
  const result = highlight("String runtime = compute_runtime()\nreturn output");

  expect(result).not.toContain('<span class="hljs-keyword">runtime</span>');
  expect(result).not.toContain('<span class="hljs-keyword">output</span>');
});

describe("wdl relevance against neighboring languages", () => {
  const neighbors = createRegistry();
  neighbors.register(wdl.register);
  neighbors.register(hcl.register);
  neighbors.register(nextflow.register);
  neighbors.register(python.register);
  neighbors.register(yaml.register);

  const neighborSamples: Record<string, string> = {
    hcl: `resource "aws_instance" "web" {
  ami           = "ami-0123456789"
  instance_type = "t3.micro"

  tags = {
    Name = "web-server"
  }
}

output "instance_id" {
  value = aws_instance.web.id
}`,
    nextflow: CUSTOM_SNIPPETS.nextflow ?? "",
    python: `import sys

def greet(name):
    return f"hello, {name}!"

if __name__ == "__main__":
    print(greet(sys.argv[1]))`,
    yaml: `name: hello-world
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: echo "hello"`,
  };

  const wdlSample = CUSTOM_SNIPPETS.wdl;
  if (wdlSample === undefined) {
    throw new Error("missing wdl entry in CUSTOM_SNIPPETS");
  }

  test("the wdl sample wins auto-detection on its own sample", () => {
    const result = neighbors.highlightAuto(wdlSample, [
      "wdl",
      "hcl",
      "nextflow",
      "python",
      "yaml",
    ]);

    expect(result.language).toBe("wdl");
  });

  for (const [language, sample] of Object.entries(neighborSamples)) {
    test(`wdl does not win detection on a ${language} sample`, () => {
      if (!sample) return;

      const result = neighbors.highlightAuto(sample, ["wdl", language]);

      expect(result.language).not.toBe("wdl");
    });
  }
});
