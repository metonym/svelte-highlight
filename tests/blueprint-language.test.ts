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

test("blueprint highlights kebab-case binding keywords and flags", () => {
  const result = highlight(
    "Gtk.Switch { active: bind-property settings.enabled bidirectional inverted no-sync-create; }\nGtk.Label { label: bind $fn(x) as <string>; }\nGtk.Button { clicked => $cb() swapped; }",
  );

  expect(result).toContain('<span class="hljs-keyword">bind-property</span>');
  expect(result).not.toContain('<span class="hljs-keyword">bind</span>-');
  expect(result).toContain('<span class="hljs-keyword">bidirectional</span>');
  expect(result).toContain('<span class="hljs-keyword">no-sync-create</span>');
  expect(result).toContain('<span class="hljs-keyword">as</span> &lt;');
  expect(result).toContain('<span class="hljs-keyword">swapped</span>');
  // A kebab-case property name is still an attribute.
  expect(result).toContain('<span class="hljs-attr">active</span>:');
});

test("blueprint highlights extension blocks, null, and C_ translations", () => {
  const result = highlight(
    'Gtk.Label { accessibility { label: C_("ctx", "Hi"); } layout { row: 1; } }\nAdw.Breakpoint { condition ("max-width: 500px") setters { bar.title-widget: null; } }\nGtk.FileFilter { mime-types ["text/plain"] }',
  );

  expect(result).toContain('<span class="hljs-keyword">accessibility</span>');
  expect(result).toContain('<span class="hljs-keyword">layout</span>');
  expect(result).toContain('<span class="hljs-keyword">condition</span>');
  expect(result).toContain('<span class="hljs-keyword">setters</span>');
  expect(result).toContain('<span class="hljs-keyword">mime-types</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
  expect(result).toContain(
    '<span class="hljs-string">C_(<span class="hljs-string">&quot;ctx&quot;</span>, <span class="hljs-string">&quot;Hi&quot;</span>)</span>',
  );
  expect(result).not.toContain('<span class="hljs-title class_">C_</span>');
});
