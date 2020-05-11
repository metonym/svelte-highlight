# svelte-highlight

[![NPM][npm]][npm-url]
![NPM downloads to date](https://img.shields.io/npm/dt/svelte-highlight)
[![Build][build]][build-badge]

> Syntax Highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

This component wraps [highlight.js](https://github.com/highlightjs/highlight.js) to provide syntax highlighting in [Svelte 3](https://github.com/sveltejs/svelte).

## [Live Demo](https://metonym.github.io/svelte-highlight)

## Install

```bash
yarn add -D svelte-highlight
# OR
npm i -D svelte-highlight
```

## Usage

There are two ways to apply `highlight.js` styles: injected styles through `svelte:head` or with a CSS StyleSheet loader.

### Injected Styles

This component exports `highlight.js` themes in JavaScript. Import the theme from `svelte-highlight/styles` and inject it using the [svelte:head](https://svelte.dev/docs#svelte_head) API.

```html
<script>
  import { Highlight } from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import { github } from 'svelte-highlight/styles';

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Highlight language={typescript} {code} />
```

### CSS Stylesheet

Importing a CSS StyleSheet in Svelte requires a CSS loader. Refer to [examples/webpack](examples/webpack) for a sample set-up.

```html
<script>
  import { Highlight } from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/github.css';

  $: code = `const add = (a: number, b: number) => a + b;`;
</script>

<Highlight language={typescript} {code} />
```

## Svelte Syntax Highlighting

This library uses [highlightjs-svelte](https://github.com/AlexxNB/highlightjs-svelte) to highlight Svelte code.

```html
<script>
  import { HighlightSvelte } from 'svelte-highlight';
  import { github } from 'svelte-highlight/styles';

  $: code = `<script>
  let count = 0;
</script>

<button on:click="{() => { count += 1; }}">Click me</button>`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightSvelte {code} />
```

## Custom Language

For custom language highlighting, pass a `name` and `register` function to the language prop.

Refer to the highlight.js [language definition guide](https://highlightjs.readthedocs.io/en/latest/language-guide.html) for more info.

```html
<script>
  import { Highlight } from 'svelte-highlight';
  import hljs from 'highlight.js';

  const language = {
    name: 'custom-language',
    register: hljs => {
      return { /** custom language rules */ }
    }
  }

  const code = 'custom language';
</script>

<Highlight {language} {code} />
```

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
- [examples/webpack](examples/webpack)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

[npm]: https://img.shields.io/npm/v/svelte-highlight.svg?color=blue
[npm-url]: https://npmjs.com/package/svelte-highlight
[build]: https://travis-ci.com/metonym/svelte-highlight.svg?branch=master
[build-badge]: https://travis-ci.com/metonym/svelte-highlight
