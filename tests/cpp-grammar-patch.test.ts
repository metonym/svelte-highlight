import hljsFactory from "highlight.js/lib/core";
import stockCpp from "highlight.js/lib/languages/cpp";
import patchedCpp from "../scripts/hljs-patches/cpp.js";
import { createRegistry } from "../src/engine.js";
import { resolveLanguageName } from "../src/fence.js";
import cpp from "../src/languages/cpp.js";

// scripts/hljs-patches/cpp.js: CUDA aliases and qualifiers.
const hljs = hljsFactory.newInstance();
hljs.registerLanguage("cpp", patchedCpp.register);

const stock = hljsFactory.newInstance();
stock.registerLanguage("cpp", stockCpp);

const registry = createRegistry();
registry.register(cpp.register);

function expectMatchesHljs(code: string) {
  const expected = hljs.highlight(code, { language: "cpp" }).value;
  const actual = registry.highlight(code, { language: "cpp" }).value;
  expect(actual).toEqual(expected);
  return actual;
}

describe("cpp grammar patch", () => {
  it("resolves cuda, cu, and cuh to cpp", () => {
    expect(resolveLanguageName("cuda")).toBe("cpp");
    expect(resolveLanguageName("cu")).toBe("cpp");
    expect(resolveLanguageName("cuh")).toBe("cpp");
    expect(resolveLanguageName("CUDA")).toBe("cpp");
  });

  it("keeps the stock C++ aliases", () => {
    for (const alias of ["cc", "c++", "hpp", "cxx"]) {
      expect(resolveLanguageName(alias)).toBe("cpp");
    }
  });

  it("styles CUDA qualifiers on a kernel as keywords", () => {
    const html = expectMatchesHljs(
      "__global__ void add(int n, float *__restrict__ x, float *y) {\n" +
        "  __shared__ float tile[256];\n" +
        "  int i = blockIdx.x * blockDim.x + threadIdx.x;\n" +
        "  if (i < n) y[i] = x[i] + y[i];\n" +
        "}",
    );
    expect(html).toContain('<span class="hljs-keyword">__global__</span>');
    expect(html).toContain('<span class="hljs-keyword">__restrict__</span>');
    expect(html).toContain('<span class="hljs-keyword">__shared__</span>');
  });

  it("styles device, host, and constant qualifiers", () => {
    const html = expectMatchesHljs(
      "__constant__ float coeffs[16];\n" +
        "__host__ __device__ inline float square(float v) { return v * v; }",
    );
    expect(html).toContain('<span class="hljs-keyword">__constant__</span>');
    expect(html).toContain('<span class="hljs-keyword">__host__</span>');
    expect(html).toContain('<span class="hljs-keyword">__device__</span>');
  });

  it("leaves the <<<grid, block>>> launch as plain text", () => {
    const html = expectMatchesHljs("add<<<blocks, 256>>>(n, x, y);");
    expect(html).toContain("&lt;&lt;&lt;blocks, ");
    expect(html).toContain("&gt;&gt;&gt;(n, x, y);");
  });

  it("does not change plain C++", () => {
    const code = `#include <vector>

template <typename T>
class Stack {
 public:
  void push(const T& value) { items_.push_back(value); }
  std::vector<std::vector<T>> nested;

 private:
  std::vector<T> items_;
};

int main() {
  auto s = Stack<int>{};
  s.push(42);
  return 0;
}`;
    const html = expectMatchesHljs(code);
    expect(html).toEqual(stock.highlight(code, { language: "cpp" }).value);
  });
});
