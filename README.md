# svelte-highlight

[![NPM][npm]][npm-url]
![npm](https://img.shields.io/npm/dt/svelte-highlight?color=ff3e00&style=for-the-badge)

> Syntax highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

Try it in the [StackBlitz](https://stackblitz.com/edit/svelte-highlight?file=src%2Froutes%2Findex.svelte).

## [Documentation](https://svhe.onrender.com)

## Installation

```bash
# Yarn
yarn add -D svelte-highlight

# npm
npm i -D svelte-highlight

# pnpm
pnpm i -D svelte-highlight highlight.js
```

Note that [pnpm](https://github.com/pnpm/pnpm) users must also install `highlight.js`.

## SvelteKit Set-up

To use this library with [SvelteKit](https://github.com/sveltejs/kit) or [vite](https://github.com/sveltejs/vite-plugin-svelte), instruct vite to optimize `highlight.js` and `highlight.js/lib/core`:

```diff
+ optimizeDeps: {
+   include: ["highlight.js", "highlight.js/lib/core"],
+ },
```

As of [SvelteKit version 1.0.0-next.359](https://github.com/sveltejs/kit/releases/tag/%40sveltejs/kit%401.0.0-next.359), `vite` options are defined in `vite.config.js`.

**vite.config.js**

```js
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  optimizeDeps: {
    include: ["highlight.js", "highlight.js/lib/core"],
  },
};

export default config;
```

<details>
  <summary>SvelteKit <=1.0.0-next.358</summary>

```js
// svelte.config.js
export default {
  kit: {
    vite: {
      optimizeDeps: {
        include: ["highlight.js", "highlight.js/lib/core"],
      },
    },
  },
};
```

</details>

Refer to [examples/sveltekit](examples/sveltekit) or [examples/vite](examples/vite).

## Usage

There are two ways to apply `highlight.js` styles.

1. Injected styles through [svelte:head](https://svelte.dev/docs#template-syntax-svelte-head)
2. CSS StyleSheets

### Injected Styles

This component exports `highlight.js` themes in JavaScript. Import the theme from `svelte-highlight/styles` and inject it using the [svelte:head](https://svelte.dev/docs#svelte_head) API.

```svelte
<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Highlight language={typescript} {code} />
```

### CSS StyleSheet

Depending on your set-up, importing a CSS StyleSheet in Svelte may require a CSS file loader. Refer to [examples/webpack](examples/webpack) for a sample set-up.

```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import "svelte-highlight/styles/github.css";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<Highlight language={typescript} {code} />
```

## Svelte Syntax Highlighting

Use the `HighlightSvelte` component for Svelte syntax highlighting.

```svelte
<script>
  import { HighlightSvelte } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  $: code = `<button on:click={() => { console.log(0); }}>Increment {count}</button>`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightSvelte {code} />
```

## Auto-highlighting

The `HighlightAuto` component uses [highlightAuto](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto) API.

**Note:** auto-highlighting will result in a larger bundle size in order to infer a language.

Prefer to specify a language if possible.

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  $: code = `body {\n  padding: 0;\n  color: red;\n}`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightAuto {code} />
```

## Language Targeting

All `Highlight` components apply a `data-language` attribute on the codeblock containing the language name.

See the [Languages page](SUPPORTED_LANGUAGES.md) for a list of supported languages.

```css
[data-language="css"] {
  /* custom style rules */
}
```

## Language Tags

All `Highlight` components allow for a tag to be added at the top-right of the codeblock displaying the language name.

The language tag can be given a custom `background` , `color` , and `border-radius` through CSS custom properties.

It is recommended that you set values for `--hljs-background` and `--hljs-foreground` to ensure the langtags are readable with your theme.

See the [Languages page](SUPPORTED_LANGUAGES.md) for a list of supported languages.

Defaults:

- `--hljs-background: inherit`
- `--hljs-foreground: inherit`
- `--hljs-border-radius: 0`

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";

  $: code = `.body { padding: 0; margin: 0; }`;
</script>

<HighlightAuto {code} langtag />
```

```css
[data-language="css"] {
  --hljs-background: linear-gradient(135deg, #2996cf, 80%, white);
  --hljs-foreground: #fff;
  --hljs-radius: 8px;
}
```

## Custom Language

For custom language highlighting, pass a `name` and `register` function to the language prop.

Refer to the highlight.js [language definition guide](https://highlightjs.readthedocs.io/en/latest/language-guide.html) for guidance.

```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import hljs from "highlight.js";

  const language = {
    name: "custom-language",
    register: (hljs) => {
      return {
        /** custom language rules */
        contains: [],
      };
    },
  };
</script>

<Highlight {language} code="..." />
```

## API

### Props

| Name                                            | Type                                           | Default value                            |
| :---------------------------------------------- | :--------------------------------------------- | :--------------------------------------- |
| code                                            | `any`                                          | `undefined`                              |
| language (only required for `Highlight.svelte`) | { name: `string`; register: hljs => `object` } | { name: undefined, register: undefined } |
| langtag                                         | `boolean`                                      | `false`                                  |

- `$$restProps` are forwarded to the `pre` element

### Dispatched Events

- **on:highlight**: fired after code syntax is highlighted

```svelte
<Highlight
  language={typescript}
  {code}
  on:highlight={(e) => {
    console.log(e.detail.highlighted); // "<span>...</span>"
  }}
/>
```

## TypeScript

Svelte version 3.31 or greater is required to use this component with TypeScript.

TypeScript definitions are auto-generated by SvelteKit.

## [Supported Languages](SUPPORTED_LANGUAGES.md)

## [Supported Styles](SUPPORTED_STYLES.md)

## Examples

- [examples/rollup](examples/rollup)
- [examples/rollup-typescript](examples/rollup-typescript)
- [examples/snowpack](examples/snowpack)
- [examples/sveltekit](examples/sveltekit)
- [examples/vite](examples/vite)
- [examples/webpack](examples/webpack)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

[npm]: https://img.shields.io/npm/v/svelte-highlight.svg?style=for-the-badge&color=%23ff3e00
[npm-url]: https://npmjs.com/package/svelte-highlight
