// Snippets used by the differential regression test that highlights the same
// code with both real highlight.js (using each grammar's hand-authored
// `register(hljs)` function in scripts/custom-languages/<name>.js) and this
// repo's from-hljs-converted engine, asserting the two outputs match
// byte-for-byte. Each snippet is short but multi-construct: keywords,
// comments, strings, and at least one nested/structural construct where the
// language has one.
export const CUSTOM_SNIPPETS: Record<string, string> = {
  angular: `@if (user) {
  <p>{{ user.name }}</p>
} @else {
  <p>Guest</p>
}

<input *ngIf="visible" [(ngModel)]="name" (click)="save()" [class.on]="active" #field />

@for (item of items; track item.id) {
  <li>{{ item }}</li>
} @empty {
  <p>None</p>
}`,
  assemblyscript: `// add two i32s
@inline
export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function loadX(ptr: usize): i32 {
  return changetype<i32>(unchecked(load<i32>(ptr)));
}

export function grow(): i32 {
  const label = "pages";
  return memory.grow(1);
}
`,
  baml: `// extract a resume from raw text
function Extract(text: string) -> Resume {
  client GPT4
  prompt #"
    Extract the resume from this text: {{ text }}
    {{ ctx.output_format }}
  "#
}

client<llm> GPT4 {
  provider openai
  options {
    model "gpt-4o"
  }
}`,
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
  bitbake: `# recipe for a simple tool
SUMMARY = "A simple tool"
LICENSE = "MIT"
SRC_URI = "git://example.com/tool.git;branch=main"

DEPENDS += "zlib"
S = "\${WORKDIR}/git"

do_install() {
    install -d \${D}\${bindir}
    install -m 0755 tool \${D}\${bindir}
}

python do_after_install() {
    d.setVar('SOMEVAR', 'value')
}
`,
  bend: `# a binary tree sum
type Tree:
  Node { ~lft, ~rgt }
  Leaf { val }

def sum(tree):
  match tree:
    case Tree/Node:
      return sum(tree.lft) + sum(tree.rgt)
    case Tree/Leaf:
      return tree.val

def main():
  bend x = 0:
    when x < 3:
      fold x = x + 1
    else:
      return #done
`,
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
  blueprint: `using Gtk 4.0;

template $MyWidget : Adw.Window {
  title: _("My App");

  Gtk.Box box {
    orientation: vertical;
    styles ["card"]

    Gtk.Button button {
      label: "Click me";
      clicked => $on_clicked() swapped;
    }
  }
}`,
  caddy: `# reverse proxy for the API
example.com {
	@api path /api/*
	reverse_proxy @api localhost:8080 {
		header_up X-Real-IP {remote_host}
		lb_policy round_robin
	}
	file_server
}`,
  bqn: `# double each number and sum
Double ⇐ ×2
Sum ← +´
Total ← Sum Double¨ ⟨1‿2‿3‿4⟩
•Show Total`,
  bpftrace: `// trace slow syscalls
#include <linux/sched.h>

BEGIN
{
    printf("Tracing syscalls...\\n");
}

kprobe:vfs_read
/pid == 1234/
{
    @start[tid] = nsecs;
}

kretprobe:vfs_read
{
    $dur = nsecs - @start[tid];
    printf("read took %d ns, arg0=%d\\n", $dur, arg0);
}
`,
  c3: `module counters;

fn int increment(int x) {
    $if $defined(x):
        return x + 1;
    $endif
    return x;
}

struct Counter {
    int value;
    String? name;
}

fn void main() {
    Counter c = { .value = 0 };
    switch (c.value) {
        case 0:
            nextcase default;
        default:
            io::printn("done");
    }
}
`,
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
  cedar: `// photo access
permit (
  principal == User::"alice",
  action == Action::"viewPhoto",
  resource
)
when { resource.owner == principal };

forbid (principal, action, resource)
unless { context.mfa == false };
`,
  cel: `// admin or verified owner may edit
has(request.auth) &&
  (request.auth.role == "admin" ||
    (request.auth.uid == resource.owner && resource.verified))
? "allow"
: "deny"`,
  civet: `### block comment
describing this snippet ###
x := 1  # single-line comment
double := (n) -> n * 2
result := x |> double
unless result is 0
  console.log "not zero"
add := (a, b) => a + b
@name = "civet"`,
  cisco: `! configure the uplink interface
interface GigabitEthernet0/0/1
 description Uplink to core
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
access-list 101 permit tcp any host 10.0.0.5 eq 443
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
`,
  clarity: `;; a simple counter contract
(define-data-var counter uint u0)

(define-public (increment)
  (begin
    (var-set counter (+ (var-get counter) u1))
    (asserts! (is-eq tx-sender contract-caller) (err u1))
    (ok (var-get counter))))`,
  codeql: `/**
 * @name Unused variable
 * @kind problem
 * @problem.severity warning
 */
import javascript

from Variable v
where not exists(VarAccess a | a.getVariable() = v)
select v, "Unused variable $@.", v, v.getName()
`,
  cql: `-- fetch a user
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT
);
SELECT name FROM users WHERE id = ? ALLOW FILTERING;
`,
  crontab: `# run backups nightly
SHELL=/bin/bash
MAILTO=admin@example.com

0 2 * * * /usr/local/bin/backup.sh --quiet
*/15 * * * * root /usr/bin/check-disk.sh
0 9 1 JAN-MAR * echo "quarterly report" >> /var/log/report.log
@reboot /usr/local/bin/on-boot.sh
`,
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
  datalog: `// transitive closure over an edge relation
.decl edge(x: symbol, y: symbol)
.decl path(x: symbol, y: symbol)
.input edge
edge("a", "b").
edge("b", "c").

path(x, y) :- edge(x, y).
path(x, y) :- path(x, z), edge(z, y), !edge(y, x).

.output path`,
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
  djot: `# A demo document

This is *strong* and _emphasis_ and \`verbatim\`.

- first item
- [x] task done

> a block quote

{.note #intro}
A paragraph with an attribute block above it.

See the [docs](https://example.com) for more :smile:
`,
  dotenv: `# application configuration
export NODE_ENV=production
DATABASE_URL="postgres://\${HOST}:\${PORT}/db"
API_KEY='super-secret-value'
TIMEOUT=30
GREETING="hello \${NAME:-guest}"`,
  dtrace: `#!/usr/sbin/dtrace -s
/* trace slow reads */
#pragma D option quiet

syscall::read:entry
{
    self->start = timestamp;
}

syscall::read:return
/self->start/
{
    @counts[execname] = count();
    printf("%s took %d ns\\n", execname, timestamp - self->start);
    self->start = 0;
}
`,
  earthfile: `# compile the Go binary
VERSION 0.8
FROM golang:1.22
WORKDIR /app
build:
    COPY src .
    RUN go build -o bin
    SAVE ARTIFACT bin
    IF [ -f go.mod ]
        RUN go mod download
    END
`,
  ejs: `<%# render a list of users %>
<ul>
  <% users.forEach(function(user) { %>
    <li><%= user.name %></li>
  <% }); %>
</ul>
<p><%- rawHtml %></p>`,
  agda: `-- naturals and a simple proof
{-# OPTIONS --safe #-}
data ℕ : Set where
  zero : ℕ
  suc  : ℕ → ℕ

{- nested
   {- inner -}
   comment -}
double : ℕ → ℕ
double zero = zero
double (suc n) = suc (suc (double n))`,
  esql: `// error rate by host
FROM logs-*
| WHERE status >= 500
| STATS count = COUNT(*) BY host
| SORT count DESC
| LIMIT 10
`,
  fennel: `;; sum two numbers
(fn add [a b]
  (+ a b))

(local greeting :hello)
(each [i v (ipairs [1 2 3])]
  (print i v))

(print (add 1 2) greeting "done")`,
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
  flux: `// cpu mean
from(bucket: "example-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
  |> mean()
`,
  gbnf: `# a simple JSON-ish grammar
root ::= object
object ::= "{" pair ("," pair)* "}"
pair ::= string ":" value
value ::= string | number | object
string ::= "\\"" [^"]* "\\""
number ::= [0-9]+ ("." [0-9]+)?`,
  gleam: `/// Doubles a number
pub fn double(x) {
  x * 2
}

pub type Color {
  Red
}

const ok = True
let greeting = "Hello, " <> "world"`,
  gdscript: `# player controller
extends CharacterBody2D
class_name Player

@export var speed: float = 300.0

func _ready() -> void:
	if true:
		pass
`,
  gotmpl: `{{- /* render a greeting */ -}}
{{ define "greeting" }}
Hello, {{ .Name | printf "%s" }}!
{{ if .Admin }}
  You are an admin, {{ $name := .Name }}{{ $name }}.
{{ else }}
  {{ range .Items }}
    - {{ . }}
  {{ end }}
{{ end }}
{{ end }}`,
  graphviz: `// a simple pipeline
digraph pipeline {
  rankdir=LR;
  node [shape=box, fontname="Helvetica"];

  subgraph cluster_build {
    label="build";
    compile -> test;
  }

  test -> deploy [label="on success", color=green];
  deploy -> "prod:n" [style=dashed];
}
`,
  groq: `// recent movies released after 2018
*[_type == "movie" && releaseYear >= 2018]{
  title,
  "slug": slug.current,
  "director": director->name
} | order(title) [0...10]`,
  haproxy: `global
    log stdout format raw local0
    maxconn 4096

defaults
    mode http
    timeout connect 5s
    timeout client 30s
    timeout server 30s

frontend web
    bind *:80
    acl is_api path_beg /api
    use_backend api_servers if is_api
    default_backend web_servers

backend web_servers
    balance roundrobin
    server web1 10.0.0.1:8080 check
`,
  hcl: `# configure the web instance
resource "aws_instance" "web" {
  instance_type = "t3.micro"
  name          = "web-\${count.index}"
}

variable "region" {
  default = "us-east-1"
}`,
  helm: `apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "app.fullname" . }}
data:
  {{- if .Values.debug }}
  level: debug
  {{- else }}
  level: info
  {{- end }}
  config.yaml: |
    {{ toYaml .Values.settings | nindent 4 }}
`,
  heex: `<%!-- user card --%>
<.card class={@highlighted && "on"}>
  <p :if={@user.bio}>{@user.bio}</p>
  <%= for post <- @posts do %>
    <li>{post.title}</li>
  <% end %>
</.card>
`,
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
  idris: `-- module header and a total function
module Main

{- nested
   {- inner -}
   comment -}

total
double : Int -> Int
double n = n + n

main : IO ()
main = do
  let greeting = "Hello, " ++ "world"
  case double 21 of
       42 => putStrLn greeting
       _  => putStrLn "nope"`,
  imba: `# a card component with inline css
tag Card
  css .card
    padding: 8px

  def render
    <self.card>
      <div.title> "Hello"
      <button @click=onClick> "Click"`,
  hurl: `# list users
GET https://example.org/api/users
HTTP 200
[Asserts]
jsonpath "$.id" == 1
header "Content-Type" contains "json"
`,
  jinja: `{# greeting #}
{% macro hello(name) %}
  <p>Hello {{ name | e }}</p>
{% endmacro %}
{% for item in items %}
  {{ hello(item) }}
{% endfor %}
`,
  jmespath:
    "people[?age > \`30\`].{name: name, city: address.city} | sort_by(@, &name)",
  jq: `# select active users and total their scores
def add_one: . + 1;
.users
  | map(select(.active))
  | reduce .[] as $item (0; . + $item)
  | if . > 100 then "big" elif . > 10 then "medium" else "small" end`,
  jsonata: `/* total price of active orders */
$sum(
  Account.Order[Status = "active"].Product.(Price * Quantity)
)

Account.\`Order Item\`[0].Description`,
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
  kdl: `// app config
package {
  name "svelte-highlight"
  version 1.0
}
server host="localhost" port=8080 enabled=#true
/- skipped 1
created (date)"2024-01-01"
`,
  kcl: `# a schema with a check block
schema Person:
    name: str
    age: int

    check:
        age >= 0, "age must be non-negative"

people = [Person {name = "Alice", age = 30}]
`,
  kconfig: `config DEBUG_KERNEL
    bool "Kernel debugging"
    default n
    help
      Say Y here to enable kernel debugging.
      This adds extra checks and may slow the
      kernel down.

config LOG_LEVEL
    int "Log level"
    range 0 7
    default 4
    depends on DEBUG_KERNEL
`,
  koka: `// prints a greeting with an effect
effect ctl ask() : int

fun greet() : <ask,console> ()
  val name = ask()
  println("Hello, " ++ name.show)

fun main()
  handle(greet)
    ctl ask() -> resume(42)
`,
  kv: `#:kivy 2.0
#:import utils app.utils

<MyWidget@BoxLayout>:
  orientation: "vertical"
  canvas.before:
    Color:
      rgba: 1, 1, 1, 1

  Label:
    text: "Hello, {}".format(self.name)
    on_press: root.handle_press(self)
`,
  kql: `// filter and summarize security events
let threshold = 5;
SecurityEvent
| where EventID == 4624 and TimeGenerated > ago(1d)
| where State has "california"
| summarize FailedCount = count() by bin(TimeGenerated, 1h)
| mv-expand Tags`,
  ldscript: `/* a simple linker script */
ENTRY(_start)

MEMORY
{
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 256K
    RAM (rwx)   : ORIGIN = 0x20000000, LENGTH = 64K
}

SECTIONS
{
    .text : {
        *(.text*)
    } > FLASH

    .data : {
        *(.data*)
    } > RAM AT> FLASH
}
`,
  lean: `-- successor function over naturals
/- nested doc:
   /- inner note -/
   still here -/
def succ (n : ℕ) : ℕ := n + 1

theorem succ_pos : ∀ n : ℕ, succ n > 0 := by
  intro n
  simp [succ]`,
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
  lookml: `view: orders {
  sql_table_name: schema.orders ;;

  dimension: id {
    primary_key: yes
    type: number
    sql: \${TABLE}.id ;;
  }

  measure: total_orders {
    type: count
    drill_fields: [id]
  }
}
`,
  luau: `-- typed greeting
export type Point = { x: number, y: number }

local function add(a: number, b: number): number
  continue
  return (a + b) :: number
end
`,
  markdoc: `---
title: Getting Started
---

# Welcome

{% comment %} internal note, not rendered {% /comment %}

{% callout type="warning" %}
Set the $name variable before calling {% if(equals($name, "")) %}validate(){% /if %}.
{% /callout %}

{% partial file="footer.md" /%}
`,
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
  mermaid: `%% request flow
flowchart LR
  A[Client] --> B{API}
  subgraph cluster
    B --> C[(Database)]
  end
  sequenceDiagram
    participant Alice
    Alice->>Bob: Hello
`,
  mdx: `import { Chart } from "./chart";

# Hello MDX

Some **bold** text and \`inline code\`.

<Chart data={points} />

- first item
- second item`,
  modelfile: `# a custom llama model
FROM llama3.2
PARAMETER temperature 0.7
PARAMETER num_ctx 4096
SYSTEM """You are a helpful assistant."""
TEMPLATE """{{ .Prompt }}"""
MESSAGE system You are concise.
MESSAGE user Hello!`,
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
  mojo: `# origin
fn add(x: Int, y: Int) -> Int:
    return x + y

struct Point:
    var x: Float64
    fn __init__(inout self, x: Float64):
        self.x = x
`,
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
  org: `* TODO Write quarterly report [#A]           :work:report:
SCHEDULED: <2026-09-10 Thu>

:PROPERTIES:
:CREATED:  [2026-09-06 Sun]
:END:

Check the [[https://example.com][dashboard]] for *important* numbers.

- first item
- [X] second item done
1. ordered item

# a comment line
`,
  pkl: `amends "base.pkl"

// server config
@modulepath.SomeAnnotation
class Server {
  host: String = "localhost"
  port: Int = 8080
  greeting = "Hello, \\(host)!"

  function describe() = "\\(host):\\(port)"
}`,
  plantuml: `@startuml
' a simple sequence diagram
actor User
participant "Web Server" as Web
database DB

User -> Web : request page
Web --> DB : query
DB --> Web : rows
Web --> User : 200 OK

note right of Web #lightblue
  cache miss
end note
@enduml
`,
  plsql: `CREATE OR REPLACE PROCEDURE raise_salary(p_id NUMBER) IS
  v_salary employees.salary%TYPE;
BEGIN
  SELECT salary INTO v_salary FROM employees WHERE id = p_id;
  v_salary := v_salary * 1.1;
  UPDATE employees SET salary = v_salary WHERE id = p_id;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20001, 'Employee not found');
END;
/
`,
  polar: `# document access
resource Document {
  permissions = ["read", "write"];
}

allow(actor: User, "read", resource: Document) if
  has_permission(actor, "read", resource);
`,
  powerquery: `let
    // load the source table
    Source = Csv.Document(File.Contents("data.csv")),
    #"Changed Type" = Table.TransformColumnTypes(Source, {{"Amount", Int64.Type}}),
    Total = List.Sum(Table.Column(#"Changed Type", "Amount"))
in
    each if Total > 0 then Total else 0
`,
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
  purescript: `-- module header and a simple function
module Main where

{- a nested
   {- inner -}
   block comment -}

double :: Int -> Int
double n = n + n

main :: Effect Unit
main = do
  let greeting = "Hello, " <> "world"
  case double 21 of
    42 -> log greeting
    _  -> log "nope"`,
  promql: `# alert on high error rate
sum by (job, code) (
  rate(http_requests_total{code="500"}[5m])
) / sum by (job) (
  rate(http_requests_total[5m])
) > 0.05 and node_cpu_seconds_total offset 5m`,
  prql: `from employees
filter department == "Sales"
derive [
  gross = salary + tax,
]
group [country] (
  aggregate [average salary]
)
`,
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
  racket: `#lang racket
;; sum of two numbers with a contract
(define/contract (add a b)
  (-> integer? integer? integer?)
  (+ a b))

(define pi 3.14159)
(displayln (format "~a" (add 1 2)))
#| a block
   comment |#`,
  raku: `#| doubles a number
sub double(Int $x) {
    return $x * 2;
}

my $name = "world";
say "Hello, $name!";

class Point {
    has $.x is rw;
    has $.y is rw;
}

my $p = Point.new(x => 1, y => 2);
say $p.x ~~ $p.y;
`,
  regex: String.raw`^(?<year>\d{4})-(?<month>\d{2})-\d{2}\s+#\s*optional comment
(?:https?|ftp):\/\/[\w.-]+\.[a-z]{2,}
[[:alpha:]]+\d*\.?\p{L}*
(?#inline comment)\k<year>\1`,
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
  roc: `app [main] { pf: platform "https://github.com/roc-lang/basic-cli" }

## Doubles a number
double = \\n -> n * 2

main =
    result <- Task.await (Stdout.line "Hello, $(name)!")
    when result is
        Ok _ -> Stdout.line "done"
        Err _ -> crash "failed"`,
  rpmspec: `Name: mypackage
Version: 1.0
Release: 1%{?dist}
Summary: An example package
License: MIT
BuildRequires: gcc

%description
This is an example package.

%prep
%autosetup

%build
%configure
%make_build

%install
%make_install

%files
%license LICENSE
%{_bindir}/mypackage

%changelog
* Mon Jan 01 2024 Jane Doe <jane@example.com> - 1.0-1
- Initial package
`,
  rst: `Title
=====

.. code-block:: python

   print(1)

:param x: the input
:returns: the output

- item one
* item two

This is **strong**, *emphasis*, and \`\`literal\`\`.`,
  smithy: `$version: "2"

namespace com.example

/// A simple user shape
@readonly
structure User {
    @required
    id: String

    name: String
}

service UserService {
    version: "2024-01-01"
    resources: [com.example#User]
}
`,
  snort: `# detect suspicious HTTP requests
alert tcp $EXTERNAL_NET any -> $HOME_NET 80 (
    msg:"Suspicious User-Agent";
    content:"User-Agent|3A|"; http_header;
    content:"evilbot"; distance:0; nocase;
    pcre:"/evil[0-9]+/i";
    classtype:trojan-activity;
    sid:1000001; rev:1;
)
`,
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
  sparql: `PREFIX foaf: <http://xmlns.com/foaf/0.1/>
SELECT ?name ?email
WHERE {
  ?person a foaf:Person ;
          foaf:name ?name .
  OPTIONAL { ?person foaf:mbox ?email }
  FILTER (LANG(?name) = "en")
}
`,
  slint: `// a slider component
export component Slider {
    in-out property <int> value: 0;
    callback changed(int);

    Rectangle {
        background: #3a3a3a;
        width: 200px;
        height: 24px;

        handle := Rectangle {
            width: 12px;
            x <=> root.value;
        }
    }
}
`,
  splunk: `search index=web status>=500
| stats count by host
| eval error_rate = count / total
| where error_rate > 0.05 AND host != "test"
| sort - count`,
  starlark: `load("//foo:bar.bzl", "baz")

# a comment
def my_rule(name):
    enabled = True
    srcs = glob(["*.go"])
    pass`,
  structurizr: `workspace "Big Bank" {
  !identifiers hierarchical

  model {
    customer = person "Customer"
    softwareSystem = softwareSystem "Internet Banking" {
      webapp = container "Web Application"
    }

    customer -> softwareSystem.webapp "Uses" "HTTPS"
  }

  views {
    systemContext softwareSystem {
      include *
      autoLayout lr
    }
  }
}
`,
  surrealql: `// users who wrote a post
DEFINE TABLE user SCHEMAFULL;
SELECT * FROM user:alice WHERE age > 18;
CREATE user SET name = "Ada";
RELATE user:alice->wrote->post:hello;
`,
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
  systemd: `[Unit]
Description=Example web service
After=network-online.target
Wants=network-online.target

[Service]
Type=notify
User=www-data
Environment=PORT=%p
ExecStartPre=-/usr/bin/mkdir -p /run/example
ExecStart=/usr/bin/example-server --port=\${PORT}
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
`,
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
  textproto: `# proto-file: example.proto
# proto-message: Person

name: "Alice"
age: 30
active: true
scores: [95, 87, 100]

[com.example.ext.special_field]: "extended"

address {
  city: "Springfield"
  zip: "00000"
}
`,
  tsq: `; match a function definition with a captured name
(function_item
  name: (identifier) @function.name
  parameters: (parameters) @function.params) @function.def

(call_expression
  function: [(identifier) (field_expression)] @call
  !type_arguments)

((identifier) @constant
  (#match? @constant "^[A-Z_]+$"))

(ERROR) @error
_ @any`,
  tsql: `DECLARE @count INT;

SELECT TOP 10 [OrderId], N'note' AS Note
FROM #TempOrders WITH (NOLOCK)
WHERE CustomerId = @count AND @@ROWCOUNT > 0;
GO
`,
  tsrx: `export function Greeting({ name }: { name?: string }) @{
  const message = name ? \`Hello, \${name}\` : "stranger";

  <>
    @if (name) {
      <p>{message}</p>
    }
    <style>
      p { color: blue; }
    </style>
  </>
}

function Counter(&{ count }: Props) @{
  <span>{count}</span>
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
  traceql: `# slow error traces
{ resource.service.name = "api" && status = error }
{ span.http.status_code >= 500 } >> { name = "SQL SELECT" } | count()
{ duration > 5s }
`,
  turtle: `@prefix ex: <http://example.org/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

ex:alice a ex:Person ;
  ex:name "Alice"@en ;
  ex:age "30"^^xsd:integer ;
  ex:knows _:b1 .

_:b1 ex:name "Bob" .
`,
  typst: `= Introduction

#let name = "World"
#set text(size: 12pt)

This is *bold* and _emphasis_.

// a comment
$ x^2 + y^2 = z^2 $

See @intro and <label-here>.`,
  typespec: `import "@typespec/http";
using TypeSpec.Http;

@doc("A simple user model")
model User {
  @key
  id: string;

  name: string;
  age?: int32;
}

@route("/users")
interface Users {
  @get op list(): User[];
}
`,
  uiua: `# double each number and sum
Double ← ×2
Total ← /+ ≡Double [1 2 3 4]
&p $"Total: _" Total`,
  unison: `-- doubles every element of a list
structural ability Stream where
  emit : Nat -> ()

use List map

double : [Nat] -> [Nat]
double xs = map (n -> n * 2) xs

test> double.tests.ex1 =
  match double [1, 2, 3] with
    [2, 4, 6] -> ok "matched"
    _ -> fail "no match"`,
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
  vrl: `# normalize an incoming log event
. = parse_json!(.message)
.status_code = to_int(.status_code) ?? 0
if exists(.error) {
    .level = "error"
} else {
    .level = "info"
}
del(.raw)`,
  verse: `<# a simple counter class #>
counter_device := class(creative_device):
    Count : int = 0

    OnBegin<override>()<suspends> : void =
        loop:
            Count += 1

    GetCount<public>()<decides><transacts> : int =
        Count`,
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
  vcl: `vcl 4.1;

import std;

backend default {
    .host = "127.0.0.1";
    .port = "8080";
}

sub vcl_recv {
    if (req.method == "PURGE") {
        return (purge);
    }
    set req.http.X-Forwarded-For = client.ip;
}

sub vcl_backend_response {
    set beresp.ttl = 1h;
}
`,
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
  wit: `// host world
package example:host@0.1.0;

world hello {
  import wasi:io/poll;
  export greet: func(name: string) -> string;
}

interface types {
  record person { name: string, age: u32 }
  variant error { not-found, other(string) }
}
`,
  yang: `module example-system {
  namespace "urn:example:system";
  prefix sys;

  import ietf-inet-types {
    prefix inet;
  }

  leaf-list address {
    type inet:ip-address;
    description
      "A list of addresses.";
  }

  container system {
    leaf host-name {
      type string;
      default "localhost";
    }

    augment "/system/config" {
      leaf enabled {
        type boolean;
        default true;
      }
    }
  }
}
`,
  yara: `import "pe"

rule SuspiciousExecutable : malware
{
    meta:
        author = "analyst"
        threat = "trojan"

    strings:
        $a = "malicious_string" nocase
        $hex = { E2 34 ?? C8 }
        $re = /evil[0-9]+/i

    condition:
        uint16(0) == 0x5A4D and $a and $hex and pe.number_of_sections > 3
}
`,
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
