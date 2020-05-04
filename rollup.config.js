import resolve from "rollup-plugin-node-resolve";
import svelte from "rollup-plugin-svelte";
import commonjs from "rollup-plugin-commonjs";
import pkg from "./package.json";

const lib = ["es", "umd"].map((format) => {
  const UMD = format === "umd";

  const output = {
    format,
    file: UMD ? pkg.main : pkg.module,
    exports: UMD ? "named" : undefined,
    name: UMD ? pkg.name : undefined,
  };

  return {
    input: "src",
    output,
    plugins: [svelte(), resolve(), commonjs()],
  };
});

const languages = ["es", "umd"].map((format) => {
  const UMD = format === "umd";

  const output = {
    format,
    file: UMD ? "languages/index.js" : "languages/index.mjs",
    exports: UMD ? "named" : undefined,
    name: UMD ? "svelte-highlight-languages" : undefined,
  };

  return {
    input: "src/languages",
    output,
    plugins: [resolve(), commonjs()],
  };
});

const styles = ["es", "umd"].map((format) => {
  const UMD = format === "umd";

  const output = {
    format,
    file: UMD ? "styles/index.js" : "styles/index.mjs",
    exports: UMD ? "named" : undefined,
    name: UMD ? "svelte-highlight-styles" : undefined,
  };

  return {
    input: "src/styles",
    output,
    plugins: [resolve(), commonjs()],
  };
});

export default [...lib, ...languages, ...styles];
