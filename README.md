# svelte-highlight

[![NPM][npm]][npm-url]
[![Build][build]][build-badge]
[![Coverage][codecov-shield]][codecov]

> Syntax Highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

This component wraps [highlight.js](https://github.com/highlightjs/highlight.js) to provide syntax highlighting in [Svelte 3](https://github.com/sveltejs/svelte).

## [Live Demo](https://metonym.github.io/svelte-highlight) · [Svelte REPL](https://svelte.dev/repl/0dd3cee4973b45cebd9970c17a04c89a?version=3.16.7)

## Install

```bash
yarn add svelte-highlight
# OR
npm i svelte-highlight
```

## Usage

There are two ways to use highlight.js styles: through a CSS stylesheet loader or the `svelte:head` API.

### CSS Stylesheet

Importing a CSS stylesheet in Svelte requires a CSS loader. Refer to the [rollup](examples/rollup) and [webpack](examples/webpack) examples for sample set-ups.

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

### Injected JavaScript Styles

This component exports highlight.js themes in JavaScript. Simply import the theme as JavaScript and inject it using the [svelte:head](https://svelte.dev/docs#svelte_head) API.

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

### The `code` Prop

Code passed to the slot (like in the above examples) will not dynamically update. Use the `code` prop for code that changes.

```html
<script>
  import Highlight from 'svelte-highlight';
  import { typescript } from 'svelte-highlight/languages';
  import 'svelte-highlight/styles/github.css';

  let count = 0;

  function increment() {
    count += 1;
  }

  $: code = `let count = ${count};`;
</script>

<button on:click={increment}>Increment</button>

<Highlight language={typescript} {code} />
```

### Custom Language

For custom language highlighting, pass a `name` and `register` function to the language prop.

Refer to the highlight.js [language definition guide](https://highlightjs.readthedocs.io/en/latest/language-guide.html) for more info.

```html
<script>
  import Highlight from 'svelte-highlight';
  import hljs from 'highlight.js';

  const language = {
    name: 'custom-lang',
    register: hljs => {
      return { /** custom language rules */ }
    }
  }

  const code = 'custom language';
</script>

<Highlight {language} {code} />
```

## [Supported Languages](docs/SUPPORTED_LANGUAGES.md)

## [Supported Styles](docs/SUPPORTED_STYLES.md)

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
