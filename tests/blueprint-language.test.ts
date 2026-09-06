import { createRegistry } from "../src/engine.js";

import blueprint from "../src/languages/blueprint";

const registry = createRegistry();

registry.register(blueprint.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "blueprint" }).value;

test("blueprint highlights the using Gtk header", () => {
  const result = highlight("using Gtk 4.0;");

  expect(result).toContain('<span class="hljs-meta">using Gtk</span>');
});

test("blueprint highlights widget type names", () => {
  const result = highlight("Gtk.Box box {");

  expect(result).toContain('<span class="hljs-title class_">Gtk.Box</span>');
});

test("blueprint highlights signal handlers with the arrow operator", () => {
  const result = highlight("clicked => $on_clicked();");

  expect(result).toContain('<span class="hljs-operator">=&gt;</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">$on_clicked</span>',
  );
});

test("blueprint highlights property assignments", () => {
  const result = highlight("orientation: vertical;");

  expect(result).toContain('<span class="hljs-attr">orientation</span>');
});

test("blueprint highlights comments and translatable strings", () => {
  const result = highlight('// a comment\ntitle: _("My App");');

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;My App&quot;</span>',
  );
});
