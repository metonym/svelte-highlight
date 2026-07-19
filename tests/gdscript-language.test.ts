import { createRegistry } from "../src/engine.js";

import gdscript from "../src/languages/gdscript";

const registry = createRegistry();

registry.register(gdscript.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "gdscript" }).value;

test("gdscript highlights control-flow and declaration keywords", () => {
  const result = highlight("func _ready():\n\tif true:\n\t\tpass");

  expect(result).toContain('<span class="hljs-keyword">func</span>');
  expect(result).toContain('<span class="hljs-keyword">if</span>');
  expect(result).toContain('<span class="hljs-keyword">pass</span>');
});

test("gdscript highlights class_name/extends", () => {
  const result = highlight("class_name Player\nextends CharacterBody2D");

  expect(result).toContain('<span class="hljs-keyword">class_name</span>');
  expect(result).toContain('<span class="hljs-keyword">extends</span>');
});

test("gdscript highlights literals", () => {
  const result = highlight("var a = true\nvar b = false\nvar c = null");

  expect(result).toContain('<span class="hljs-literal">true</span>');
  expect(result).toContain('<span class="hljs-literal">false</span>');
  expect(result).toContain('<span class="hljs-literal">null</span>');
});

test("gdscript highlights built-in types", () => {
  const result = highlight("var speed: float = 300.0\nvar count: int = 0");

  expect(result).toContain('<span class="hljs-type">float</span>');
  expect(result).toContain('<span class="hljs-type">int</span>');
});

test("gdscript highlights built-in math constants", () => {
  const result = highlight("var angle = PI\nvar total = TAU");

  expect(result).toContain('<span class="hljs-built_in">PI</span>');
  expect(result).toContain('<span class="hljs-built_in">TAU</span>');
});

test("gdscript highlights strings and comments", () => {
  const result = highlight('# a comment\nvar name = "svelte"');

  expect(result).toContain('<span class="hljs-comment"># a comment</span>');
  expect(result).toContain(
    '<span class="hljs-string">&quot;svelte&quot;</span>',
  );
});

test("gdscript highlights annotations", () => {
  const result = highlight(
    "@export var speed: float = 300.0\n@onready var sprite = $Sprite2D",
  );

  expect(result).toContain('<span class="hljs-meta">@export</span>');
  expect(result).toContain('<span class="hljs-meta">@onready</span>');
});

test("gdscript highlights node path shorthand", () => {
  const result = highlight("@onready var sprite: Sprite2D = $Sprite2D");

  expect(result).toContain('<span class="hljs-variable">$Sprite2D</span>');
});

test("gdscript highlights StringName and NodePath literals", () => {
  const result = highlight('var n = &"name"\nvar p = ^"../Node"');

  expect(result).toContain(
    '<span class="hljs-symbol">&amp;&quot;name&quot;</span>',
  );
  expect(result).toContain(
    '<span class="hljs-symbol">^&quot;../Node&quot;</span>',
  );
});

test("gdscript highlights numeric literals", () => {
  const result = highlight(
    "var a = 0x1A\nvar b = 0b1010\nvar c = 1_000_000\nvar d = .5",
  );

  expect(result).toContain('<span class="hljs-number">0x1A</span>');
  expect(result).toContain('<span class="hljs-number">0b1010</span>');
  expect(result).toContain('<span class="hljs-number">1_000_000</span>');
  expect(result).toContain('<span class="hljs-number">.5</span>');
});
