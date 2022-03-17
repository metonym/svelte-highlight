# svelte-highlight

[![NPM][npm]][npm-url]
![npm](https://img.shields.io/npm/dt/svelte-highlight?color=ff3e00&style=for-the-badge)

> Syntax highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

Try it in the [Svelte REPL](https://svelte.dev/repl/e9c59b1d029a49e0b89d296ffc33555b).

## [Documentation](https://svhe.onrender.com)

## Installation

**Yarn**

```bash
yarn add -D svelte-highlight
```

**NPM**

```bash
npm i -D svelte-highlight
```

**pnpm**

```bash
pnpm i -D svelte-highlight highlight.js
```

## SvelteKit Set-up

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

```svelte
<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/src/languages/typescript";
  import github from "svelte-highlight/src/styles/github";

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
  import typescript from "svelte-highlight/src/languages/typescript";
  import "svelte-highlight/src/styles/github.css";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<Highlight language={typescript} {code} />
```

## Svelte Syntax Highlighting

Use the `HighlightSvelte` component for Svelte syntax highlighting.

```svelte
<script>
  import { HighlightSvelte } from "svelte-highlight";
  import github from "svelte-highlight/src/styles/github";

  $: code = "<button on:click={() => (count += 1)}>Increment {count}</button>";
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightSvelte {code} />
```

## Auto-highlighting

The `HighlightAuto` component invokes the `highlightAuto` API from `highlight.js`.

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";
  import github from "svelte-highlight/src/styles/github";

  $: code = `body {\n  padding: 0;\n  color: red;\n}`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightAuto {code} />
```

## Language Targeting

All `Highlight` components apply a `data-language` attribute on the codeblock containing the language name.

This is also compatible with custom languages.

See the [Languages page](SUPPORTED_LANGUAGES.md) for a list of supported languages.

```css
pre[data-language="css"] {
  /* custom style rules */
}
```

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

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";

  $: code = `.body { padding: 0; margin: 0; }`;
</script>

<HighlightAuto {code} langtag />
```

```css
pre[data-language="css"] {
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
      };
    },
  };
</script>

<Highlight {language} code="..." />
```

## API

### Props

| Name                            | Type                                           | Default value                            |
| :------------------------------ | :--------------------------------------------- | ---------------------------------------- |
| code                            | `string`                                       | `""`                                     |
| language (only for `Highlight`) | { name: `string`; register: hljs => `object` } | { name: undefined, register: undefined } |
| langtag                         | `boolean`                                      | `false`                                  |

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

TypeScript definitions are located in the [src folder](./src).

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
