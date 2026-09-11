import { createRegistry, registerAll } from "../src/engine.js";

import assemblyscript from "../src/languages/assemblyscript";

const registry = createRegistry();

registerAll(registry, assemblyscript);

const highlight = (code: string) =>
  registry.highlight(code, { language: "assemblyscript" }).value;

const SEED = `@inline
export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function loadX(ptr: usize): i32 {
  return changetype<i32>(unchecked(load<i32>(ptr)));
}
`;

test("assemblyscript highlights wasm types and @inline", () => {
  const result = highlight(SEED);

  expect(result).toContain('<span class="hljs-type">i32</span>');
  expect(result).toContain('<span class="hljs-type">usize</span>');
  expect(result).toContain('<span class="hljs-meta">@inline</span>');
  expect(result).toContain('<span class="hljs-built_in">changetype</span>');
  expect(result).toContain('<span class="hljs-built_in">unchecked</span>');
});

test("assemblyscript highlights comments and strings", () => {
  const result = highlight(
    '// add two i32s\nexport function add(a: i32, b: i32): i32 {\n  return a + b;\n}\nconst label = "sum";\n',
  );

  expect(result).toContain('<span class="hljs-comment">// add two i32s</span>');
  expect(result).toContain('<span class="hljs-string">&quot;sum&quot;</span>');
});

test("assemblyscript highlights memory ops and generic builtins", () => {
  const result = highlight(
    `export function grow(): i32 {
  const typeId = idof<i32>();
  return memory.grow(1);
}

export function loadX(ptr: usize): i32 {
  return changetype<i32>(unchecked(load<i32>(ptr)));
}
`,
  );

  expect(result).toContain('<span class="hljs-built_in">memory</span>');
  expect(result).toContain('<span class="hljs-built_in">grow</span>');
  expect(result).toContain('<span class="hljs-built_in">changetype</span>');
  expect(result).toContain('<span class="hljs-built_in">idof</span>');
  expect(result).not.toContain("language-xml");
});

test("assemblyscript highlights isize and the type-operation builtins", () => {
  const result = highlight(
    'function f(z: isize, p: usize): u32 {\n  return sizeof<T>() + offsetof<Vec>("x") + alignof<T>() + nameof<T>().length;\n}\nlet v = instantiate<Vec>(1);\nif (isInteger<T>()) unreachable();\nassert(v != null, "msg");',
  );

  expect(result).toContain('<span class="hljs-type">isize</span>');
  expect(result).toContain('<span class="hljs-type">usize</span>');
  expect(result).toContain(
    '<span class="hljs-built_in">sizeof</span>&lt;T&gt;',
  );
  expect(result).toContain('<span class="hljs-built_in">offsetof</span>&lt;');
  expect(result).toContain('<span class="hljs-built_in">alignof</span>&lt;');
  expect(result).toContain('<span class="hljs-built_in">nameof</span>&lt;');
  expect(result).toContain(
    '<span class="hljs-built_in">instantiate</span>&lt;',
  );
  expect(result).toContain('<span class="hljs-built_in">isInteger</span>&lt;');
  expect(result).toContain('<span class="hljs-built_in">unreachable</span>');
  expect(result).toContain('<span class="hljs-built_in">assert</span>');
});

test("assemblyscript leaves ordinary TypeScript identifiers to the typescript grammar", () => {
  const result = highlight(
    "const size = 1;\nlet isIntegerish = true;\nconst obj = { sizeof: 2 };",
  );

  expect(result).not.toContain('hljs-built_in">size');
  expect(result).not.toContain('hljs-built_in">isIntegerish');
  expect(result).not.toContain('hljs-built_in">sizeof');
});
