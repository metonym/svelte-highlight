import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import preprocess from "svelte-preprocess";

const PROD = !process.env.ROLLUP_WATCH;

export default {
  input: "src/index.ts",
  output: {
    sourcemap: true,
    format: "es",
    dir: "public/build",
  },
  plugins: [
    svelte({
      emitCss: false,
      preprocess: preprocess(),
    }),
    commonjs(),
    resolve({ browser: true }),
    PROD && terser(),
  ],
};
