import { createRegistry } from "../src/engine.js";

import wit from "../src/languages/wit";

const registry = createRegistry();

registry.register(wit.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "wit" }).value;

const SEED = `package example:host@0.1.0;

world hello {
  import wasi:io/poll;
  export greet: func(name: string) -> string;
}

interface types {
  record person { name: string, age: u32 }
  variant error { not-found, other(string) }
}
`;

test("wit highlights package, world, and interface constructs", () => {
  const result = highlight(SEED);

  expect(result).toContain('<span class="hljs-keyword">package</span>');
  expect(result).toContain('<span class="hljs-keyword">world</span>');
  expect(result).toContain('<span class="hljs-keyword">interface</span>');
  expect(result).toContain('<span class="hljs-keyword">import</span>');
  expect(result).toContain('<span class="hljs-keyword">export</span>');
  expect(result).toContain('<span class="hljs-keyword">func</span>');
  expect(result).toContain('<span class="hljs-keyword">record</span>');
  expect(result).toContain('<span class="hljs-keyword">variant</span>');
  expect(result).toContain('<span class="hljs-type">string</span>');
  expect(result).toContain('<span class="hljs-type">u32</span>');
});

test("wit highlights comments and strings", () => {
  const result = highlight(
    "// host world\nworld hello {\n  export greet: func(name: string) -> string;\n}\n",
  );

  expect(result).toContain('<span class="hljs-comment">// host world</span>');
  expect(result).toContain('<span class="hljs-keyword">world</span>');
});

test("wit highlights nested records, variants, and kebab-case ids", () => {
  const result = highlight(
    `interface types {
  record person { name: string, age: u32 }
  variant error { not-found, other(string) }
}
`,
  );

  expect(result).toContain('<span class="hljs-keyword">record</span>');
  expect(result).toContain('<span class="hljs-title class_">person</span>');
  expect(result).toContain('<span class="hljs-keyword">variant</span>');
  expect(result).toContain('<span class="hljs-title class_">error</span>');
  expect(result).toContain("not-found");
});

test("wit highlights list types and package paths", () => {
  const result = highlight(
    "package example:host@0.1.0;\nimport wasi:io/poll;\ntype names = list<string>;",
  );

  expect(result).toContain('<span class="hljs-symbol">example:host</span>');
  expect(result).toContain('<span class="hljs-number">@0.1.0</span>');
  expect(result).toContain('<span class="hljs-symbol">wasi:io/poll</span>');
  expect(result).toContain('<span class="hljs-type">list</span>');
  expect(result).toContain('<span class="hljs-type">string</span>');
});
