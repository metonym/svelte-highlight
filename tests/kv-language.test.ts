import { createRegistry, registerAll } from "../src/engine.js";

import kv from "../src/languages/kv";

const registry = createRegistry();

registerAll(registry, kv);

const highlight = (code: string) =>
  registry.highlight(code, { language: "kv" }).value;

test("kv highlights rule headers", () => {
  const result = highlight("<MyWidget@BoxLayout>:");

  expect(result).toContain(
    '<span class="hljs-title class_">&lt;MyWidget@BoxLayout&gt;</span>',
  );
});

test("kv highlights kivy directives", () => {
  const result = highlight("#:kivy 2.0");

  expect(result).toContain('<span class="hljs-meta">#:kivy</span>');
});

test("kv highlights known style keys as attributes", () => {
  const result = highlight("  on_press: root.handle_press(self)");

  expect(result).toContain('<span class="hljs-attr">  on_press</span>');
});

test("kv highlights a python expression after a property colon", () => {
  const result = highlight('  text: "Hello, {}".format(self.name)');

  expect(result).toContain('<span class="language-python">');
});

test("kv highlights widget child instantiation lines", () => {
  const result = highlight("  Label:");

  expect(result).toContain('<span class="hljs-title class_">  Label</span>');
});
