// Idiomatic, realistic (multi-line, not single-fragment) samples for a
// representative sweep of this repo's custom (non-hljs) languages. Shared
// by the HighlightAuto and HighlightAutoLazy detection accuracy tests, so
// both score the same corpus.
export const SAMPLES: Record<string, string> = {
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
  angular: `@if (user) {
  <p>{{ user.name }}</p>
} @else {
  <p>Guest</p>
}
<input *ngIf="visible" [(ngModel)]="name" />
`,
  assemblyscript: `@inline
export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function loadX(ptr: usize): i32 {
  return changetype<i32>(unchecked(load<i32>(ptr)));
}
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
  cql: `CREATE TABLE users (
    id UUID PRIMARY KEY,
    name TEXT
);

SELECT name FROM users WHERE id = 123 ALLOW FILTERING;
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
  cedar: `permit (
  principal == User::"alice",
  action == Action::"viewPhoto",
  resource
)
when { resource.owner == principal };
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
  earthfile: `VERSION 0.8
FROM golang:1.22
build:
    COPY src .
    RUN go build -o bin
    SAVE ARTIFACT bin
`,
  esql: `FROM logs-*
| WHERE status >= 500
| STATS count = COUNT(*) BY host
| SORT count DESC
| LIMIT 10
`,
  flux: `from(bucket: "example-bucket")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "cpu")
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
  hurl: `# list users
GET https://example.org/api/users
HTTP 200
[Asserts]
jsonpath "$.id" == 1
header "Content-Type" contains "json"
`,
  jq: `# recursively find every active user, regardless of nesting depth
..
  | objects
  | select(.active == true)
  | {name, email}
`,
  jsonnet: `local f(x) = x + 1;
{
  a: std.length([]),
  b: f(2),
}
`,
  jinja: `{# greeting #}
{% macro hello(name) %}
  <p>Hello {{ name | e }}</p>
{% endmacro %}
{% for item in items %}
  {{ hello(item) }}
{% endfor %}
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
  mojo: `fn add(x: Int, y: Int) -> Int:
    return x + y

struct Point:
    var x: Float64
    fn __init__(inout self, x: Float64):
        self.x = x
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
  prql: `from employees
filter department == "Sales"
group [title] (
  aggregate [average salary]
)
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
  surrealql: `// users who wrote a post
DEFINE TABLE user SCHEMAFULL;
SELECT * FROM user:alice WHERE age > 18;
CREATE user SET name = "Ada";
RELATE user:alice->wrote->post:hello;
`,
  templ: `package main

templ hello(name string) {
	<div>Hello, { name }</div>
}
`,
  mermaid: `%% request flow
flowchart LR
  A[Client] --> B{API}
  subgraph cluster
    B --> C[(Database)]
  end
`,
  kdl: `// app config
package {
  name "svelte-highlight"
  version 1.0
}
server host="localhost" port=8080 enabled=#true
`,
  luau: `export type Point = { x: number, y: number }
local function add(a: number, b: number): number
  continue
  return (a + b) :: number
end
`,
  polar: `resource Document {
  permissions = ["read", "write"];
}

allow(actor: User, "read", resource: Document) if
  has_permission(actor, "read", resource);
`,
  traceql: `{ resource.service.name = "api" && status = error }
{ span.http.status_code >= 500 } >> { name = "SQL SELECT" } | count()
`,
  tsrx: `export function Greeting({ name }: { name?: string }) @{
  const message = name ? "Hello" : "stranger";
  <>
    @if (name) {
      <p>{message}</p>
    }
  </>
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
  wit: `package example:host@0.1.0;

world hello {
  import wasi:io/poll;
  export greet: func(name: string) -> string;
}

interface types {
  record person { name: string, age: u32 }
}
`,
  zig: `pub fn main() !void {
    const x: i32 = 0;
    std.debug.print("{}\\n", .{x});
}
`,
  apex: `public with sharing class AccountService {
    @AuraEnabled
    public static void markHot(List<Id> accountIds) {
        List<Account> accounts = [
            SELECT Id, Rating FROM Account WHERE Id IN :accountIds
        ];
        for (Account a : accounts) {
            a.Rating = 'Hot';
        }
        update accounts;
        System.debug('Updated ' + accounts.size() + ' accounts');
    }
}
`,
  cobol: `       PROCEDURE DIVISION.
       MAIN-PARA.
           PERFORM VARYING WS-I FROM 1 BY 1 UNTIL WS-I > 10
               ADD WS-I TO WS-TOTAL
           END-PERFORM
           IF WS-TOTAL > 50
               MOVE 'HIGH' TO WS-STATUS
           END-IF
           DISPLAY WS-STATUS
           STOP RUN.
`,
  meson: `project('demo', 'c', version : '0.1.0')

cc = meson.get_compiler('c')
m_dep = cc.find_library('m', required : false)

executable('demo', 'main.c',
  dependencies : [m_dep],
  install : true)
`,
  robotframework: `*** Keywords ***
Sum Values
    [Arguments]    @{values}
    VAR    \${total}    \${0}
    FOR    \${value}    IN    @{values}
        IF    \${value} < 0    CONTINUE
        \${total}=    Evaluate    \${total} + \${value}
    END
    RETURN    \${total}
`,
};
