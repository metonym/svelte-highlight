/**
 * Differential gate: every shipped grammar's engine output (HTML, flat
 * ranges, relevance) is compared byte-exact against real, pinned
 * highlight.js on a corpus of snippets (custom grammars use their original
 * hljs-mode `register(hljs)` source, not the converted IR, as the baseline)
 * plus a couple of real files. Divergences are failures unless explicitly
 * allowlisted with a reviewed reason (tests/differential-allowlist.ts).
 *
 * This promotes prototypes/engine/report.ts (a manual drift report) into a
 * hard assertion wired into `bun run test:unit`.
 */
import coreFactory from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import cpp from "highlight.js/lib/languages/cpp";
import css from "highlight.js/lib/languages/css";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import php from "highlight.js/lib/languages/php";
import python from "highlight.js/lib/languages/python";
import ruby from "highlight.js/lib/languages/ruby";
import rust from "highlight.js/lib/languages/rust";
import scss from "highlight.js/lib/languages/scss";
import sql from "highlight.js/lib/languages/sql";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import {
  createRegistry,
  registerAll,
  renderHtml,
  toRanges,
} from "../src/engine.js";
import * as languages from "../src/languages/index.js";
import {
  DIFFERENTIAL_ALLOWLIST,
  REAL_FILE_ALLOWLIST,
} from "./differential-allowlist.ts";
import { CUSTOM_SNIPPETS } from "./differential-corpus.ts";

// --- snippets (feature-dense: strings, comments, numbers, nesting,
// heredocs, shebangs, sublanguages, generics/captures) ---

