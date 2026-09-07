import { createRegistry } from "../src/engine.js";

import log from "../src/languages/log";

const registry = createRegistry();

registry.register(log.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "log" }).value;

test("log highlights ISO 8601 timestamps with relevance", () => {
  const result = highlight("2026-09-06T10:00:00.123Z INFO starting up");

  expect(result).toContain(
    '<span class="hljs-number">2026-09-06T10:00:00.123Z</span>',
  );
});

test("log highlights info/debug/trace as keyword", () => {
  const result = highlight("INFO starting\nDEBUG details\nTRACE deep");

  expect(result).toContain('<span class="hljs-keyword">INFO</span>');
  expect(result).toContain('<span class="hljs-keyword">DEBUG</span>');
  expect(result).toContain('<span class="hljs-keyword">TRACE</span>');
});

test("log highlights error levels as deletion and warn as addition", () => {
  const result = highlight("ERROR failed\nWARN slow\nFATAL crash");

  expect(result).toContain('<span class="hljs-deletion">ERROR</span>');
  expect(result).toContain('<span class="hljs-addition">WARN</span>');
  expect(result).toContain('<span class="hljs-deletion">FATAL</span>');
});

test("log highlights bracketed tags and pid", () => {
  const result = highlight("[main] pid[4821] starting");

  expect(result).toContain('<span class="hljs-meta">[main]</span>');
  expect(result).toContain('<span class="hljs-meta">pid[4821]</span>');
});

test("log highlights IPs, HTTP methods, and status codes", () => {
  const result = highlight("127.0.0.1 GET /api/users 200");

  expect(result).toContain('<span class="hljs-link">127.0.0.1</span>');
  expect(result).toContain('<span class="hljs-built_in">GET</span>');
  expect(result).toContain('<span class="hljs-number">200</span>');
});

test("log highlights exception words and stack frames", () => {
  const result = highlight(
    "Exception: NullPointerException\n    at com.foo.Bar.process(Bar.java:10)",
  );

  expect(result).toContain('<span class="hljs-keyword">Exception</span>');
  expect(result).toContain(
    '<span class="hljs-title function_">at com.foo.Bar.process(Bar.java:10)</span>',
  );
});
