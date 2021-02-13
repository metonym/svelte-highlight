# svelte-highlight

![npm](https://img.shields.io/npm/v/svelte-highlight?color=ff3e00&style=for-the-badge)
![npm](https://img.shields.io/npm/dt/svelte-highlight?color=ff3e00&style=for-the-badge)
![Travis (.com)](https://img.shields.io/travis/com/metonym/svelte-highlight?style=for-the-badge)

> Syntax Highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

This component wraps [highlight.js](https://github.com/highlightjs/highlight.js) to provide syntax highlighting in [Svelte 3](https://github.com/sveltejs/svelte).

## [Live Demo](https://metonym.github.io/svelte-highlight)

## Table of Contents

- [Install](#install)
- [Usage](#usage)
  - [Injected Styles](#injected-styles)
  - [CSS StyleSheet](#css-stylesheet)
- [Svelte Syntax Highlighting](#svelte-syntax-highlighting)
- [Custom Language](#custom-language)
- [API](#api)
  - [Forwarded Events](#forwarded-events)
  - [Dispatched Events](#dispatched-events)
- [Supported Languages](#supported-languages)
- [Supported Styles](#supported-styles)
- [Examples](#examples)
- [Changelog](#changelog)
- [License](#license)

## Install

`svelte-highlight` requires svelte [version 3.20.x](https://github.com/sveltejs/svelte/blob/master/CHANGELOG.md#3200) or greater due to use of the `$$restProps` API.

```bash
yarn add -D svelte-highlight
# OR
npm i -D svelte-highlight
```

## Usage

There are two ways to apply `highlight.js` styles:

1. inject JavaScript styles through `svelte:head`
2. import CSS StyleSheets using a css file loader.

### Injected Styles

This component exports `highlight.js` themes in JavaScript. Import the theme from `svelte-highlight/styles` and inject it using the [svelte:head](https://svelte.dev/docs#svelte_head) API.

<!-- prettier-ignore-start -->
```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import { github } from "svelte-highlight/styles";

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Highlight language="{typescript}" {code} />
```
<!-- prettier-ignore-end -->

### CSS StyleSheet

Importing a CSS StyleSheet in Svelte requires a CSS file loader. Refer to [examples/webpack](examples/webpack) for a sample set-up.

<!-- prettier-ignore-start -->
```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import { typescript } from "svelte-highlight/languages";
  import "svelte-highlight/styles/github.css";

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<Highlight language="{typescript}" {code} />
```
<!-- prettier-ignore-end -->

## Svelte Syntax Highlighting

This library uses [highlightjs-svelte](https://github.com/AlexxNB/highlightjs-svelte) to highlight Svelte code.

<!-- prettier-ignore-start -->
```svelte
<script>
  import { HighlightSvelte } from "svelte-highlight";
  import { github } from "svelte-highlight/styles";

  $: code = `
<script>
  let count = 0;
<\/script>

<button on:click="{() => { count += 1; }}">Click me<\/button>
`.trim();
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightSvelte {code} />
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

| Property name    | Value                                                 |
| ---------------- | ----------------------------------------------------- |
| code             | `string`                                              |
| language         | `object` { name: `string`; register: hljs => object } |
| `...$$restProps` | (forwarded to the `pre` element)                      |

### Forwarded Events

The following events are forwarded to the `pre` element:

- on:click
- on:mouseover
- on:mouseenter
- on:mouseleave
- on:focus
- on:blur

### Dispatched Events

- on:highlight

## [Supported Languages](SUPPORTED_LANGUAGES.md)

## [Supported Styles](SUPPORTED_STYLES.md)

## Examples

- [examples/rollup](examples/rollup)
- [examples/snowpack](examples/snowpack)
- [examples/svite](examples/svite)
- [examples/webpack](examples/webpack)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)
