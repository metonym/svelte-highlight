import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import pkg from './package.json';
import { build } from './scripts/build';

build();

const lib = ['es', 'umd'].map(format => {
  const UMD = format === 'umd';

  const output = {
    format,
    file: UMD ? pkg.main : pkg.module,
    exports: UMD ? 'named' : undefined
  };

  if (UMD) {
    output.name = 'svelte-highlight';
  }

  return {
    input: 'src',
    output,
    plugins: [svelte(), resolve(), commonjs(), UMD && terser()]
  };
});

const languages = ['es', 'umd'].map(format => {
  const UMD = format === 'umd';

  const output = {
    format,
    file: UMD ? 'languages/index.js' : 'languages/index.mjs',
    exports: UMD ? 'named' : undefined
  };

  if (UMD) {
    output.name = 'svelte-highlight-languages';
  }

  return {
    input: 'src/languages',
    output,
    plugins: [resolve(), commonjs(), UMD && terser()]
  };
});

export default [...lib, ...languages];
