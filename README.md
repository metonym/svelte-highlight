# svelte-highlight

[![NPM][npm]][npm-url]
[![Build][build]][build-badge]
[![Coverage][codecov-shield]][codecov]

> Syntax Highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

This component wraps [highlight.js](https://github.com/highlightjs/highlight.js) to provide syntax highlighting in [Svelte 3](https://github.com/sveltejs/svelte).

## Install

```bash
yarn add svelte-highlight
```

## Usage

```html
<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/github.css';
</script>

<Highlight language={typescript}>
  {`function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);`}
</Highlight>
```

**Note**: Importing a CSS stylesheet in Svelte requires a CSS loader. Refer to the [rollup](examples/rollup) and [webpack](examples/webpack) examples for sample set-ups.

In case you do not want to use a CSS loader, this component exports highlight.js themes in JavaScript. Simply import the theme as JavaScript and inject it using the [svelte:head](https://svelte.dev/docs#svelte_head) API.

```html
<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import { github } from 'svelte-highlight/styles';
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Highlight language={typescript}>
  {`function add(a: number, b: number) {
  return a + b;
}

const sum = add(1, 2);`}
</Highlight>
```

## [Supported Styles](SUPPORTED_STYLES.md)

## [Examples](examples/)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

[npm]: https://img.shields.io/npm/v/svelte-highlight.svg?color=blue
[npm-url]: https://npmjs.com/package/svelte-highlight
[build]: https://travis-ci.com/metonym/svelte-highlight.svg?branch=master
[build-badge]: https://travis-ci.com/metonym/svelte-highlight
[codecov]: https://codecov.io/gh/metonym/svelte-highlight
[codecov-shield]: https://img.shields.io/codecov/c/github/metonym/svelte-highlight.svg
