import hljs from "highlight.js/lib/core";
import pythonRegister from "highlight.js/lib/languages/python";
import { createRegistry } from "../src/engine.js";

import cython from "../src/languages/cython";
import cythonSource from "../scripts/custom-languages/cython.js";

hljs.registerLanguage("python", pythonRegister);

const registry = createRegistry();

registry.register(cython.register);

const highlight = (code: string) =>
  registry.highlight(code, { language: "cython" }).value;

test("cython highlights cdef, cimport, and C types", () => {
  const result = highlight(
    "from libc.math cimport sqrt\ncdef unsigned long n = 0\ncdef Py_ssize_t i",
  );

  expect(result).toContain('<span class="hljs-keyword">cimport</span>');
  expect(result).toContain('<span class="hljs-keyword">cdef</span>');
  expect(result).toContain('<span class="hljs-type">unsigned</span>');
  expect(result).toContain('<span class="hljs-type">long</span>');
  expect(result).toContain('<span class="hljs-type">Py_ssize_t</span>');
});

test("cython styles the name and params of a cdef function", () => {
  const result = highlight(
    "cdef inline double[:, ::1] scale(double[:, ::1] a, double k) noexcept nogil:",
  );

  expect(result).toContain('<span class="hljs-keyword">inline</span>');
  expect(result).toContain('<span class="hljs-title function_">scale</span>');
  expect(result).toContain(
    '<span class="hljs-params"><span class="hljs-type">double</span>[:, ::<span class="hljs-number">1</span>] a',
  );
  expect(result).toContain('<span class="hljs-keyword">noexcept</span>');
  expect(result).toContain('<span class="hljs-keyword">nogil</span>');
});

test("cython keeps a call in a cdef initializer out of the title", () => {
  const result = highlight("cdef int n = len(a)");

  expect(result).not.toContain("title");
  expect(result).toContain('<span class="hljs-built_in">len</span>');
});

test("cython styles cpdef methods and except?", () => {
  const result = highlight("cpdef double area(self) except? -1:");

  expect(result).toContain('<span class="hljs-keyword">cpdef</span>');
  expect(result).toContain('<span class="hljs-title function_">area</span>');
  expect(result).toContain('<span class="hljs-keyword">except?</span>');
});

test("cython styles struct, fused, and class declarations", () => {
  const result = highlight(
    "cdef packed struct Pixel:\nctypedef fused real:\ncdef class Grid(Base):",
  );

  expect(result).toContain('<span class="hljs-keyword">packed</span>');
  expect(result).toContain('<span class="hljs-keyword">struct</span>');
  expect(result).toContain('<span class="hljs-title class_">Pixel</span>');
  expect(result).toContain('<span class="hljs-keyword">fused</span>');
  expect(result).toContain('<span class="hljs-title class_">real</span>');
  expect(result).toContain('<span class="hljs-title class_">Grid</span>');
  expect(result).toContain(
    '<span class="hljs-title class_ inherited__">Base</span>',
  );
});

test("cython keeps the struct module name plain", () => {
  const result = highlight("import struct\nstruct.pack('<i', 1)");

  expect(result).not.toContain(">struct<");
});

test("cython styles casts", () => {
  const result = highlight(
    "cdef double* buf = <double*>malloc(n)\np = <const char*>s\nq = <Node?>obj",
  );

  expect(result).toContain('&lt;<span class="hljs-type">double</span>*&gt;');
  expect(result).toContain(
    '&lt;<span class="hljs-keyword">const</span> <span class="hljs-type">char</span>*&gt;',
  );
  expect(result).toContain('&lt;<span class="hljs-type">Node</span>?&gt;');
});

test("cython styles include only before a file name", () => {
  expect(highlight('include "consts.pxi"')).toContain(
    '<span class="hljs-keyword">include</span>',
  );
  expect(highlight("path('api/', include(urls))")).not.toContain(
    "hljs-keyword",
  );
});

test("cython leaves the stock Python grammar unchanged", () => {
  const code = "def f(x: int) -> float:\n    return float(x) + len(struct)";
  const before = hljs.highlight(code, { language: "python" }).value;
  hljs.registerLanguage("cython", cythonSource.register);
  const after = hljs.highlight(code, { language: "python" }).value;

  expect(after).toBe(before);
  expect(after).toContain('<span class="hljs-built_in">int</span>');
});
