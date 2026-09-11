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

test("wit keeps kebab-case identifiers and %-escaped names as plain words", () => {
  const result = highlight(
    "resource fields {\n  from-list: static func() -> list<u8>;\n}\nenum status { ok, not-found }\n%type: func();",
  );

  expect(result).toContain(
    'from-list: <span class="hljs-keyword">static</span>',
  );
  expect(result).toContain("{ ok, not-found }");
  expect(result).toContain('%type: <span class="hljs-keyword">func</span>');
  expect(result).not.toContain('hljs-keyword">from');
  expect(result).not.toContain('hljs-keyword">type</span>: ');
});

test("wit highlights own handles, async funcs, and stream/future types", () => {
  const result = highlight(
    "handle: func(o: own<fields>, b: borrow<fields>) -> result<_, string>;\nrun: async func() -> stream<u8>;\nfut: func() -> future<string>;",
  );

  expect(result).toContain('<span class="hljs-type">own</span>&lt;fields&gt;');
  expect(result).toContain(
    '<span class="hljs-keyword">async</span> <span class="hljs-keyword">func</span>',
  );
  expect(result).toContain(
    '<span class="hljs-type">stream</span>&lt;<span class="hljs-type">u8</span>&gt;',
  );
  expect(result).toContain(
    '<span class="hljs-type">future</span>&lt;<span class="hljs-type">string</span>&gt;',
  );
});

test("wit highlights feature gates and flags/type declarations", () => {
  const result = highlight(
    "@since(version = 0.2.0)\n@unstable(feature = ready)\nflags perms { read, write }\ntype duration = u64;\nuse types.{method as http-method};",
  );

  expect(result).toContain(
    '<span class="hljs-meta">@since</span>(version = <span class="hljs-number">0.2.0</span>)',
  );
  expect(result).toContain('<span class="hljs-meta">@unstable</span>(feature');
  expect(result).toContain(
    '<span class="hljs-keyword">flags</span> <span class="hljs-title class_">perms</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">type</span> <span class="hljs-title class_">duration</span> = <span class="hljs-type">u64</span>',
  );
  // `types` in a use path is not the `type` keyword.
  expect(result).toContain('<span class="hljs-keyword">use</span> types.{');
});
