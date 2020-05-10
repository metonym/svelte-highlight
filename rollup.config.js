import resolve from "rollup-plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import commonjs from "rollup-plugin-commonjs";
import { main, module, name } from "./package.json";

const lib = ["es", "umd"].map((format) => {
  const UMD = format === "umd";

  return {
    input: "src",
    output: {
      format,
      file: UMD ? main : module,
      exports: UMD ? "named" : undefined,
      name: UMD ? name : undefined,
    },
    plugins: [svelte(), resolve(), commonjs()],
  };
});

const languages = ["es", "umd"].map((format) => {
  const UMD = format === "umd";

  return {
    input: "dist/languages",
    output: {
      format,
      file: UMD ? "languages/index.js" : "languages/index.mjs",
      exports: UMD ? "named" : undefined,
      name: UMD ? "svelte-highlight-languages" : undefined,
    },
    plugins: [resolve(), commonjs()],
  };
});

const styles = ["es", "umd"].map((format) => {
  const UMD = format === "umd";

  return {
    input: "dist/styles",
    output: {
      format,
      file: UMD ? "styles/index.js" : "styles/index.mjs",
      exports: UMD ? "named" : undefined,
      name: UMD ? "svelte-highlight-styles" : undefined,
    },
    plugins: [resolve(), commonjs()],
  };
});

export default [...lib, ...languages, ...styles];
