import { createRegistry } from "../src/engine.js";
import bash from "../src/languages/bash";
import groovy from "../src/languages/groovy";
import java from "../src/languages/java";
import nextflow from "../src/languages/nextflow";
import python from "../src/languages/python";
import { CUSTOM_SNIPPETS } from "./differential-corpus";

const registry = createRegistry();

registry.register(nextflow.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "nextflow" }).value;

test("nextflow highlights a named process declaration", () => {
  const result = highlight("process alignReads {\n}");

  expect(result).toContain('<span class="hljs-keyword">process</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">alignReads</span>',
  );
});

test("nextflow highlights the workflow block opener", () => {
  const result = highlight("workflow {\n}");

  expect(result).toContain('<span class="hljs-keyword">workflow</span>');
});

test("nextflow highlights section openers, directives, and emit", () => {
  const result = highlight(
    'input:\noutput:\npath "out.bam", emit: bam\ncontainer "ubuntu"',
  );

  expect(result).toContain('<span class="hljs-keyword">input</span>');
  expect(result).toContain('<span class="hljs-keyword">output</span>');
  expect(result).toContain('<span class="hljs-keyword">emit</span>');
  expect(result).toContain('<span class="hljs-keyword">container</span>');
});

test("nextflow highlights channel built-ins, string interpolation, and operators", () => {
  const result = highlight(
    // biome-ignore lint/suspicious/noTemplateCurlyInString: literal Nextflow source under test, not a JS template string
    "Channel.fromPath('data/*.txt').map { it.name }\nparams.outdir ?: 'results'\n\"${sample_id}.bam\"",
  );

  expect(result).toContain('<span class="hljs-built_in">Channel</span>');
  expect(result).toContain('<span class="hljs-built_in">fromPath</span>');
  expect(result).toContain('<span class="hljs-operator">?:</span>');
  // biome-ignore lint/suspicious/noTemplateCurlyInString: asserting on literal Nextflow interpolation syntax
  expect(result).toContain('<span class="hljs-subst">${sample_id}</span>');
});

test("nextflow does not treat a plain `process` identifier as the block anchor", () => {
  const result = highlight("def process = launch()");

  expect(result).not.toContain(
    '<span class="hljs-title function_">launch</span>',
  );
  expect(result).toContain("process");
  expect(result).not.toMatch(
    /<span class="hljs-keyword">process<\/span>\s*<span class="hljs-title function_">/,
  );
});

describe("nextflow relevance against neighboring languages", () => {
  const neighbors = createRegistry();
  neighbors.register(nextflow.register);
  neighbors.register(groovy.register);
  neighbors.register(java.register);
  neighbors.register(bash.register);
  neighbors.register(python.register);

  const neighborSamples: Record<string, string> = {
    groovy: `class Greeter {
    def greeting = "hello"

    def greet(name) {
        println "\${greeting}, \${name}!"
    }
}

def g = new Greeter()
g.greet("world")`,
    java: `public class Greeter {
    private final String greeting = "hello";

    public String greet(String name) {
        return greeting + ", " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(new Greeter().greet("world"));
    }
}`,
    bash: `#!/usr/bin/env bash
set -euo pipefail

for f in data/*.txt; do
  echo "processing $f"
  wc -l "$f"
done`,
    python: `import sys

def greet(name):
    return f"hello, {name}!"

if __name__ == "__main__":
    print(greet(sys.argv[1]))`,
  };

  const nextflowSample = CUSTOM_SNIPPETS.nextflow;
  if (nextflowSample === undefined) {
    throw new Error("missing nextflow entry in CUSTOM_SNIPPETS");
  }

  test("the nextflow sample wins auto-detection on its own sample", () => {
    const result = neighbors.highlightAuto(nextflowSample, [
      "nextflow",
      "groovy",
      "java",
      "bash",
      "python",
    ]);

    expect(result.language).toBe("nextflow");
  });

  for (const [language, sample] of Object.entries(neighborSamples)) {
    test(`nextflow does not win detection on a ${language} sample`, () => {
      const result = neighbors.highlightAuto(sample, ["nextflow", language]);

      expect(result.language).not.toBe("nextflow");
    });
  }
});
