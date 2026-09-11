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

test("bpftrace highlights statement probes without treating @file as a map", () => {
  const result = highlight(
    "uprobe:/bin/bash@bash.c:42\n{\n  @hits = count();\n}",
  );

  expect(result).toContain(
    '<span class="hljs-title function_">uprobe:/bin/bash@bash.c:42</span>',
  );
  expect(result).toContain('<span class="hljs-variable">@hits</span>');
});

test("bpftrace highlights import, let, macro, and 0.26 builtins", () => {
  const result = highlight(
    'import "helpers.bt"\nlet @start = nsecs;\nmacro add(a, b) { a + b }\nBEGIN { write_user($p, $src, 8); printf("%s", leader_comm); }',
  );

  expect(result).toContain('<span class="hljs-keyword">import</span>');
  expect(result).toContain('<span class="hljs-keyword">let</span>');
  expect(result).toContain('<span class="hljs-keyword">macro</span>');
  expect(result).toContain('<span class="hljs-built_in">write_user</span>');
  expect(result).toContain('<span class="hljs-built_in">leader_comm</span>');
});

test("bpftrace still highlights a map named like a source file", () => {
  const result = highlight("@bash = count();");

  expect(result).toContain('<span class="hljs-variable">@bash</span>');
  expect(result).not.toContain("hljs-title function_");
});
