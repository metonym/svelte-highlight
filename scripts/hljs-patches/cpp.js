import base from "highlight.js/lib/languages/cpp";

// CUDA function and variable qualifiers. All start with `__`, which C++
// reserves for the implementation, so plain C++ code never uses them as
// names. `__restrict__` is also a GCC and Clang extension in plain C++.
const CUDA_KEYWORDS = [
  "__global__",
  "__device__",
  "__host__",
  "__shared__",
  "__constant__",
  "__managed__",
  "__grid_constant__",
  "__restrict__",
  "__noinline__",
  "__forceinline__",
  "__launch_bounds__",
];

/**
 * Patches for highlight.js's C++ grammar.
 *
 * - `cuda`, `cu`, and `cuh` aliases, so CUDA fences use the C++ grammar.
 * - CUDA qualifiers (`__global__`, `__device__`, `__shared__`, ...) as
 *   keywords.
 *
 * The `<<<grid, block>>>` launch syntax stays unstyled, like every other
 * C++ operator. `>>>` also closes nested templates, so a special case
 * would misfire there.
 *
 * @type {import("highlight.js").LanguageFn}
 */
function register(hljs) {
  const lang = base(hljs);

  lang.aliases = [...(lang.aliases ?? []), "cuda", "cu", "cuh"];

  const keywords = /** @type {{ keyword: string[] }} */ (lang.keywords);
  // Every C++ mode shares this array, so one push covers them all.
  keywords.keyword.push(...CUDA_KEYWORDS);

  return lang;
}

export const cpp = { name: "cpp", register };
export default cpp;
