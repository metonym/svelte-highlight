import svelte from "rollup-plugin-svelte";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import livereload from "rollup-plugin-livereload";
import serve from "rollup-plugin-serve";
import copy from "rollup-plugin-copy";

const PROD = !process.env.ROLLUP_WATCH;

export default {
  input: "src/index.js",
  output: {
    sourcemap: !PROD,
    format: "iife",
    name: "app",
    file: "build/bundle.js",
  },
  plugins: [
    /**
     * Copies public folder into `build/`
     */
    copy({ targets: [{ src: "public/*", dest: "build" }] }),

    svelte({
      dev: !PROD,
      css: (css) => {
        /**
         * Emits CSS to file
         * Disables CSS sourcemaps in production
         */
        css.write("build/bundle.css", !PROD);
      },
    }),

    resolve(),
    commonjs(),

    /**
     * Livereloads app in development mode
     */
    !PROD &&
      serve({
        contentBase: ["build"],
        port: 3000,
      }),
    !PROD && livereload({ watch: "build" }),

    /**
     * Minifies JavaScript bundle in production
     */
    PROD && terser(),

    /**
     * See `postbuild.js` for PostHTML plugins executed after building for production
     */
  ],
};
