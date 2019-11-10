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

<Highlight language={typescript}>const a: number = 4;</Highlight>
```

Note: Importing a css file in Svelte requires the appropriate module loader. Refer to the [rollup](examples/rollup) example.

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
