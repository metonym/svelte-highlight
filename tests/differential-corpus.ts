// Snippets used by the differential regression test that highlights the same
// code with both real highlight.js (using each grammar's hand-authored
// `register(hljs)` function in scripts/custom-languages/<name>.js) and this
// repo's from-hljs-converted engine, asserting the two outputs match
// byte-for-byte. Each snippet is short but multi-construct: keywords,
// comments, strings, and at least one nested/structural construct where the
// language has one.
export const CUSTOM_SNIPPETS: Record<string, string> = {
  bibtex: `@article{einstein1905,
  author = {Albert Einstein},
  title  = {On the Electrodynamics of Moving Bodies},
  year   = 1905,
  note   = "Annalen der Physik"
}
% a bibtex comment
@book{doe2020,
  author = {Jane Doe},
  year   = 2020
}`,
  bicep: `targetScope = 'resourceGroup'

@secure()
param adminPassword string

var location = 'eastus'

resource storage 'Microsoft.Storage/storageAccounts@2021-09-01' = {
  name: 'mystorage'
  location: location
}

output storageId string = storage.id`,
  blade: `@php
  $total = 1 + 2;
@endphp
@if($user->isAdmin())
  <p>{{ $user->name }}</p>
@endif
@foreach($items as $item)
  {{ $item }}
@endforeach
{{-- a comment --}}`,
  caddy: `# reverse proxy for the API
example.com {
	@api path /api/*
	reverse_proxy @api localhost:8080 {
		header_up X-Real-IP {remote_host}
		lb_policy round_robin
	}
	file_server
}`,
  cairo: `#[derive(Drop)]
struct Point {
    x: felt252,
    y: felt252,
}

fn main() {
    let caller = get_caller_address();
    panic!("oops");
    assert!(caller != 0, 'bad');
    let a = array![1, 2, 3];
    let hex = 0x1f;
}`,
  clarity: `;; a simple counter contract
(define-data-var counter uint u0)

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (asserts! (is-eq tx-sender contract-caller) (err u1))
    (ok (var-get counter))))`,
  cue: `package config

import "strings"

#Schema: {
	name: string
	port: >=1024 & <=65535
	host: "localhost"
	kind: string | int
}`,
  cypher: `// find a person and their friends
MATCH (p:Person {name: $name})-[:FRIENDS_WITH]->(f:Person)
WHERE p.age > 18
RETURN p.name, labels(p), coalesce(f.name, "unknown")
ORDER BY p.name ASC
LIMIT 10`,
  d2: `# system architecture
server.shape: cylinder
server.style.fill: red
db: {
  shape: cylinder
}
server -> db: query
x.direction: right`,
  dax: `Total Sales =
VAR CurrentRegion = "West"
RETURN
    CALCULATE(
        SUM(Sales[Amount]),
        Sales[Region] = CurrentRegion
    )
-- computes filtered sales total`,
  dhall: `-- a simple record with a function
let increment : Natural -> Natural
      = \\(x : Natural) -> Natural/fold x 1 (\\(_ : Natural) -> x + 1)

let isReady : Bool = True

in  { count = increment 5, ready = isReady }`,
  dotenv: `# application configuration
export NODE_ENV=production
DATABASE_URL="postgres://\${HOST}:\${PORT}/db"
API_KEY='super-secret-value'
TIMEOUT=30
GREETING="hello \${NAME:-guest}"`,
  fish: `# greet a user by name
function greet
    set name $argv[1]
    if test -n "$name"
        echo "hello $name"
    else
        echo "hello stranger"
    end
end

set files (ls *.txt)
echo (count $files)`,
  gleam: `/// Doubles a number
pub fn double(x) {
  x * 2
}

pub type Color {
  Red
}

const ok = True
let greeting = "Hello, " <> "world"`,
  groq: `// recent movies released after 2018
*[_type == "movie" && releaseYear >= 2018]{
  title,
  "slug": slug.current,
  "director": director->name
} | order(title) [0...10]`,
  hcl: `# configure the web instance
resource "aws_instance" "web" {
  instance_type = "t3.micro"
  name          = "web-\${count.index}"
}

variable "region" {
  default = "us-east-1"
}`,
  hlsl: `// vertex shader entry point
#define MAX_LIGHTS 4

float4 main(float2 uv : TEXCOORD0) : SV_TARGET {
  if (uv.x > 0) {
    return saturate(lerp(0, 1, uv.x));
  }
  return float4(0, 0, 0, 1);
}`,
  html: `<!DOCTYPE html>
<!-- page shell -->
<div id="main" class='page'>
  <style>.content { display: flex; }</style>
  <script>const x = 1;</script>
  Hello &amp; world
</div>`,
  jq: `# select active users and total their scores
def add_one: . + 1;
.users
  | map(select(.active))
  | reduce .[] as $item (0; . + $item)
  | if . > 100 then "big" elif . > 10 then "medium" else "small" end`,
  json5: `{
  // config for the app
  /* multi-line
     block comment */
  unquoted: 1,
  'single': 'raw',
  "double": "value",
  hex: 0xFF,
  float: -3.14,
  inf: Infinity,
  ok: true,
  empty: null,
}`,
  jsonc: `{
  // line comment
  /* block comment */
  "name": "svelte",
  "count": 42,
  "ratio": 0.75,
  "ok": true,
  "no": false,
  "empty": null,
  "nested": {
    "flat": true
  }
}`,
  jsonnet: `local greet(name) = "Hello, " + name;
{
  // application config
  name: "svelte",
  ok: true,
  hidden:: 1,
  computed: std.length([1, 2, 3]),
  message: greet("world"),
  note: @"she said ""hi""",
}`,
  just: `# run tests before building
[private]
test: build
    cargo test

build target="release":
    cargo build --{{target}}

export FOO := "bar"`,
  kql: `// filter and summarize security events
let threshold = 5;
SecurityEvent
| where EventID == 4624 and TimeGenerated > ago(1d)
| where State has "california"
| summarize FailedCount = count() by bin(TimeGenerated, 1h)
| mv-expand Tags`,
  liquid: `{% comment %}Renders a product card{% endcomment %}
<div class="card">
  <h1>{{ product.title | upcase }}</h1>
  {% if product.available %}
    <p>{{ product.price }}</p>
  {% else %}
    <p>Sold out</p>
  {% endif %}
</div>`,
  logql: `# filter application errors and compute rate
{job="app", env=~"prod|staging"}
  |= "error" != "debug"
  | json
  | line_format "{{.message}}"
  | unwrap duration [5m]
sum(rate({job="app"} |= "error" [5m])) by (job)`,
  marko: `<!-- greeting widget -->
class {
  onCreate() {
    this.state = { count: 0 };
  }
}
<div class=["card", state.visible]>
  if (state.visible)
    h1 -- \${input.title}
    button on-click("increment") -- Count: \${state.count}
</div>`,
  mdx: `import { Chart } from "./chart";

# Hello MDX

Some **bold** text and \`inline code\`.

<Chart data={points} />

- first item
- second item`,
  move: `module 0x1::coin {
    // Coin resource with drop and store abilities
    struct Coin has drop, store {
        value: u64,
    }

    const SYMBOL: vector<u8> = b"COIN";

    #[test]
    public fun mint(addr: address, amount: u64): Coin {
        let value = amount;
        Coin { value }
    }
}`,
  nickel: `# config record
let name = "svelte" in
{
  greeting = "Hello, %{name}!",
  color = 'Red,
  count = 42,
}`,
  nushell: `# greet script
def greet [name: string] {
  let message = $"Hello ($name)!"
  print $message
}

ls --all | where size > 10kb | sort-by name`,
  odin: `package main

import "core:fmt"

main :: proc() {
    // print a greeting
    x: int = 5
    #partial switch x {
    case 5:
        fmt.println("hello")
    }
}`,
  pkl: `amends "base.pkl"

// server config
@modulepath.SomeAnnotation
class Server {
  host: String = "localhost"
  port: Int = 8080
  greeting = "Hello, \\(host)!"

  function describe() = "\\(host):\\(port)"
}`,
  prisma: `/// User model
model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  role     Role     @default(USER)
  // relation to posts
  posts    Post[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
}`,
  promql: `# alert on high error rate
sum by (job, code) (
  rate(http_requests_total{code="500"}[5m])
) / sum by (job) (
  rate(http_requests_total[5m])
) > 0.05 and node_cpu_seconds_total offset 5m`,
  pug: `doctype html
//- internal note, not rendered
// visible comment
h1#title.big Hello
- var items = ['a', 'b']
if items.length
  ul
    each item in items
      li Item
+button('Save')
p Text with #{item} interpolation`,
  razor: `@page "/counter"
@model CounterModel

@* increments a counter *@
<div class="counter">
  <p>Current count: @count (doubled: @(count * 2))</p>
  @{ if (count > 0) { count = count * 2; } }
</div>

@code {
  int count = 0;
  void Increment() { count++; }
}`,
  rego: `package authz

import future.keywords.if

# allow GET requests for admins
default allow = false

allow if {
  input.method == "GET"
  input.user.role == "admin"
}
deny contains msg if {
  not allow
  msg := sprintf("denied for %s", [input.user.name])
}`,
  rescript: `// simple counter component
type color = Red | Blue

let rec fact = (n) => n <= 1 ? 1 : n * fact(n - 1)

let render = () => {
  let x = #Blue
  <div className="counter">
    {text}
    <Component prop={x} />
  </div>
}`,
  rst: `Title
=====

.. code-block:: python

   print(1)

:param x: the input
:returns: the output

- item one
* item two

This is **strong**, *emphasis*, and \`\`literal\`\`.`,
  solidity: `pragma solidity ^0.8.24;

/// @notice A simple token contract
/// @param owner the initial owner
contract Token {
    mapping(address => uint256) balances;

    constructor(address owner) {}

    function transfer(address to, uint256 amount) public {
        require(msg.sender == owner);
        balances[to] += amount;
    }
}`,
  starlark: `load("//foo:bar.bzl", "baz")

# a comment
def my_rule(name):
    enabled = True
    srcs = glob(["*.go"])
    pass`,
  svelte: `<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<button onclick={() => count++}>{doubled}</button>

{#if count}
  {@render children()}
{:else if count > 10}
  <p>many</p>
{:else}
  <p>few</p>
{/if}`,
  templ: `// Hello renders a greeting
templ Hello(name string) {
	<h1>{ name }</h1>
}

templ Page(items []Item) {
	if isActive {
		<span>Active</span>
	}
	for _, item := range items {
		<li>{ item.Name }</li>
	}
}`,
  toml: `[server]
host = "localhost"
port = 8080
enabled = true

# server list
[[products]]
name = "Widget"
"127.0.0.1" = "value"
updated = 2024-01-02T10:00:00Z`,
  typst: `= Introduction

#let name = "World"
#set text(size: 12pt)

This is *bold* and _emphasis_.

// a comment
$ x^2 + y^2 = z^2 $

See @intro and <label-here>.`,
  v: `struct Point {
	x int
	y int
}
fn main() {
	mut x := int(1)
	name := "v"
	port := 8080
	$if windows {
		println('win')
	} $else {
		println('other')
	}
}`,
  vue: `<script setup lang="ts">
const count = ref(0);
</script>
<template>
  <div v-if="visible" :class="{ active: isActive }">
    <button @click="count++">{{ count }}</button>
    <input v-focus />
  </div>
</template>
<style scoped lang="scss">
.card {
  color: red;
}
</style>`,
  vyper: `@external
def transfer(to: address, amount: uint256):
    # a comment
    x: uint256 = amount
    assert msg.sender == owner

struct Foo:
    a: uint256

interface ERC20:
    def transfer() -> bool: view

event Transfer:
    sender: indexed(address)`,
  wgsl: `@group(0) @binding(0) var t: texture_2d<f32>;
@group(0) @binding(1) var samp: sampler;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let uv: vec2f = vec2f(0.5, 0.5);
  let color: vec4f = textureSample(t, samp, uv);
  let d = dpdx(color.x);
  workgroupBarrier();
}`,
  zig: `const std = @import("std");

pub fn main() !void {
    const x: u32 = 0;
    const mask = 0xFF_00;
    const flags = 0b1010;
    var y: f64 = 0;
    const ok: bool = true;
    const n = null;
}

fn foo() ?u32 {
    return null;
}`,
};
