import { createRegistry, registerAll } from "../src/engine.js";

import earthfile from "../src/languages/earthfile";

const registry = createRegistry();

registerAll(registry, earthfile);

const highlight = (code: string) =>
  registry.highlight(code, { language: "earthfile" }).value;

test("earthfile highlights VERSION and SAVE ARTIFACT", () => {
  const result = highlight(
    `VERSION 0.8
FROM golang:1.22
build:
    COPY src .
    RUN go build -o bin
    SAVE ARTIFACT bin
`,
  );

  expect(result).toContain('<span class="hljs-keyword">VERSION</span>');
  expect(result).toContain('<span class="hljs-keyword">SAVE ARTIFACT</span>');
  expect(result).toContain('<span class="hljs-title function_">build</span>');
});

test("earthfile highlights IF/FOR control flow", () => {
  const result = highlight(
    `build:
    FOR pkg IN foo bar
        RUN echo $pkg
    END
    IF [ -f go.mod ]
        RUN go mod download
    END
`,
  );

  expect(result).toContain('<span class="hljs-keyword">FOR</span>');
  expect(result).toContain('<span class="hljs-keyword">IF</span>');
  expect(result).toContain('<span class="hljs-keyword">END</span>');
});

test("earthfile highlights comments", () => {
  const result = highlight("# compile the binary\nFROM alpine");

  expect(result).toContain(
    '<span class="hljs-comment"># compile the binary</span>',
  );
});

test("earthfile highlights FROM via dockerfile", () => {
  const result = highlight("FROM alpine:3.19\nWORKDIR /app");

  expect(result).toContain("hljs-keyword");
});
