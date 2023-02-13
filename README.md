# svelte-highlight

[![NPM][npm]][npm-url]
![npm](https://img.shields.io/npm/dt/svelte-highlight?color=ff3e00&style=for-the-badge)

> Syntax highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

Try it in [StackBlitz](https://stackblitz.com/edit/svelte-highlight?file=src%2Froutes%2Findex.svelte).

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

## Basic Usage

The `Highlight` component requires two props:

- `code`: text to highlight
- `language`: language grammar used to highlight the text

Import languages from `svelte-highlight/languages`.

See [SUPPORTED_LANGUAGES.md](SUPPORTED_LANGUAGES.md) for a list of supported languages.

```svelte
<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<Highlight language={typescript} {code} />
```

## Styling

Import styles from `svelte-highlight/styles`. See [SUPPORTED_STYLES.md](SUPPORTED_STYLES.md) for a list of supported styles.

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

Depending on your set-up, importing a CSS StyleSheet in Svelte may require a CSS file loader. SvelteKit/Vite automatically supports this. For Webpack, refer to [examples/webpack](examples/webpack).

```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import "svelte-highlight/styles/github.css";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<Highlight language={typescript} {code} />
```

#### Linking from a CDN

CSS StyleSheets can also be externally linked from a Content Delivery Network (CDN) like [unpkg.com](https://unpkg.com/).

> **Warning**
> Using a CDN is best suited for prototyping and not recommended for production use.

**HTML**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link
      rel="stylesheet"
      href="https://unpkg.com/svelte-highlight/styles/github.css"
    />
  </head>
</html>
```

**svelte:head**

```svelte
<svelte:head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/svelte-highlight/styles/github.css"
  />
</svelte:head>
```

## Svelte Syntax Highlighting

Use the `HighlightSvelte` component for Svelte syntax highlighting.

```svelte
<script>
  import { HighlightSvelte } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  const code = `<button on:click={() => { console.log(0); }}>Increment {count}</button>`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightSvelte {code} />
```

## Auto-highlighting

The `HighlightAuto` component uses [highlightAuto](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto) API.

> **Warning**
> Auto-highlighting will result in a larger bundle size. Specify a language if possible.

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  const code = `body {\n  padding: 0;\n  color: red;\n}`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightAuto {code} />
```

## Line Numbers

Use the `LineNumbers` component to render the highlighted code with line numbers.

```svelte
<script>
  import Highlight, { LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers {highlighted} />
</Highlight>
```

### Hidden Border

Set `hideBorder` to `true` to hide the border of the line numbers column.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers {highlighted} hideBorder />
</Highlight>
```

### Wrapped Lines

By default, overflowing horizontal content is contained by a scrollbar.

Set `wrapLines` to `true` to hide the border of the line numbers column.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers {highlighted} wrapLines />
</Highlight>
```

### Custom Starting Line Number

The line number starts at `1`. Customize this via the `startingLineNumber` prop.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers {highlighted} startingLineNumber={42} />
</Highlight>
```

### Highlighted Lines

Specify the lines to highlight using the `highlightedLines` prop. Indices start at zero.

Use `--highlighted-background` to customize the background color of highlighted lines.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    highlightedLines={[0, 2, 3, 14]}
    --highlighted-background="#000"
  />
</Highlight>
```

### Custom Styles

Use `--style-props` to customize styles.

| Style prop               | Description                                | Default value             |
| :----------------------- | :----------------------------------------- | :------------------------ |
| --line-number-color      | Text color of the line numbers             | `currentColor`            |
| --border-color           | Border color of the column of line numbers | `currentColor`            |
| --padding-left           | Left padding for `td` elements             | `1em`                     |
| --padding-right          | Right padding for `td` elements            | `1em`                     |
| --highlighted-background | Background color of highlighted lines      | `rgba(254, 241, 96, 0.2)` |

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    --line-number-color="pink"
    --border-color="rgba(255, 255, 255, 0.2)"
    --padding-left={0}
    --padding-right="3em"
    --highlighted-background="#000"
  />
</Highlight>
```

## Language Targeting

All `Highlight` components apply a `data-language` attribute on the codeblock containing the language name.

See [SUPPORTED_LANGUAGES.md](SUPPORTED_LANGUAGES.md) for a list of supported languages.

```css
[data-language="css"] {
  /* custom style rules */
}
```

## Language Tags

Set `langtag` to `true` to display the language name in the top right corner of the code block.

Customize the language tag `background`, `color`, and `border-radius` using style props.

See the [Languages page](SUPPORTED_LANGUAGES.md) for a list of supported languages.

| Style prop              | Description                     | Default value |
| :---------------------- | :------------------------------ | :------------ |
| --langtag-background    | Background color of the langtag | `inherit`     |
| --langtag-color         | Text color of the langtag       | `inherit`     |
| --langtag-border-radius | Border radius of the langtag    | `0`           |

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";

  $: code = `.body { padding: 0; margin: 0; }`;
</script>

<HighlightAuto {code} langtag />
```

```css
[data-language="css"] {
  --langtag-background: linear-gradient(135deg, #2996cf, 80%, white);
  --langtag-color: #fff;
  --langtag-border-radius: 8px;
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

## Code-splitting

You can use the `await import` syntax for code-splitting.

In the example below, the `HighlightAuto` component and injected styles are dynamically loaded.

```svelte
<script>
  import { onMount } from "svelte";

  let component;
  let styles;

  onMount(async () => {
    component = (await import("svelte-highlight")).HighlightAuto;
    styles = (await import("svelte-highlight/styles/github")).default;
  });
</script>

<svelte:head>
  {#if styles}
    {@html styles}
  {/if}
</svelte:head>

<svelte:component
  this={component}
  langtag
  code={`body {\n  padding: 0;\n  color: red;\n}`}
/>
```

## Component API

### `Highlight`

#### Props

| Name     | Type                                           | Default value  |
| :------- | :--------------------------------------------- | :------------- |
| code     | `any`                                          | N/A (required) |
| language | { name: `string`; register: hljs => `object` } | N/A (required) |
| langtag  | `boolean`                                      | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

#### Dispatched Events

- **on:highlight**: fired after `code` is highlighted

```svelte
<Highlight
  language={typescript}
  {code}
  on:highlight={(e) => {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    console.log(e.detail.highlighted);
  }}
/>
```

### `LineNumbers`

#### Props

| Name               | Type       | Default value  |
| :----------------- | :--------- | :------------- |
| highlighted        | `string`   | N/A (required) |
| hideBorder         | `boolean`  | `false`        |
| wrapLines          | `boolean`  | `false`        |
| startingLineNumber | `number`   | `1`            |
| highlightedLines   | `number[]` | `[]`           |

`$$restProps` are forwarded to the top-level `div` element.

### `HighlightSvelte`

#### Props

| Name    | Type      | Default value  |
| :------ | :-------- | :------------- |
| code    | `any`     | N/A (required) |
| langtag | `boolean` | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

#### Dispatched Events

- **on:highlight**: fired after `code` is highlighted

```svelte
<HighlightSvelte
  {code}
  on:highlight={(e) => {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    console.log(e.detail.highlighted);
  }}
/>
```

### `HighlightAuto`

#### Props

| Name    | Type      | Default value  |
| :------ | :-------- | :------------- |
| code    | `any`     | N/A (required) |
| langtag | `boolean` | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

#### Dispatched Events

- **on:highlight**: fired after `code` is highlighted

```svelte
<HighlightAuto
  {code}
  on:highlight={(e) => {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    console.log(e.detail.highlighted);

    /**
     * The inferred language name
     * @example "css"
     */
    console.log(e.detail.language);
  }}
/>
```

## [Supported Languages](SUPPORTED_LANGUAGES.md)

## [Supported Styles](SUPPORTED_STYLES.md)

## Examples

- [examples/rollup](examples/rollup)
- [examples/sveltekit](examples/sveltekit)
- [examples/vite](examples/vite)
- [examples/webpack](examples/webpack)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

[npm]: https://img.shields.io/npm/v/svelte-highlight.svg?style=for-the-badge&color=%23ff3e00
[npm-url]: https://npmjs.com/package/svelte-highlight
