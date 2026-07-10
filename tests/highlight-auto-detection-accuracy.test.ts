import { registerAll } from "../src/engine.js";
import allLanguages from "../src/languages/all.js";
import { registry } from "../src/registry.js";

for (const language of allLanguages) registerAll(registry, language);

// Idiomatic, realistic (multi-line, not single-fragment) samples for a
// representative sweep of this repo's custom (non-hljs) languages, scored
// against the FULL unrestricted candidate pool (all 244 registered grammars)
// via `highlightAuto` - the scenario a consumer gets by default, without
// restricting `languageNames`.
const SAMPLES: Record<string, string> = {
  solidity: `pragma solidity ^0.8.0;

contract Token {
    mapping(address => uint256) public balanceOf;

    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        return true;
    }
}
`,
  astro: `---
import Layout from "../layouts/Layout.astro";
const title = "Hello";
---
<Layout {title}>
  <h1>{title}</h1>
</Layout>
`,
  prisma: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
}
`,
  hcl: `resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "HelloWorld"
  }
}
`,
  bibtex: `@article{einstein1905,
  author = {Albert Einstein},
  title  = {On the Electrodynamics of Moving Bodies},
  year   = 1905
}
`,
  bicep: `targetScope = 'resourceGroup'

param location string = 'eastus'

resource storage 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: 'mystorage'
  location: location
}
`,
  blade: `@if($user->isAdmin())
  <p>{{ $user->name }}</p>
@endif
@foreach($items as $item)
  {{ $item }}
@endforeach
`,
  caddy: `example.com {
	reverse_proxy localhost:8080
	file_server
}
`,
  cairo: `#[derive(Drop)]
struct Point {
    x: felt252,
    y: felt252,
}

fn main() {
    let caller = get_caller_address();
}
`,
  clarity: `(define-public (transfer (amount uint) (recipient principal))
  (begin
    (asserts! (> amount u0) (err u1))
    (ok true)))
`,
  cue: `package config

#Schema: {
  name: string
  age:  int & >=0
}
`,
  cypher: `MATCH (n:Person)-[:KNOWS]->(m:Person)
WHERE n.age > 30
RETURN n, m
`,
  d2: `server.shape: cylinder
client -> server: request
server -> client: response
`,
  dax: `Total Sales = CALCULATE(SUM(Sales[Amount]), Sales[Region] = "West")
`,
  dhall: `let greeting : Text = "Hello"
let n : Natural = 1
in { greeting = greeting, n = n }
`,
  dotenv: `# database config
NODE_ENV=production
DATABASE_URL=postgres://localhost:5432/db
`,
  gleam: `pub fn main() {
  let x = 0
  io.println("hello")
}
`,
  groq: `*[_type == "post" && published == true] {
  title,
  "slug": slug.current
} | order(publishedAt desc)
`,
  jq: `.users | map(select(.active)) | length
`,
  jsonnet: `local f(x) = x + 1;
{
  a: std.length([]),
  b: f(2),
}
`,
  just: `test: build
    cargo test

build:
    cargo build --release
`,
  kql: `StormEvents
| where State == "TEXAS"
| summarize count() by EventType
`,
  liquid: `{% if user %}
  {{ product.title }}
{% endif %}
`,
  logql: `{job="mysql"} |= "error" | json | line_format "{{.message}}"
`,
  move: `module addr::Coin {
    public fun mint(amount: u64): Coin {
        Coin { value: amount }
    }
}
`,
  nickel: `let f = fun x => x + 1 in
{ result = f 2 }
`,
  nushell: `let x = 1
mut y = 2
ls | where size > 10 | sort-by name
`,
  odin: `main :: proc() {
    x := 5
    fmt.println(x)
}
`,
  pkl: `function add(x, y) = x + y

result = add(1, 2)
`,
  promql: `sum(rate(http_requests_total[5m])) by (job)
`,
  pug: `doctype html
