import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

const IS_PROD = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/build/bundle.js",
  },
  plugins: [
    svelte({
      emitCss: false,
      preprocess: sveltePreprocess(),
      compilerOptions: {
        dev: !IS_PROD,
      },
    }),
    commonjs(),
    resolve({ browser: true, dedupe: ["svelte"] }),
    typescript({ sourceMap: !IS_PROD }),
    IS_PROD && terser(),
  ],
};
