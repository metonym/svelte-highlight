import { createRegistry } from "../src/engine.js";

import idris from "../src/languages/idris";

const registry = createRegistry();

registry.register(idris.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "idris" }).value;

test("idris highlights the module header", () => {
  const result = highlight("module Main");

  expect(result).toContain('<span class="hljs-keyword">module</span>');
  expect(result).toContain('<span class="hljs-type">Main</span>');
});

test("idris highlights keywords and type constructors", () => {
  const result = highlight("double : Int -> Int\ndouble n = n + n");

  expect(result).toContain('<span class="hljs-type">Int</span>');
});

test("idris highlights do/case/of/total keywords", () => {
  const result = highlight(
    'total\nmain : IO ()\nmain = do\n  case 1 of\n       1 => putStrLn "one"',
  );

  expect(result).toContain('<span class="hljs-keyword">total</span>');
  expect(result).toContain('<span class="hljs-keyword">do</span>');
  expect(result).toContain('<span class="hljs-keyword">case</span>');
  expect(result).toContain('<span class="hljs-keyword">of</span>');
});

test("idris highlights strings and True/False literals", () => {
  const result = highlight('ready : Bool\nready = True\ngreeting = "hi"');

  expect(result).toContain('<span class="hljs-literal">True</span>');
  expect(result).toContain('<span class="hljs-string">&quot;hi&quot;</span>');
});

test("idris highlights nested block comments", () => {
  const result = highlight("{- outer {- inner -} still outer -}");

  expect(result).toBe(
    '<span class="hljs-comment">{- outer <span class="hljs-comment">{- inner -}</span> still outer -}</span>',
  );
});

test("idris highlights ||| doc comments and % pragmas", () => {
  const result = highlight(
    "%default total\n||| A shape with an area.\ndata Shape : Type where\n  helper = %runElab foo",
  );

  expect(result).toContain(
    '<span class="hljs-meta">%default</span> <span class="hljs-keyword">total</span>',
  );
  expect(result).toContain(
    '<span class="hljs-comment">||| A shape with an area.</span>',
  );
  expect(result).toContain('<span class="hljs-meta">%runElab</span>');
  expect(result).not.toContain('<span class="hljs-keyword">with</span>');
});

test("idris highlights constructor, forall, and as", () => {
  const result = highlight(
    "import Data.Vect as V\nrecord Point where\n  constructor MkPoint\nf : forall a . a -> a",
  );

  expect(result).toContain(
    '<span class="hljs-keyword">as</span> <span class="hljs-type">V</span>',
  );
  expect(result).toContain(
    '<span class="hljs-keyword">constructor</span> <span class="hljs-type">MkPoint</span>',
  );
  expect(result).toContain('<span class="hljs-keyword">forall</span>');
});

test("idris highlights hex, binary, octal, and separated numbers", () => {
  const result = highlight("n = 0x1F + 0b101 + 0o17 + 1_000 + 2.5e3 + 7");

  expect(result).toContain('<span class="hljs-number">0x1F</span>');
  expect(result).toContain('<span class="hljs-number">0b101</span>');
  expect(result).toContain('<span class="hljs-number">0o17</span>');
  expect(result).toContain('<span class="hljs-number">1_000</span>');
  expect(result).toContain('<span class="hljs-number">2.5e3</span>');
  expect(result).toContain('<span class="hljs-number">7</span>');
});

test("idris highlights multi-line, raw, and interpolated strings", () => {
  const result = highlight(
    'x = """\n  multi \\{show c}\n  """\ny = #"raw "quoted" text"#\nz = "hi \\{name}!"',
  );

  expect(result).toContain(
    '<span class="hljs-string">&quot;&quot;&quot;\n  multi <span class="hljs-subst">\\{show c}</span>\n  &quot;&quot;&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">#&quot;raw &quot;quoted&quot; text&quot;#</span>',
  );
  expect(result).toContain(
    '<span class="hljs-string">&quot;hi <span class="hljs-subst">\\{name}</span>!&quot;</span>',
  );
});
