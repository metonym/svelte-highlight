import resolve from "rollup-plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import { main, module, name } from "./package.json";

export default [
  ["es", "umd"].map((format) => {
    const UMD = format === "umd";

    return {
      input: "src",
      output: {
        format,
        file: UMD ? main : module,
        exports: UMD ? "named" : undefined,
        name: UMD ? name : undefined,
      },
      plugins: [svelte(), resolve(), commonjs(), UMD && terser()],
    };
  }),
  ["es", "umd"].map((format) => {
    const UMD = format === "umd";

    return {
      input: "dist/languages",
      output: {
        format,
        file: UMD ? "languages/index.js" : "languages/index.mjs",
        exports: UMD ? "named" : undefined,
        name: UMD ? "languages" : undefined,
      },
      plugins: [resolve(), commonjs(), UMD && terser()],
    };
  }),
  ["es", "umd"].map((format) => {
    const UMD = format === "umd";

    return {
      input: "dist/styles",
      output: {
        format,
        file: UMD ? "styles/index.js" : "styles/index.mjs",
        exports: UMD ? "named" : undefined,
        name: UMD ? "styles" : undefined,
      },
      plugins: [resolve(), commonjs(), UMD && terser()],
    };
  }),
].flat();