const HLJS_SNIPPETS: Record<string, string> = {
  json: `{
  "name": "svelte-highlight",
  "version": 7.14,
  "private": false,
  "nested": { "values": [1, 2.5, -3e4, null, true] },
  "escaped": "line\\nbreak \\"quoted\\""
}`,

  xml: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<!-- a comment TODO: fix this later -->
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel active>
    <title><![CDATA[Feed &amp; Title]]></title>
    <atom:link href="https://example.com/feed" rel="self" />
  </channel>
</rss>`,

  css: `@media screen and (min-width: 640px) {
  .card:hover > .title::after {
    content: "→";
    color: #ff4a2f;
    margin-inline: 0.5rem calc(100% - 2px);
  }
}
#app,
input[type="text"] {
  --brand: rgb(64 128 255 / 80%);
  font: italic bold 14px/1.4 "Fira Code", monospace;
}`,

  scss: `$brand: #663399;
@mixin focus-ring($width: 2px) {
  outline: $width solid lighten($brand, 20%);
}
.button {
  @include focus-ring(3px);
  &:disabled { opacity: 0.4; }
  .icon & { margin: 0; }
}`,

  javascript: `#!/usr/bin/env node
import { readFile } from "node:fs/promises";

/** Load config. TODO: cache this result */
export default async function load(path = "./config.json") {
  const raw = await readFile(path, "utf8");
  const pattern = /^[a-z]+(\\d{2,4})?$/gi;
  class Config extends Map {
    static count = 0;
    get size() { return super.size + Config.count; }
  }
  return \`loaded \${raw.length} bytes in \${Date.now() - t0}ms\`;
}

const cmp = a < b > c;
const el = <div className="card">{children}</div>;`,

  typescript: `interface User<T extends object = {}> {
  readonly id: number;
  tags?: Array<keyof T>;
}
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
enum Level { Debug = 1, Info, Error }
export class Repo<T> implements Iterable<T> {
  private items: T[] = [];
  *[Symbol.iterator](): Iterator<T> { yield* this.items; }
  find(predicate: (item: T) => boolean): T | undefined {
    return this.items.find(predicate);
  }
}

const cmp = a < b > c;
const el = <div className="card">{children}</div>;`,

  python: `#!/usr/bin/env python3
"""Module docstring with \`code\`."""
from dataclasses import dataclass, field

@dataclass(frozen=True)
class Point:
    x: float = 0.0
    y: float = field(default_factory=float)

    def scaled(self, factor: float) -> "Point":
        # numbers: hex, octal, complex
        magic = 0xFF + 0o17 + 3.5j
        return Point(self.x * factor, self.y * factor)

async def main(*args, **kwargs):
    result = f"total={sum(p.x for p in args):.2f}"
    raise NotImplementedError(result)`,

  ruby: [
    'require "json"',
    "",
    "module Search",
    "  class Query",
    "    attr_reader :terms",
    "",
    "    def initialize(terms = [])",
    "      @terms = terms.map(&:downcase)",
    "    end",
    "",
    "    def to_sql",
    "      <<~SQL",
    "        SELECT * FROM docs",
    "        WHERE body LIKE '%#{terms.join(\"%\")}%'",
    "      SQL",
    "    end",
    "  end",
    "end",
    "",
    "puts Search::Query.new(%w[foo bar]).to_sql if __FILE__ == $PROGRAM_NAME",
  ].join("\n"),

  bash: `#!/usr/bin/env bash
set -euo pipefail

count=0
for file in "$@"; do
  [[ -f "$file" ]] || continue
  ((count++))
done

cat <<EOF
Processed $count file(s) at $(date +%H:%M)
EOF

if [ "\${DEBUG:-}" = "1" ]; then
  echo "debug mode" >&2
fi`,

  markdown: `# Title

Some *emphasis* and **strong** text with \`inline code\` and a [link](https://example.com).

- item one
- item two

> quoted wisdom

\`\`\`js
const x = 1;
\`\`\``,

  rust: `use std::collections::HashMap;

#[derive(Debug, Clone)]
pub struct Cache<'a> {
    entries: HashMap<&'a str, u64>,
}

impl<'a> Cache<'a> {
    pub fn insert(&mut self, key: &'a str) -> Option<u64> {
        let hash = key.bytes().fold(0u64, |acc, b| acc.wrapping_mul(31) + b as u64);
        self.entries.insert(key, hash)
    }
}

fn main() {
    let mut cache = Cache { entries: HashMap::new() };
    println!("{:?}", cache.insert("hello"));
}`,

  go: `package main

import (
	"fmt"
	"strings"
)

type Server struct {
	Host string
	Port int
}

func (s *Server) Addr() string {
	return fmt.Sprintf("%s:%d", strings.ToLower(s.Host), s.Port)
}

func main() {
	srv := &Server{Host: "LocalHost", Port: 8080}
	defer fmt.Println("done")
	if addr := srv.Addr(); addr != "" {
		fmt.Println(addr)
	}
}`,

  java: `package com.example;

import java.util.List;
import java.util.stream.Collectors;

public final class Inventory<T extends Comparable<T>> {
    private static final int MAX = 1_000;
    private final List<T> items;

    public Inventory(List<T> items) {
        this.items = items;
    }

    @Override
    public String toString() {
        return items.stream().map(Object::toString).collect(Collectors.joining(", "));
    }
}`,

  sql: `-- fetch recent orders
SELECT o.id, c.name, SUM(o.total) AS revenue
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.created_at >= DATE '2026-01-01'
  AND c.region IN ('us-east', 'eu-west')
GROUP BY o.id, c.name
HAVING SUM(o.total) > 100.50
ORDER BY revenue DESC
LIMIT 25;`,

  yaml: `name: deploy
on:
  push:
    branches: [main]
env:
  NODE_VERSION: "22.4"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          npm ci
          npm test`,

  cpp: `#include <iostream>
#include <vector>

template <typename T>
class Ring {
 public:
  explicit Ring(std::size_t cap) : buf_(cap) {}
  void push(T value) noexcept {
    buf_[head_++ % buf_.size()] = std::move(value);
  }
 private:
  std::vector<T> buf_;
  std::size_t head_ = 0;
};

int main() {
  Ring<int> ring{8};
  ring.push(42);  // the answer
  std::cout << "ok\\n";
  return 0;
}`,

  php: `<?php
declare(strict_types=1);

namespace App;

final class Router
{
    private array $routes = [];

    public function add(string $method, string $path, callable $handler): void
    {
        $this->routes["$method $path"] = $handler;
    }

    public function dispatch(string $key): mixed
    {
        return ($this->routes[$key] ?? fn () => null)();
    }
}`,
};

const ASTRO_SNIPPET = `---
import Layout from "../layouts/Layout.astro";
const title: string = "Hello";
---

<Layout title={title}>
  <h1 class="hero">{title}</h1>
  <style>
    .hero { color: rebeccapurple; }
  </style>
</Layout>`;

const ALL_SNIPPETS: Record<string, string> = {
  ...HLJS_SNIPPETS,
  astro: ASTRO_SNIPPET,
  ...CUSTOM_SNIPPETS,
};

// --- real files (larger inputs, not hand-picked to exercise any one rule) ---

const REAL_FILES: { language: string; path: string }[] = [
  { language: "javascript", path: "src/engine.js" },
  { language: "markdown", path: "README.md" },
];

// --- baseline: real, pinned hljs ---

const HLJS_BUILTIN_GRAMMARS: Record<string, unknown> = {
  json,
  xml,
  css,
  scss,
  javascript,
  typescript,
  python,
  ruby,
  bash,
  markdown,
  rust,
  go,
  java,
  sql,
  yaml,
  cpp,
  php,
};

const hljs = coreFactory.newInstance();
for (const [name, fn] of Object.entries(HLJS_BUILTIN_GRAMMARS)) {
  hljs.registerLanguage(name, fn as any);
}

const customNames = [...Object.keys(CUSTOM_SNIPPETS), "astro"];
const customModules = await Promise.all(
  customNames.map((name) => import(`../scripts/custom-languages/${name}.js`)),
);
for (const mod of customModules) {
  const lang = mod.default as { name: string; register: unknown };
  // Always register (not `if (!hljs.getLanguage(lang.name))`): hljs's own
  // getLanguage resolves aliases too, and a handful of hljs built-ins alias
  // a name this repo also uses for a custom grammar (e.g. "ini" aliases
  // "toml", "json" aliases "jsonc") - an existence check would see the
  // built-in's alias and skip registering the actual custom grammar,
  // silently comparing against the wrong baseline. registerLanguage's own
  // direct assignment makes unconditional (re-)registration safe here.
  hljs.registerLanguage(lang.name, lang.register as any);
}

// --- baseline: flat ranges via hljs's `__emitter` hook (mirrors the retired
// src/token-ranges.js, kept local since it's test-only now) ---

interface HljsRange {
  start: number;
  end: number;
  scope: string;
}

class RangeEmitter {
  pos = 0;
  stack: string[] = [];
  ranges: HljsRange[] = [];
  // biome-ignore lint/complexity/noUselessConstructor: matches hljs's Emitter constructor signature
  constructor(_options: unknown) {}
  addText(text: string) {
    if (text.length === 0) return;
    const scope = this.stack[this.stack.length - 1];
    if (scope !== undefined) {
      this.ranges.push({ start: this.pos, end: this.pos + text.length, scope });
    }
    this.pos += text.length;
  }
  startScope(scope: string) {
    this.stack.push(scope);
  }
  endScope() {
    this.stack.pop();
  }
  openNode(scope: string) {
    this.startScope(scope);
  }
  closeNode() {
    this.endScope();
  }
  __addSublanguage(emitter: RangeEmitter) {
    const base = this.pos;
    for (const r of emitter.ranges) {
      this.ranges.push({
        start: base + r.start,
        end: base + r.end,
        scope: r.scope,
      });
    }
    this.pos += emitter.pos;
  }
  // biome-ignore lint/style/useNamingConvention: interface-mandated name (hljs's Emitter)
  toHTML() {
    return "";
  }
  finalize() {}
}

let defaultEmitter: unknown;

function hljsRanges(code: string, language: string): HljsRange[] {
  if (defaultEmitter === undefined) {
    const probe = hljs.highlight("", { language });
    defaultEmitter = (
      probe as unknown as { _emitter: { constructor: unknown } }
    )._emitter.constructor;
  }
  hljs.configure({ __emitter: RangeEmitter as never });
  try {
    const result = hljs.highlight(code, { language, ignoreIllegals: true });
    return (result as unknown as { _emitter: RangeEmitter })._emitter.ranges;
  } finally {
    hljs.configure({ __emitter: defaultEmitter as never });
  }
}

// --- engine registry: every shipped grammar, dependency-resolved exactly
// like production (see src/registry.js's ensureRegistered) ---

const registry = createRegistry();
for (const language of Object.values(languages)) {
  registerAll(registry, language);
}

// --- allowlist lookup ---

function allowedDimensions(language: string): Set<string> {
  const entry = DIFFERENTIAL_ALLOWLIST.find((e) => e.language === language);
  return new Set(entry?.dimensions ?? []);
}

// --- the gate ---

describe("differential: engine vs hljs", () => {
  for (const [language, code] of Object.entries(ALL_SNIPPETS)) {
    const skip = allowedDimensions(language);

    const expectedHtml = hljs.highlight(code, {
      language,
      ignoreIllegals: true,
    });
    const expectedRanges = hljsRanges(code, language);

    const actual = registry.tokenize(code, language);
    const actualHtml = renderHtml(actual.events);
    const actualRanges = toRanges(actual.events);

    const itHtml = skip.has("html") ? it.failing : it;
    itHtml(`${language}: HTML matches hljs`, () => {
      expect(actualHtml).toBe(expectedHtml.value);
    });

    const itRanges = skip.has("ranges") ? it.failing : it;
    itRanges(`${language}: ranges match hljs`, () => {
      expect(actualRanges).toEqual(expectedRanges);
    });

    const itRelevance = skip.has("relevance") ? it.failing : it;
    itRelevance(`${language}: relevance matches hljs`, () => {
      expect(actual.relevance).toBe(expectedHtml.relevance);
    });
  }
});

describe("differential: engine vs hljs on real files", () => {
  for (const { language, path } of REAL_FILES) {
    const isAllowlisted = REAL_FILE_ALLOWLIST.some((e) => e.path === path);
    const itRealFile = isAllowlisted ? it.failing : it;
    itRealFile(
      `${path} (${language}): HTML and ranges match hljs`,
      async () => {
        const code = await Bun.file(path).text();
        const expectedHtml = hljs.highlight(code, {
          language,
          ignoreIllegals: true,
        });
        const expectedRanges = hljsRanges(code, language);

        const actual = registry.tokenize(code, language);
        expect(renderHtml(actual.events)).toBe(expectedHtml.value);
        expect(toRanges(actual.events)).toEqual(expectedRanges);
      },
    );
  }
});

describe("differential: allowlist hygiene", () => {
  it("only lists languages actually in the corpus or documented as not-yet-covered", () => {
    for (const entry of DIFFERENTIAL_ALLOWLIST) {
      expect(entry.reason.length).toBeGreaterThan(20);
      expect(entry.dimensions.length).toBeGreaterThan(0);
    }
  });

  it("only lists real files with a reviewed reason", () => {
    for (const entry of REAL_FILE_ALLOWLIST) {
      expect(entry.reason.length).toBeGreaterThan(20);
      expect(REAL_FILES.some((f) => f.path === entry.path)).toBe(true);
    }
  });
});