html
  head
    title My Page
  body
    h1 Hello
`,
  razor: `@page
@model Foo

<div>@Model.Name</div>
`,
  rego: `package authz

import future.keywords.if

allow if {
    input.method == "GET"
}
`,
  rescript: `let greet = (name) => "hello " ++ name

type color = Red | Green | Blue
`,
  rst: `Title
=====

Body text with *emphasis*.

.. code-block:: python

   print(1)
`,
  starlark: `def my_rule(name, srcs):
    pass

enabled = True
`,
  templ: `package main

templ hello(name string) {
	<div>Hello, { name }</div>
}
`,
  typst: `= Introduction

This is *bold* and _italic_ text.
`,
  v: `fn main() {
    mut x := int(1)
    println(x)
}
`,
  vyper: `@external
def transfer(to: address, amount: uint256) -> bool:
    self.balanceOf[msg.sender] -= amount
    return True
`,
  wgsl: `@vertex
fn main(@location(0) pos: vec3<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(pos, 1.0);
}
`,
  zig: `pub fn main() !void {
    const x: i32 = 0;
    std.debug.print("{}\\n", .{x});
}
`,
};

// Deliberate, reviewable record of samples above that do NOT yet win
// full-corpus auto-detection (an unrelated, higher-scoring grammar wins
// instead) - most commonly because the language's own relevance signal
// (keyword/structural matches) is modest while some other registered
// grammar's broader, more generic rules pick up incidental relevance on the
// same text (e.g. any `@word`-prefixed syntax scores non-trivially for
// blade's directive rule, regardless of what `@word` actually means in the
// sample's own language). This is a real accuracy gap in `HighlightAuto`
// for custom/niche languages against the full unrestricted candidate pool,
// not a conversion bug like the mathematica/gcode relevance fix nearby in
// this test suite - `languageNames` restriction (see
// tests/highlight-auto-candidate-selection.test.ts) is the reliable way to
// auto-detect among a known, narrower set of these languages today.
// Move a language OUT of this set (and let its assertion below flip to
// "wins") once a grammar/relevance change fixes it; a language unexpectedly
// disappearing from FAIL here (without being removed from this set) will
// fail loudly instead of silently improving unnoticed.
const KNOWN_AUTO_DETECT_GAPS = new Set([
  "astro",
  "prisma",
  "hcl",
  "bibtex",
  "bicep",
  "caddy",
  "clarity",
  "cue",
  "cypher",
  "d2",
  "dax",
  "dhall",
  "dotenv",
  "gleam",
  "groq",
  "jsonnet",
  "just",
  "kql",
  "liquid",
  "logql",
  "move",
  "nickel",
  "nushell",
  "odin",
  "pkl",
  "promql",
  "razor",
  "rego",
  "rescript",
  "starlark",
  "typst",
  "v",
  "vyper",
  "wgsl",
  "zig",
]);

describe("HighlightAuto detection accuracy across custom languages (full 244-candidate pool)", () => {
  for (const [expected, code] of Object.entries(SAMPLES)) {
    if (KNOWN_AUTO_DETECT_GAPS.has(expected)) {
      it(`${expected}: known gap, does not yet win full-corpus auto-detect`, () => {
        const result = registry.highlightAuto(code);
        expect(result.language).not.toBe(expected);
      });
    } else {
      it(`${expected}: wins full-corpus auto-detect`, () => {
        const result = registry.highlightAuto(code);
        expect(result.language).toBe(expected);
      });
    }
  }

  it("every sample restricted to just itself always detects correctly", () => {
    // Sanity check: each language's own sample is unambiguous when it's the
    // only candidate - the gaps above are strictly about cross-language
    // relevance competition, not the samples themselves being unrecognizable.
    for (const [expected, code] of Object.entries(SAMPLES)) {
      const result = registry.highlightAuto(code, [expected]);
      expect(result.language).toBe(expected);
    }
  });
});
