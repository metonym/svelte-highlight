import { createRegistry } from "../src/engine.js";

import bpftrace from "../src/languages/bpftrace";

const registry = createRegistry();

registry.register(bpftrace.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "bpftrace" }).value;

test("bpftrace highlights probe specifiers as the relevance carrier", () => {
  const result = highlight("kprobe:vfs_read\n{\n}");

  expect(result).toContain(
    '<span class="hljs-title function_">kprobe:vfs_read</span>',
  );
});

test("bpftrace highlights maps and scratch variables", () => {
  const result = highlight("@start[tid] = nsecs;\n$dur = nsecs;");

  expect(result).toContain('<span class="hljs-variable">@start</span>');
  expect(result).toContain('<span class="hljs-variable">$dur</span>');
});

test("bpftrace highlights argN as a language variable", () => {
  const result = highlight('printf("%d\\n", arg0);');

  expect(result).toContain('<span class="hljs-variable language_">arg0</span>');
  expect(result).toContain('<span class="hljs-built_in">printf</span>');
});

test("bpftrace highlights built-in variables", () => {
  const result = highlight('printf("%d\\n", pid, tid, nsecs);');

  expect(result).toContain('<span class="hljs-built_in">pid</span>');
  expect(result).toContain('<span class="hljs-built_in">nsecs</span>');
});

test("bpftrace highlights comments and includes", () => {
  const result = highlight("// a comment\n#include <linux/sched.h>");

  expect(result).toContain('<span class="hljs-comment">// a comment</span>');
  expect(result).toContain(
    '<span class="hljs-meta">#include &lt;linux/sched.h&gt;</span>',
  );
});
