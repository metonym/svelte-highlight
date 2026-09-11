import { createRegistry } from "../src/engine.js";

import nickel from "../src/languages/nickel";

const registry = createRegistry();

registry.register(nickel.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "nickel" }).value;

test("nickel highlights let/in keywords", () => {
  const result = highlight("let x = 1 in x");

  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">in</span>');
});

test("nickel does not mistag a let-bound name as a record field", () => {
  const result = highlight("let x = 5 in x + 1");

  expect(result).toContain('<span class="hljs-variable">x</span>');
  expect(result).not.toContain('<span class="hljs-attr">x</span>');
});

test("nickel highlights fun keyword", () => {
  const result = highlight("let f = fun x => x in f");

  expect(result).toContain('<span class="hljs-keyword">fun</span>');
});

test("nickel highlights enum tags", () => {
  const result = highlight("let color = 'Red in color");

  expect(result).toContain('<span class="hljs-symbol">&#x27;Red</span>');
});

test("nickel highlights strings and comments", () => {
  const result = highlight('# config\nname = "svelte"');

  expect(result).toContain('<span class="hljs-comment"># config</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;svelte&quot;</span>',
  );
});

test("nickel highlights record field keys", () => {
  const result = highlight("{ foo = 1, bar = 2 }");

  expect(result).toContain('<span class="hljs-attr">foo</span>');
  expect(result).toContain('<span class="hljs-attr">bar</span>');
});

test("nickel interpolation balances a nested record literal", () => {
  const result = highlight('"%{ {name = "Bob"}.name }"');

  expect(result).toContain(
    '<span class="hljs-subst">%{ {name = &quot;Bob&quot;}.name }</span>',
  );
});

test("nickel highlights multiline strings with variable %-count delimiters", () => {
  const result = highlight('m%%"text with "% inside"%%');

  expect(result).toContain(
    '<span class="hljs-string">m%%&quot;text with &quot;% inside&quot;%%</span>',
  );
});

test("nickel does not treat fun parameters or match arms as record fields", () => {
  const result = highlight(
    "f = fun p => p\nm = match { 'Ok x => x, _ => null }\ne = a == b",
  );

  expect(result).toContain('<span class="hljs-keyword">fun</span> p =&gt; p');
  expect(result).toContain(
    '<span class="hljs-symbol">&#x27;Ok</span> x =&gt; x',
  );
  expect(result).toContain("_ =&gt; <span");
  expect(result).toContain('<span class="hljs-attr">f</span>');
  expect(result).toContain('<span class="hljs-attr">e</span>');
  expect(result).not.toContain('<span class="hljs-attr">p</span>');
  expect(result).not.toContain('<span class="hljs-attr">a</span>');
});

test("nickel keeps metadata keywords and annotated types out of the field rule", () => {
  const result = highlight(
    'name | doc "x" | default = "web",\nport : Number = 8080,\nreal-default = 1',
  );

  expect(result).toContain('<span class="hljs-keyword">default</span> =');
  expect(result).toContain('<span class="hljs-type">Number</span> =');
  expect(result).toContain('<span class="hljs-attr">real-default</span>');
  expect(result).not.toContain('<span class="hljs-attr">default</span>');
});

test("nickel highlights let rec bindings", () => {
  const result = highlight(
    "let rec fact = fun n => n in\nlet recurse = 1 in\nlet { a, .. } = r in a",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">let</span> <span class="hljs-keyword">rec</span> <span class="hljs-variable">fact</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">let</span> <span class="hljs-variable">recurse</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">let</span> { a, .. }');
});
