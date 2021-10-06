# svelte-highlight

[![NPM][npm]][npm-url]
![npm](https://img.shields.io/npm/dt/svelte-highlight?color=ff3e00&style=for-the-badge)

> Syntax highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

Try it in the [Svelte REPL](https://svelte.dev/repl/fe613c5a58f041b9babc801226a17220).

## [Demo](https://svhe.onrender.com)

## Installation

**Yarn**

```bash
yarn add -D svelte-highlight
```

**NPM**

```bash
npm i -D svelte-highlight
```

## SvelteKit set-up

To use this library with SvelteKit, instruct vite to optimize `highlight.js/lib/core` in your `svelte.config.js`:

```diff
# svelte.config.js
export default {
  kit: {
    target: "#svelte",
+   vite: {
+     optimizeDeps: {
+       include: ["highlight.js/lib/core"],
+     },
+   },
  },
};
```

Refer to [examples/sveltekit](examples/sveltekit) for an example set-up.

## Usage

There are two ways to apply `highlight.js` styles:

1. JavaScript styles injected into the DOM through `svelte:head`
2. CSS StyleSheets imported using a file loader

### Injected Styles

This component exports `highlight.js` themes in JavaScript. Import the theme from `svelte-highlight/styles` and inject it using the [svelte:head](https://svelte.dev/docs#svelte_head) API.

<!-- prettier-ignore-start -->
```svelte
<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/src/languages/typescript";
  import github from "svelte-highlight/src/styles/github";

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Highlight language="{typescript}" {code} />
```
<!-- prettier-ignore-end -->

### CSS StyleSheet

Depending on your set-up, importing a CSS StyleSheet in Svelte may require a CSS file loader. Refer to [examples/webpack](examples/webpack) for a sample set-up.

<!-- prettier-ignore-start -->
```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/src/languages/typescript";
  import "svelte-highlight/src/styles/github.css";

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<Highlight language="{typescript}" {code} />
```
<!-- prettier-ignore-end -->

## Svelte Syntax Highlighting

Use the `HighlightSvelte` component for Svelte syntax highlighting.

<!-- prettier-ignore-start -->
```svelte
<script>
  import { HighlightSvelte } from "svelte-highlight";
  import github from "svelte-highlight/src/styles/github";

  $: code = `<script>
  let count = 0;
<\/script>

<button on:click="{() => (count += 1)}">Increment {count}<\/button>`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightSvelte {code} />
```
<!-- prettier-ignore-end -->

## Auto-highlighting

The `HighlightAuto` component invokes the `highlightAuto` API from `highlight.js`.

<!-- prettier-ignore-start -->
```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";
  import github from "svelte-highlight/src/styles/github";

  $: code = `<style>
  .body { margin: 0; padding: 0; }
<\/style>`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightAuto {code} />
```
<!-- prettier-ignore-end -->

## Language Targeting

All `Highlight` components apply a `data-language` attribute on the codeblock containing the language name.

This is also compatible with custom languages.

See the [Languages page](SUPPORTED_LANGUAGES.md) for a list of supported languages.

<!-- prettier-ignore-start -->
```css
pre[data-language="css"] {
    /* custom style rules */
}
```
<!-- prettier-ignore-end -->

## Language Tags

All `Highlight` components allow for a tag to be added at the top-right of the codeblock displaying the language name.

The language tag can be given a custom `background` , `color` , and `border-radius` through the custom properties shown.

This is also compatible with custom languages.

It is recommended that you set values for `--hljs-background` and `--hljs-foreground` to ensure the langtags remain readable on any theme.

See the [Languages page](SUPPORTED_LANGUAGES.md) for a list of supported languages.

Defaults:

- `--hljs-background: inherit`
- `--hljs-foreground: inherit`
- `--hljs-border-radius: 0`
<!-- prettier-ignore-start -->

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";

  $: code = `.body { padding: 0; margin: 0; }`;
</script>

<HighlightAuto code="{code}" langtag="{true}" />
```

```css
pre[data-language="css"] {
  --hljs-background: linear-gradient(135deg, #2996cf, 80%, white);
  --hljs-foreground: #fff;
  --hljs-radius: 8px;
}
```

<!-- prettier-ignore-end -->

## Custom Language

For custom language highlighting, pass a `name` and `register` function to the language prop.

Refer to the highlight.js [language definition guide](https://highlightjs.readthedocs.io/en/latest/language-guide.html) for guidance.

<!-- prettier-ignore-start -->
```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import hljs from "highlight.js";

  const language = {
    name: "custom-language",
    register: (hljs) => {
      return {
        /** custom language rules */
      };
    },
  };

  const code = "custom language";
</script>

<Highlight {language} {code} />
```
<!-- prettier-ignore-end -->

## API

### Props

| Prop name                       | Value                                                 |
| ------------------------------- | ----------------------------------------------------- |
| code                            | `string`                                              |
| language (only for `Highlight`) | `object` { name: `string`; register: hljs => object } |
| `...$$restProps`                | (forwarded to the `pre` element)                      |

### Dispatched Events

- on:highlight

<!-- prettier-ignore-start -->
```svelte
<Highlight
  language="{typescript}"
  code="{code}"
  on:highlight="{(e) => {
    console.log(e.detail.highlighted); // "<span>...</span>"
  }}"
/>
```
<!-- prettier-ignore-end -->

## TypeScript

Svelte version 3.31 or greater is required to use this component with TypeScript.

TypeScript definitions are located in the [types folder](./types).

## [Supported Languages](SUPPORTED_LANGUAGES.md)

## [Supported Styles](SUPPORTED_STYLES.md)

## Examples

- [examples/rollup](examples/rollup)
- [examples/rollup-typescript](examples/rollup-typescript)
- [examples/snowpack](examples/snowpack)
- [examples/sveltekit](examples/sveltekit)
- [examples/svite](examples/svite)
- [examples/webpack](examples/webpack)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

[npm]: https://img.shields.io/npm/v/svelte-highlight.svg?style=for-the-badge&color=%23ff3e00
[npm-url]: https://npmjs.com/package/svelte-highlight
