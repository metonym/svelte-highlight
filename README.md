# svelte-highlight

[![NPM][npm]][npm-url]
![npm](https://img.shields.io/npm/dt/svelte-highlight?color=ff3e00&style=for-the-badge)

> Syntax highlighting for Svelte using [highlight.js](https://github.com/highlightjs/highlight.js).

Try it in the [Svelte REPL](https://svelte.dev/playground/535d6bf354da499389140dbfcb12004f) or [StackBlitz](https://stackblitz.com/edit/svelte-highlight?file=src%2Froutes%2Findex.svelte).

## [Documentation](https://svhe.onrender.com)

The Changelog is [available on GitHub](https://github.com/metonym/svelte-highlight/blob/master/CHANGELOG.md).

## Installation

```bash
# npm
npm i svelte-highlight

# pnpm
pnpm i svelte-highlight

# Bun
bun i svelte-highlight

# Yarn
yarn add svelte-highlight
```

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

## Theming

Every `highlight.js` theme is also compiled into a **`ThemePalette`**: a typed object of `--shl-*` CSS custom properties plus a shared structural stylesheet (`svelte-highlight/themes/base.css`) that maps `.hljs*` classes to those variables. This is the recommended way to theme new projects — themes are data, scoping is an inline `style` attribute (SSR-safe by construction), and any token is overridable with one CSS line or a Svelte style prop. See [SUPPORTED_THEMES.md](SUPPORTED_THEMES.md) for a list of compiled themes.

The legacy string-theme path (`svelte-highlight/styles`, below) keeps working unchanged and is unaffected by any of this.

**Global theme, CSS only (no JS in the bundle for theming):**

```svelte
<script>
  import "svelte-highlight/themes/base.css";
  import "svelte-highlight/themes/atom-one-dark.css";
</script>
```

**Scoped themes — multiple themes coexisting, zero runtime cost:**

```svelte
<script>
  import "svelte-highlight/themes/base.css";
  import "svelte-highlight/themes/github.css";
  import "svelte-highlight/themes/atom-one-dark.css";
</script>

<div data-shl-theme="github"><Highlight ... /></div>
<div data-shl-theme="atom-one-dark"><Highlight ... /></div>
```

**Component-driven scoping via palette objects** (replaces the scoped-`<style>` machinery described under [Scoping styles](#scoping-styles) below — no injected `<style>` tag, no runtime CSS parsing):

```svelte
<script>
  import { Highlight, HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/themes/atom-one-dark";
  import "svelte-highlight/themes/base.css";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<HighlightStyle theme={atomOneDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

This renders SSR-identical output — no `<svelte:head>`, no `<style>` tag, just inline vars on the wrapper:

```html
<div style="--shl-fg:#abb2bf;--shl-bg:#282c34;--shl-keyword:#c678dd;...">...</div>
```

**Dual light/dark via [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark):**

```svelte
<HighlightStyle light={atomOneLight} dark={atomOneDark} mode="auto">
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

This renders `--shl-keyword: light-dark(#a626a4, #c678dd)` (etc.) plus `color-scheme: light dark`. `mode="light"` / `mode="dark"` force `color-scheme: light` / `dark`. Any other `mode` string (the legacy "CSS selector" mode) omits `color-scheme` inline — set it on your own selector for app-controlled switching, e.g. `[data-theme="dark"] { color-scheme: dark }`.

**One-line customization — any token, no theme forking:**

```css
[data-shl-theme="atom-one-dark"] {
  --shl-comment: #7f8c98;
}
```

**Per-instance customization via Svelte style props** (works automatically since every themed value routes through a var):

```svelte
<Highlight --shl-keyword="hotpink" --shl-bg="#111" language={typescript} {code} />
```

**Themes are data** — derive a variant with a plain object spread:

```js
const custom = {
  ...atomOneDark,
  vars: { ...atomOneDark.vars, "--shl-keyword": "#ff79c6" },
};
```

**`HighlightEditable`'s `"css-highlights"` engine accepts palettes too:**

```svelte
<HighlightEditable engine="css-highlights" theme={atomOneDark} language={typescript} bind:code />
```

### The `--shl-*` variable contract

Variable names are derived mechanically from the selectors found in `highlight.js` themes. `color` is unsuffixed (it dominates — ~90% of declarations); every other supported property gets a suffix.

| Theme selector | Custom property |
| --- | --- |
| `.hljs` color | `--shl-fg` |
| `.hljs` background / background-color | `--shl-bg` |
| `.hljs-keyword` color | `--shl-keyword` |
| `.hljs-keyword` background(-color) | `--shl-keyword-bg` |
| `.hljs-keyword` font-style | `--shl-keyword-font-style` |
| `.hljs-keyword` font-weight | `--shl-keyword-font-weight` |
| `.hljs-keyword` text-decoration | `--shl-keyword-text-decoration` |
| Compound `.hljs-title.class_` | `--shl-title-class_` (scope names joined with `-`; hljs's trailing underscores are kept) |
| Descendant `.hljs-meta .hljs-keyword` | `--shl-meta-keyword` |

`themes/base.css` wraps a multi-scope (compound/descendant) variable in a fallback to its subject scope's variable — e.g. `.hljs-meta .hljs-string { color: var(--shl-meta-string, var(--shl-string)); }` — so a theme that never styles that specific combination still falls through to the plain scope color instead of rendering unstyled. Declarations that don't fit the var contract (gradients, borders, `::selection`, etc.) ship as an opaque `extras` string on the palette, applied only via the `.css` artifact.

`base.css` assumes the default `hljs-` class prefix; projects using a custom `classPrefix` should stay on the legacy string path below.

## Styling

Import styles from `svelte-highlight/styles`. See [SUPPORTED_STYLES.md](SUPPORTED_STYLES.md) for a list of supported styles. For new projects, prefer [Theming](#theming) above — this is the original, string-based theming path, kept fully supported for backward compatibility.

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

> [!WARNING]
> Using a CDN is best suited for prototyping and not recommended for production use.

**HTML**

```html
<head>
  <link
    rel="stylesheet"
    href="https://unpkg.com/svelte-highlight/styles/github.css"
  />
</head>
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

### Scoping styles

Themes target global `.hljs` selectors. Add more than one and the last injected wins. That works when every block on the page shares one theme.

Reach for scoped styles when blocks on the same page need different themes: a style gallery, a side-by-side comparison, or a light snippet next to a dark one.

Wrap each `Highlight` in `HighlightStyle` to keep a theme on that block:

```svelte
<script>
  import { Highlight, HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import a11yDark from "svelte-highlight/styles/a11y-dark";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<HighlightStyle theme={a11yDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>

<HighlightStyle theme={github}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

The component prefixes each selector with a scope class on the wrapper, so the theme only hits markup inside it.

`theme` is required. `scopeClass` defaults to a hash of the theme string. Pass your own, or bind it (`bind:scopeClass`) / read it from the slot (`let:scopeClass`).

For a page-wide theme, use `{@html theme}` as shown above.

### Dark mode

`HighlightStyle` can emit a light and a dark theme together and switch between them. Pass `light` and `dark` instead of `theme`:

```svelte
<script>
  import { Highlight, HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";
  import githubDark from "svelte-highlight/styles/github-dark";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<HighlightStyle light={github} dark={githubDark}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

The `mode` prop controls how the two themes are switched (default `"auto"`):

- `"auto"` — wrap each theme in a `@media (prefers-color-scheme: …)` query so the OS/browser preference decides.
- `"light"` / `"dark"` — emit only that single theme.
- any other string — treated as a CSS selector that gates the dark block while light stays the default. Use this to drive theming from a class or attribute on an ancestor, e.g. a manual theme toggle:

```svelte
<HighlightStyle light={github} dark={githubDark} mode={'[data-theme="dark"]'}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

Both themes are scoped to the wrapper, so different blocks can use different theme pairs on the same page. When `light` and `dark` are both set they take precedence over `theme`; passing only `theme` keeps the existing single-theme behavior unchanged.

## Styling with CSS variables

Every `Highlight` variant forwards `$$restProps` to its top-level element, so you can style the component using CSS variables without resorting to `:global` overrides or `!important`.

```svelte
<Highlight
  language={typescript}
  {code}
  --border-radius="8px"
  --max-width="40rem"
/>
```

### Container variables

These apply to the outer container of every component (the `pre` element for `Highlight`, `HighlightAuto`, `HighlightSvelte`, and `LangTag`; the `div` element for `LineNumbers`).

| Variable        | Description                                | Default value |
| :-------------- | :----------------------------------------- | :------------ |
| --border-radius | Border radius of the container             | `0`           |
| --width         | Width of the container                     | `auto`        |
| --max-width     | Maximum width of the container             | `none`        |
| --overflow-x    | Horizontal overflow behavior               | `auto`        |
| --overflow-y    | Vertical overflow behavior                 | `auto`        |

> [!NOTE]
> Because the container clips its content (`overflow` is not `visible` by default), setting `--border-radius` rounds the visible corners without any extra CSS.

### `LineNumbers` variables

| Variable                 | Description                                       | Default value             |
| :----------------------- | :------------------------------------------------ | :------------------------ |
| --line-number-color      | Text color of the line numbers                    | `currentColor`            |
| --border-color           | Border color of the column of line numbers        | `currentColor`            |
| --highlighted-background | Background color of highlighted lines             | `rgba(254, 241, 96, 0.2)` |
| --unhighlighted-opacity  | Opacity of un-highlighted lines (focus mode)      | `1`                       |
| --unhighlighted-filter   | CSS filter for un-highlighted lines (focus mode)  | `none`                    |
| --padding                | Fallback padding for `--padding-left` / `--padding-right` | `1em`              |
| --padding-left           | Left padding for `td` elements                    | `var(--padding, 1em)`     |
| --padding-right          | Right padding for `td` elements                   | `var(--padding, 1em)`     |

### `CopyButton` variables

| Variable             | Description                          | Default value |
| :------------------- | :----------------------------------- | :------------ |
| --copy-top           | Top offset of the button             | `0.5em`       |
| --copy-right         | Right offset of the button           | `0.5em`       |
| --copy-size          | Width and height of the button       | `2em`         |
| --copy-padding       | Inner padding of the button          | `0.5em`       |
| --copy-background    | Background color of the button       | `inherit`     |
| --copy-color         | Foreground color of the button       | `inherit`     |
| --copy-border-radius | Border radius of the button          | `4px`         |
| --copy-border        | Border of the button                 | `none`        |
| --copy-z-index       | Stacking order of the button         | `2`           |

### Language tag variables

These apply when `langtag` is set to `true`.

| Variable                | Description                     | Default value |
| :---------------------- | :------------------------------ | :------------ |
| --langtag-top           | Top position of the langtag     | `0`           |
| --langtag-right         | Right position of the langtag   | `0`           |
| --langtag-background    | Background color of the langtag | `inherit`     |
| --langtag-color         | Text color of the langtag       | `inherit`     |
| --langtag-border-radius | Border radius of the langtag    | `0`           |
| --langtag-padding       | Padding of the langtag          | `1em`         |

### `CodeWindow` variables

| Variable              | Description                              | Default value                       |
| :-------------------- | :--------------------------------------- | :---------------------------------- |
| --window-background   | Background color of the window body      | `#1e1e1e`                           |
| --window-border       | Border of the window                     | `1px solid rgba(255, 255, 255, 0.1)`|
| --window-radius       | Corner radius of the window              | `0`                                 |
| --titlebar-gap        | Gap between items in the title bar       | `0.5em`                             |
| --titlebar-padding    | Padding of the title bar                 | `0.65em 1em`                        |
| --titlebar-background | Background color of the title bar        | `#2d2d2d`                           |
| --titlebar-border     | Bottom border of the title bar           | `1px solid rgba(255, 255, 255, 0.1)`|
| --titlebar-color      | Text color of the title bar              | `rgba(255, 255, 255, 0.6)`          |
| --titlebar-font-family| Font family of the title bar             | `system-ui, -apple-system, sans-serif`|
| --titlebar-font-size  | Font size of the title bar               | `0.8125em`                          |
| --dot-gap             | Gap between the macOS traffic-light dots | `0.5em`                             |
| --dot-size            | Diameter of the macOS traffic-light dots | `0.75em`                            |
| --dot-close           | Color of the "close" traffic-light dot   | `#ff5f56`                           |
| --dot-minimize        | Color of the "minimize" traffic-light dot| `#ffbd2e`                           |
| --dot-maximize        | Color of the "maximize" traffic-light dot| `#27c93f`                           |
| --prompt-font-family  | Font family of the terminal prompt       | `ui-monospace, monospace`           |
| --prompt-font-weight  | Font weight of the terminal prompt       | `700`                               |
| --prompt-color        | Color of the terminal prompt             | `inherit`                           |

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

The `HighlightAuto` component uses the [highlightAuto API](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto) and attempts to guess what grammar to use based on the provided `code`.

> [!WARNING]
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

### Limiting Language Detection

You can restrict [language auto-detection](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto-value-languagesubset) to a subset using the `languageNames` prop. This can improve performance and accuracy.

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  const code = "const x = 42;";
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightAuto {code} languageNames={["javascript", "typescript"]} />
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

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers {highlighted} highlightedLines={[0, 2, 3, 14]} />
</Highlight>
```

Use `--unhighlighted-opacity` or `--unhighlighted-filter` to de-emphasize the remaining lines and focus attention on the highlighted ones. Both only take effect when `highlightedLines` is non-empty.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    highlightedLines={[0, 2, 3, 14]}
    --unhighlighted-opacity="0.4"
  />
</Highlight>
```

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

| Style prop               | Description                                              | Default value             |
| :----------------------- | :------------------------------------------------------ | :------------------------ |
| --line-number-color      | Text color of the line numbers                          | `currentColor`            |
| --border-color           | Border color of the column of line numbers              | `currentColor`            |
| --padding                | Fallback padding for `--padding-left` / `--padding-right` | `1em`                   |
| --padding-left           | Left padding for `td` elements                          | `var(--padding, 1em)`     |
| --padding-right          | Right padding for `td` elements                         | `var(--padding, 1em)`     |
| --highlighted-background | Background color of highlighted lines                   | `rgba(254, 241, 96, 0.2)` |
| --unhighlighted-opacity  | Opacity of un-highlighted lines (focus mode)            | `1`                       |
| --unhighlighted-filter   | CSS filter for un-highlighted lines (focus mode)        | `none`                    |

See [Styling with CSS variables](#styling-with-css-variables) for the full list, including container-level variables like `--border-radius`, `--width`, and `--overflow-x`.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    --line-number-color="pink"
    --border-color="rgba(255, 255, 255, 0.2)"
    --padding-left={0}
    --padding-right="3em"
    --highlighted-background="#000"
    --border-radius="8px"
    --max-width="40rem"
  />
</Highlight>
```

### Language Tag

When using a custom slot, forward `langtag` and `languageName` from `Highlight` to `LineNumbers`.

```svelte
<Highlight
  language={typescript}
  {code}
  langtag
  let:highlighted
  let:langtag
  let:languageName
>
  <LineNumbers {highlighted} {langtag} {languageName} />
</Highlight>
```

With `HighlightAuto`:

```svelte
<HighlightAuto {code} langtag let:highlighted let:langtag let:languageName>
  <LineNumbers {highlighted} {langtag} {languageName} />
</HighlightAuto>
```

## Copy Button

Compose the `CopyButton` component alongside `Highlight` to add a copy-to-clipboard button. Wrap both in a relatively-positioned container so the button can be positioned over the code block.

By default, it copies the `code` using the native [Clipboard API](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText) and shows a transient "copied" state. The button renders a copy icon that swaps to a checkmark on success; the `text` / `copiedText` props set the `aria-label` for each state. Clicks are ignored while in the "copied" state, so no duplicate copy fires.

```svelte
<script>
  import { Highlight, CopyButton } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  const code = "const add = (a: number, b: number) => a + b";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<div style="position: relative">
  <Highlight language={typescript} {code} />
  <CopyButton {code} />
</div>
```

### Custom Copy Behavior

Pass a `copy` function to override the default copy behavior. It receives the `code` to copy and may be async (return a promise); the "copied" state is shown only once it resolves. Clicks are ignored while a copy is in flight, so a slow async `copy` can't fire duplicates.

```svelte
<script>
  function copy(code) {
    navigator.clipboard.writeText(code);
    console.log("Copied:", code);
  }
</script>

<CopyButton {code} {copy} />
```

The component dispatches a `copy` event on success and an `error` event if the copy behavior throws.

```svelte
<CopyButton
  {code}
  on:copy={(e) => console.log(e.detail.code)}
  on:error={(e) => console.error(e.detail.error)}
/>
```

### Transforming copied text

Displayed code often carries decoration that shouldn't survive a copy -- shell prompts, REPL markers, diff signs. Pass a `transform` function to strip it before the `copy` function runs; `on:copy` reports the transformed string, not the original `code`.

`stripPrompts` and `stripDiffMarkers` cover the common cases and are exported for reuse (compose them for your own `transform` when a block needs both):

```svelte
<script>
  import { CopyButton, stripPrompts } from "svelte-highlight";

  const code = "$ npm install\nadded 1 package";
</script>

<CopyButton {code} transform={stripPrompts} />
```

### Custom Button Content

Provide custom button content using the default slot to replace the default icons. The slot exposes a `copied` boolean and a `copying` boolean (`true` while an async `copy` is in flight), so you can render a pending state for slow copy functions.

```svelte
<CopyButton {code} let:copied let:copying>
  {#if copying}Copying…{:else if copied}Copied!{:else}Copy{/if}
</CopyButton>
```

### Custom Styles

Use `--copy-*` style props to customize the button.

```svelte
<CopyButton
  {code}
  --copy-background="rgba(255, 255, 255, 0.1)"
  --copy-color="#fff"
  --copy-border-radius="8px"
/>
```

### With Line Numbers

Compose `CopyButton` with `LineNumbers` by wrapping both in a relatively-positioned container.

```svelte
<div style="position: relative">
  <Highlight language={typescript} {code} let:highlighted>
    <LineNumbers {highlighted} />
  </Highlight>
  <CopyButton {code} />
</div>
```

### With Language Tag

When using a language tag alongside `CopyButton`, offset `--langtag-top` and `--langtag-right` so the tag sits to the left of the button (the copy button defaults to `--copy-top: 0.5em`, `--copy-right: 0.5em`, and `--copy-size: 2em`).

```svelte
<div style="position: relative">
  <Highlight
    language={typescript}
    {code}
    langtag
    --langtag-top="0"
    --langtag-right="3em"
    --langtag-padding="0.25em 0.5em"
    --langtag-font-size="0.75em"
  />
  <CopyButton {code} />
</div>
```

## Editable

`HighlightEditable` is a `contenteditable` code block. It re-highlights on every edit and keeps the caret where you left it.

Use `bind:code` to keep your state in sync.

```svelte
<script>
  import { HighlightEditable } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";

  let code = "const add = (a: number, b: number) => a + b";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<HighlightEditable language={typescript} bind:code />
```

### Keyboard Behavior

- **Enter** inserts a newline.
- **Tab** / **Shift+Tab** indent or dedent the selected lines (or insert one indent at the caret). Set the indent size with the `tabSize` prop (default `2`).
- **Cmd/Ctrl+Z** undo and **Shift+Cmd/Ctrl+Z** (or **Ctrl+Y**) redo. Typing bursts collapse into a single undo step; cap the retained history with the `historyLimit` prop (default `200`).

### Dispatched Events

`HighlightEditable` dispatches `change` (on every edit), `blur`, and `history` (whenever the undo/redo stack changes).

```svelte
<HighlightEditable
  language={typescript}
  bind:code
  on:change={(e) => console.log(e.detail.code)}
  on:blur={(e) => console.log(e.detail.code)}
  on:history={(e) => console.log(e.detail.canUndo, e.detail.canRedo)}
/>
```

### Imperative API

Use `bind:this` to call methods on the instance.

```svelte
<script>
  let editor;
</script>

<HighlightEditable bind:this={editor} language={typescript} bind:code />

<button on:click={() => editor.undo()}>Undo</button>
<button on:click={() => editor.redo()}>Redo</button>
<button on:click={() => editor.indent()}>Indent</button>
<button on:click={() => editor.clear()}>Clear</button>
```

Available methods: `undo`, `redo`, `focus`, `selectAll`, `insert`, `indent`, `outdent`, `setCode`, `clear`, `getCode`, `canUndo`, `canRedo`, and `resolvedEngine`.

### Custom Styles

Customize the focus outline with the `--outline-color`, `--outline-width`, and `--outline-offset` style props.

```svelte
<HighlightEditable
  language={typescript}
  bind:code
  --outline-color="#42be65"
  --outline-width="2px"
/>
```

### Experimental: CSS Custom Highlight engine

`engine="css-highlights"` paints tokens with the [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API) (`CSS.highlights`, `::highlight()`) instead of wrapping them in `<span>`s. The editable `<code>` stays plain text (one `<span>` per line, reused from the default engine's line structure, but with no per-token spans inside), so a repaint never replaces the DOM the caret is sitting in.

Requires Chrome 105+, Safari 17.2+, or Firefox 140+. Where `CSS.highlights` is unavailable, `HighlightEditable` falls back to `engine="dom"` silently; check what actually ran with `editor.resolvedEngine()`.

Pass `theme` (the same theme string you'd give `HighlightStyle`) to generate `::highlight()` rules from it. Only `color`/`background-color` convert — `::highlight()` doesn't support `font-style`/`font-weight`/`text-decoration` across browsers, so bold/italic scopes render in plain color.

`theme` only covers token colors — you still need `HighlightStyle` (or an injected stylesheet) for the base `.hljs` layout rules (padding, overflow, background), exactly as with the default engine.

```svelte
<script>
  import { HighlightEditable, HighlightStyle } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  let code = "const add = (a: number, b: number) => a + b";
</script>

<HighlightStyle theme={github}>
  <HighlightEditable language={typescript} bind:code engine="css-highlights" theme={github} />
</HighlightStyle>
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
| --langtag-top           | Top position of the langtag     | `0`           |
| --langtag-right         | Right position of the langtag   | `0`           |
| --langtag-background    | Background color of the langtag | `inherit`     |
| --langtag-color         | Text color of the langtag       | `inherit`     |
| --langtag-border-radius | Border radius of the langtag    | `0`           |
| --langtag-padding       | Padding of the langtag          | `1em`         |

```svelte
<script>
  import { HighlightAuto } from "svelte-highlight";

  $: code = `.body { padding: 0; margin: 0; }`;
</script>

<HighlightAuto {code} langtag />
```

```svelte
<HighlightAuto
  {code}
  langtag
  --langtag-background="linear-gradient(135deg, #2996cf, 80%, white)"
  --langtag-color="#fff"
  --langtag-border-radius="6px"
  --langtag-padding="0.5rem"
/>
```

## Custom Language

A `language` is `{ name, register }`, where `register` is a plain-JSON grammar — the same format every `svelte-highlight/languages/*` module ships, produced by converting an [hljs-format grammar](https://highlightjs.readthedocs.io/en/latest/language-guide.html) at build time.

The easiest way to author one is with `svelte-highlight/compat`'s `fromHighlightJs`: write your grammar exactly as the hljs guide describes (a `register(hljs)` function returning a mode object), and convert it at runtime — no build step, no bundled hljs code.

```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import { fromHighlightJs } from "svelte-highlight/compat";

  function defineCustomLanguage(hljs) {
    return {
      /** custom language rules */
      contains: [],
    };
  }

  const languagePromise = fromHighlightJs("custom-language", defineCustomLanguage);
</script>

{#await languagePromise then language}
  <Highlight {language} code="..." />
{/await}
```

`fromHighlightJs` needs `highlight.js` itself, which svelte-highlight does not bundle — install it as your own dependency (`npm install highlight.js`). It's only imported the first time you call `fromHighlightJs`, so pages that never use it don't pay for it.

If you're using TypeScript, use the `LanguageType` interface to type the language.

```ts
import type { LanguageType } from "svelte-highlight";
import { fromHighlightJs } from "svelte-highlight/compat";

const language: LanguageType<"custom-language"> = await fromHighlightJs(
  "custom-language",
  (hljs) => ({ contains: [] }),
);
```

Building a package for others to install? Ship the converted grammar directly instead of calling `fromHighlightJs` at runtime — see [`scripts/convert-grammars.ts`](scripts/convert-grammars.ts) for the converter this package's own bundled languages go through.

## Custom Plugin

Third-party hljs language plugins work the same way: pass their `register(hljs)` export to `fromHighlightJs`.

This example uses the [`cURL` language plugin](https://github.com/highlightjs/highlightjs-curl).

```svelte
<script>
  import { Highlight } from "svelte-highlight";
  import { fromHighlightJs } from "svelte-highlight/compat";
  import curl from "highlightjs-curl";
  import github from "svelte-highlight/styles/github";

  const languagePromise = fromHighlightJs("curl", curl);

  const code = `curl -X POST "https://api.example.com/data" \\
     -H "Content-Type: application/json" \\
     -d '{"key": "value"}'`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

{#await languagePromise then language}
  <Highlight {language} {code} />
{/await}
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

### Loading a language by name

The example above imports a specific language as a static string, which lets the bundler split out only the grammars you reference. When the language is known only at **runtime** — a Markdown fence (` ```ts `), an API field, or a user-selected value — use the `loadLanguage` helper to import a grammar by name:

```svelte
<script>
  import { Highlight, loadLanguage } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  // The language name is not known until runtime.
  export let language = "typescript";
  export let code = "const add = (a, b) => a + b;";
</script>

<svelte:head>
  {@html github}
</svelte:head>

{#await loadLanguage(language) then grammar}
  <Highlight {code} language={grammar} />
{:catch}
  <pre>{code}</pre>
{/await}
```

`loadLanguage` accepts a [supported language name](SUPPORTED_LANGUAGES.md), dynamically imports its grammar, and resolves with the language object. It rejects with an `Unknown language` error for an unrecognized name, so handle the `{:catch}` block (or `.catch`) when the name comes from untrusted input.

> **Note:** Because the imported name is dynamic, the bundler cannot prune unused grammars and will emit a chunk for every language. Prefer a static `import` when the language is known ahead of time, and reach for `loadLanguage` only when it is not.

A practical case is rendering Markdown, where each fenced block declares its own language:

```js
import { loadLanguage } from "svelte-highlight";

// e.g. from a Markdown fence: ```ts → "typescript"
async function highlightFence(fenceLang, code) {
  const grammar = await loadLanguage(fenceLang);
  return { code, language: grammar };
}
```

## Static mode

`svelte-highlight/static` is a Svelte preprocessor. At build time it replaces `<Highlight>` usages that have known `code` and `language` with pre-rendered `highlight.js` HTML, so the client never downloads `highlight.js` or that grammar module.

The biggest win is on server-rendered or statically-generated pages, since a client-only SPA still ships the pre-rendered markup as a string inside the JS bundle, just without `highlight.js` and the grammar module.

```js
// vite.config.js
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { highlightStatic } from "svelte-highlight/static";

export default {
  plugins: [svelte({ preprocess: [highlightStatic()] })],
};
```

```svelte
<script>
  import Highlight from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
</script>

<Highlight language={javascript} code="const x = 1;" />
```

At build time this becomes plain HTML:

```html
<pre class="hljs" data-language="javascript"><code class="hljs"
  ><span class="hljs-keyword">const</span> x = <span class="hljs-number">1</span>;</code
></pre>
```

The static transform runs only when all of these are true:

- `language` is a plain identifier from a static `import` of `svelte-highlight/languages/*`.
- `code` is a string literal or a template literal with no `${...}` interpolation.
- The element has no slot content, spread props, or directives (`bind:`, `on:`, etc.).
- `langtag` is not set. Static output can't pull in `langtag.css`; that only happens when a runtime `LangTag` is in the bundle.

Dynamic `code` or `language`, `loadLanguage`, `HighlightAuto`, `HighlightSvelte`, and `HighlightEditable` keep the runtime component. No warning. That's intentional.

If a usage looks static but still fails (language module missing, `highlight.js` throws), it falls back to the runtime component and calls `onWarn`. Usually that's a typo or a resolution quirk, not a dynamic usage you meant to keep:

```js
highlightStatic({
  onWarn(message, { filename, line, cause }) {
    // defaults to `console.warn(`[svelte-highlight/static] ${filename}:${line} - ${message}`)`
  },
});
```

Scope is small on purpose. Extra props on `<Highlight>` don't carry over to the emitted `<pre>`. Unused `Highlight` and language imports are left in place; bundlers drop them (`sideEffects` in `package.json` is narrow enough). No Astro/MDX fence hook yet.

## Action

Use the `highlight` action to highlight existing `<pre><code>` markup in place. This is useful for progressively enhancing server-rendered content (e.g. markdown) without swapping in a component.

The action accepts the same `language` prop as the components. When `code` is omitted, the element's existing `textContent` is highlighted. Updating `code` re-highlights the element.

```svelte
<script>
  import { highlight } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html github}
</svelte:head>

<pre><code use:highlight={{ language: typescript, code }}></code></pre>
```

Omit `code` to highlight the element's existing contents:

```svelte
<pre><code use:highlight={{ language: typescript }}
  >const add = (a, b) => a + b;</code
></pre>
```

## Code Window

Wrap a code block in `CodeWindow` to frame it with window chrome. It's purely cosmetic; the default slot renders your content unchanged.

Use the `variant` prop to choose the chrome style: `"macos"` (default) renders traffic-light dots, `"terminal"` renders a prompt, and `"plain"` renders just the title bar. The optional `title` is shown in the title bar.

```svelte
<script>
  import Highlight, { CodeWindow } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html github}
</svelte:head>

<CodeWindow variant="macos" title="example.ts">
  <Highlight language={typescript} {code} />
</CodeWindow>
```

### Terminal output

Pair `variant="terminal"` with a shell language to frame command-line output:

```svelte
<script>
  import Highlight, { CodeWindow } from "svelte-highlight";
  import bash from "svelte-highlight/languages/bash";
  import nord from "svelte-highlight/styles/nord";

  const code = `$ npm install svelte-highlight

added 1 package in 1.2s`;
</script>

<svelte:head>
  {@html nord}
</svelte:head>

<CodeWindow variant="terminal" title="bash">
  <Highlight language={bash} {code} />
</CodeWindow>
```

### Theming the chrome

Every part of the chrome is driven by CSS variables (see [`CodeWindow` variables](#codewindow-variables)). Pass them as style props to restyle the window without `:global` overrides. For example, give the default square window rounded corners with `--window-radius`:

```svelte
<CodeWindow
  variant="macos"
  title="example.ts"
  --window-radius="12px"
  --window-background="#0d1117"
  --window-border="1px solid #30363d"
  --titlebar-background="#161b22"
  --titlebar-color="#8b949e"
>
  <Highlight language={typescript} {code} />
</CodeWindow>
```

The macOS traffic-light dots are themable too. Recolor them, or mute them to a single neutral color:

```svelte
<CodeWindow
  variant="macos"
  title="example.ts"
  --dot-close="#888"
  --dot-minimize="#888"
  --dot-maximize="#888"
>
  <Highlight language={typescript} {code} />
</CodeWindow>
```

The `plain` variant drops the dots and prompt for a minimal titled bar:

```svelte
<CodeWindow variant="plain" title="example.ts">
  <Highlight language={typescript} {code} />
</CodeWindow>
```

### Composing with other components

`CodeWindow` only frames its slot, so it composes with the rest of the library. Add `LineNumbers` inside it:

```svelte
<script>
  import Highlight, { CodeWindow, LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const code = `const add = (a, b) => a + b;
const sub = (a, b) => a - b;`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<CodeWindow variant="macos" title="math.ts">
  <Highlight language={typescript} {code} let:highlighted>
    <LineNumbers {highlighted} hideBorder />
  </Highlight>
</CodeWindow>
```

Or layer a `CopyButton` over it by wrapping both in a relatively-positioned container:

```svelte
<div style="position: relative">
  <CodeWindow variant="macos" title="example.ts">
    <Highlight language={typescript} {code} />
  </CodeWindow>
  <!-- Offset the button so it clears the title bar. -->
  <CopyButton {code} --copy-top="3em" />
</div>
```

## Animation

Use `Typewriter` inside `Highlight`'s default slot with the `highlighted` prop. It prints the code one character at a time, syntax highlighting included. A blinking caret marks the end of the typed text and hides when typing stops.

Unrevealed text stays in the layout but invisible, so the block is full height from the start. Content below won't jump as characters appear. You don't need a `min-height` hack.

```svelte
<script>
  import Highlight, { Typewriter } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<svelte:head>
  {@html github}
</svelte:head>

<Highlight language={typescript} {code} let:highlighted>
  <Typewriter {highlighted} />
</Highlight>
```

Set `speed` (milliseconds per character) and pause with `play`. Turn `play` back on to pick up where you left off. A new `highlighted` value starts over from the first character. Fire `on:done` when the last character is visible.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <Typewriter
    {highlighted}
    speed={50}
    {play}
    on:done={() => console.log("revealed")}
  />
</Highlight>
```

With `prefers-reduced-motion`, the full block shows immediately and `on:done` runs right away. Customize the caret with `--caret-width`, `--caret-height`, `--caret-gap`, `--caret-color`, and `--caret-blink`.

Each tick reveals one already-rendered unit rather than re-rendering the block, so animating stays smooth up to tens of thousands of characters; past that it falls back to the coarser whole-block reveal.

## Streaming

Rendering LLM chat output is the dominant new syntax-highlighting use case: code arrives in arbitrary-sized chunks, mid-token and mid-line, and you don't know the full content up front. `HighlightStream` is built for that -- unlike `Typewriter`, which animates a complete, already-highlighted string and restarts whenever it changes, `HighlightStream` accepts a growing `code` buffer and re-highlights it as chunks arrive.

Append to `code` as chunks come in; set `done` once the stream ends.

```svelte
<script>
  import { HighlightStream } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  let code = "";
  let done = false;

  // Wire this up to your streaming source (fetch, WebSocket, SSE, ...).
  async function stream() {
    for (const chunk of chunks) {
      code += chunk;
      await new Promise((r) => setTimeout(r, 30));
    }
    done = true;
  }
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightStream language={typescript} {code} {done} />
```

Multiple chunks appended within the same animation frame coalesce into a single highlight pass. Already-rendered lines are diffed and left untouched in the DOM; only lines whose content actually changed are repainted, so a fast-scrolling response only touches its changed suffix (typically the last line). A multi-line construct left open mid-stream -- an unterminated template literal or block comment -- re-tokenizes the lines it spans once the closing delimiter arrives, with no special-casing needed: it falls out of re-highlighting the full buffer on every update.

A blinking caret marks the end of output while `!done`; setting `done` hides it and performs one final full highlight, so the finished output matches what `Highlight` would render for the same code. `on:done` fires right after that final highlight. Customize the caret with the same `--caret-width`, `--caret-height`, `--caret-gap`, `--caret-color`, and `--caret-blink` variables as `Typewriter`.

Set `autoScroll` to keep the container pinned to the bottom as output grows -- it stops auto-scrolling as soon as you scroll up, and resumes once you scroll back to the bottom.

```svelte
<HighlightStream language={typescript} {code} {done} autoScroll style="max-height: 20em; overflow-y: auto;" />
```

This is O(buffer) per highlighted frame and DOM updates proportional to the changed lines -- fine for chat-sized output up to a few thousand lines, not a virtualized log viewer.

## Terminal Output

Use `AnsiOutput` to render terminal output that still contains ANSI [SGR](https://en.wikipedia.org/wiki/ANSI_escape_code#SGR_(Select_Graphic_Rendition)_parameters) escape codes. Colors, bold, dim, italic, and underline become styled HTML, along with OSC 8 hyperlinks, carriage-return overwrites, and reverse/strikethrough. The parser is separate from highlight.js, so reach for it with build logs, CLI output, and test runners.

```svelte
<script>
  import { AnsiOutput } from "svelte-highlight";

  // Raw program output, escape codes included.
  const text = "\x1b[32m✓\x1b[0m build succeeded \x1b[2m(1.2s)\x1b[0m";
</script>

<AnsiOutput {text} />
```

Malformed or unsupported escape sequences are dropped. Nothing throws.

### Theming the palette

Pass `--ansi-*` style props to recolor the output. The 16 base colors, default foreground and background, and bold/dim weight and opacity all come from CSS variables with hex fallbacks:

```svelte
<AnsiOutput
  {text}
  --ansi-background="#0d1117"
  --ansi-red="#ff7b72"
  --ansi-green="#3fb950"
/>
```

256-color and 24-bit truecolor codes resolve to RGB.

### Readable colors

With `autoContrast` on (the default), spans that set a background get a readable foreground. If the chosen text color would disappear on that background (white on white, for example), it flips to black or white, whichever reads better. Only spans with a background are adjusted. Set `autoContrast={false}` to keep the ANSI colors as-is.

```svelte
<AnsiOutput {text} autoContrast={false} />
```

### Pairing with `CodeWindow`

Put `AnsiOutput` inside `CodeWindow variant="terminal"` for the prompt and title bar:

```svelte
<script>
  import { AnsiOutput, CodeWindow } from "svelte-highlight";

  const text = "\x1b[1;32m$\x1b[0m npm run build";
</script>

<CodeWindow variant="terminal" title="bash">
  <AnsiOutput {text} />
</CodeWindow>
```

Call `parseAnsi` directly if you need the segments yourself:

```js
import { parseAnsi } from "svelte-highlight";

parseAnsi("\x1b[31merror\x1b[0m");
// => [{ text: "error", fg: { name: "red" } }]
```

## File Tabs

`FileTabs` groups code snippets behind a tab strip, like files in an editor. Pass file names as `files`, then use `let:active` in the default slot to render the matching snippet.

Arrow keys move between tabs; `Home` and `End` jump to the first and last. The markup follows the WAI-ARIA tabs pattern (`role="tablist"`, `role="tab"`, `role="tabpanel"`).

```svelte
<script>
  import Highlight, { FileTabs } from "svelte-highlight";
  import javascript from "svelte-highlight/languages/javascript";
  import typescript from "svelte-highlight/languages/typescript";
  import github from "svelte-highlight/styles/github";

  const sources = {
    "App.svelte": { language: typescript, code: "const answer = 42;" },
    "index.js": { language: javascript, code: "export default answer;" },
  };

  const files = Object.keys(sources);
</script>

<svelte:head>
  {@html github}
</svelte:head>

<FileTabs {files} let:active>
  <Highlight language={sources[active].language} code={sources[active].code} />
</FileTabs>
```

`bind:active` sets the open tab from your code. `on:change` fires when the user picks a different one.

```svelte
<FileTabs {files} bind:active on:change={(e) => console.log(e.detail.active)}>
  <Highlight language={sources[active].language} code={sources[active].code} />
</FileTabs>
```

## Component API

### `Highlight`

#### Props

| Name     | Type                                           | Default value  |
| :------- | :--------------------------------------------- | :------------- |
| code     | `any`                                          | N/A (required) |
| language | { name: `string`; register: `object` } | N/A (required) |
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
| langtag            | `boolean`  | `false`        |
| languageName       | `string`   | `"plaintext"`  |

`$$restProps` are forwarded to the top-level `div` element.

### `CopyButton`

#### Props

| Name       | Type                                       | Default value                                |
| :--------- | :----------------------------------------- | :------------------------------------------- |
| code       | `string`                                   | N/A (required)                               |
| copy       | `(code: string) => void \| Promise<void>`  | `(code) => navigator.clipboard.writeText(code)` |
| transform  | `(code: string) => string`                 | `(code) => code`                             |
| timeout    | `number`                                   | `2000`                                       |
| text       | `string`                                   | `"Copy"`                                     |
| copiedText | `string`                                   | `"Copied!"`                                  |

`$$restProps` are forwarded to the top-level `button` element.

#### Dispatched Events

- **on:copy**: fired after a successful copy, with `{ code }` -- the `transform`-applied string, not the original `code` prop
- **on:error**: fired if the copy behavior throws, with `{ error }`

```svelte
<CopyButton
  {code}
  on:copy={(e) => console.log(e.detail.code)}
  on:error={(e) => console.error(e.detail.error)}
/>
```

### `CodeWindow`

#### Props

| Name    | Type                               | Default value |
| :------ | :--------------------------------- | :------------ |
| variant | `"macos" \| "terminal" \| "plain"` | `"macos"`     |
| title   | `string`                           | `""`          |

`$$restProps` are forwarded to the top-level `div` element.

### `AnsiOutput`

#### Props

| Name         | Type      | Default value  |
| :----------- | :-------- | :------------- |
| text         | `string`  | N/A (required) |
| autoContrast | `boolean` | `true`         |

`$$restProps` are forwarded to the top-level `pre` element.

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

| Name      | Type             | Default value  |
| :-------- | :--------------- | :------------- |
| code      | `any`            | N/A (required) |
| languages | `LanguageName[]` | `undefined`    |
| langtag   | `boolean`        | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

**Note:** `LanguageName` is a union type of all supported language names, providing autocomplete and type safety. You can import it from `svelte-highlight`:

```ts
import type { LanguageName } from "svelte-highlight";
```

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

### `HighlightEditable`

#### Props

| Name         | Type                                           | Default value  |
| :----------- | :--------------------------------------------- | :------------- |
| code         | `string`                                       | `""`           |
| language     | { name: `string`; register: `object` } | N/A (required) |
| tabSize      | `number`                                       | `2`            |
| historyLimit | `number`                                       | `200`          |

`$$restProps` are forwarded to the top-level `pre` element.

`code` supports two-way binding (`bind:code`).

#### Methods

Use `bind:this`, then call `undo()`, `redo()`, `focus()`, `selectAll()`, `insert(text)`, `indent()`, `outdent()`, `setCode(value)`, `clear()`, `getCode()`, `canUndo()`, or `canRedo()`.

#### Dispatched Events

- **on:change**: fired on every edit, with `{ code }`
- **on:blur**: fired when the editor loses focus, with `{ code }`
- **on:history**: fired when the undo/redo stack changes, with `{ entries, index, canUndo, canRedo }`

```svelte
<HighlightEditable
  language={typescript}
  bind:code
  on:change={(e) => console.log(e.detail.code)}
  on:history={(e) => console.log(e.detail.canUndo, e.detail.canRedo)}
/>
```

### `HighlightStream`

#### Props

| Name       | Type                                           | Default value  |
| :--------- | :--------------------------------------------- | :------------- |
| code       | `string`                                       | `""`           |
| language   | { name: `string`; register: `object` } | N/A (required) |
| done       | `boolean`                                      | `false`        |
| caret      | `boolean`                                      | `true`         |
| autoScroll | `boolean`                                      | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

#### Dispatched Events

- **on:highlight**: fired after each highlight pass, with `{ highlighted }`
- **on:done**: fired after the final full highlight once `done` is set

```svelte
<HighlightStream
  language={typescript}
  {code}
  {done}
  on:highlight={(e) => console.log(e.detail.highlighted)}
  on:done={() => console.log("stream finished")}
/>
```

### `FileTabs`

#### Props

| Name   | Type       | Default value  |
| :----- | :--------- | :------------- |
| files  | `string[]` | N/A (required) |
| active | `string`   | `files[0]`     |

`$$restProps` are forwarded to the top-level `div` element. `active` supports `bind:active`.

#### Dispatched Events

- **on:change**: fired when the user picks a tab, with `{ active }`

```svelte
<FileTabs {files} on:change={(e) => console.log(e.detail.active)} let:active>
  <Highlight language={sources[active].language} code={sources[active].code} />
</FileTabs>
```

### `Typewriter`

#### Props

| Name        | Type      | Default value |
| :---------- | :-------- | :------------ |
| highlighted | `string`  | `""`          |
| speed       | `number`  | `30`          |
| play        | `boolean` | `true`        |

`$$restProps` are forwarded to the top-level `pre` element.

#### Dispatched Events

- **on:done**: fires when typing finishes, or immediately when reduced motion is on

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <Typewriter {highlighted} on:done={() => console.log("revealed")} />
</Highlight>
```

## [Supported Languages](SUPPORTED_LANGUAGES.md)

## [Supported Styles](SUPPORTED_STYLES.md)

## Examples

By default, example set-ups use Svelte 5. The exception is `examples/vite@svelte-4`, which uses Svelte 4.

- [examples/rollup](examples/rollup)
- [examples/routify](examples/routify)
- [examples/sveltekit](examples/sveltekit)
- [examples/vite](examples/vite)
- [examples/vite@svelte-4](examples/vite@svelte-4)
- [examples/webpack](examples/webpack)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

Grammars and themes are derived from [highlight.js](https://github.com/highlightjs/highlight.js), used under its [BSD-3-Clause license](LICENSE.highlight.txt). The highlighting engine itself is original code under this package's MIT license — no highlight.js source is included in it.

[npm]: https://img.shields.io/npm/v/svelte-highlight.svg?style=for-the-badge&color=%23ff3e00
[npm-url]: https://npmjs.com/package/svelte-highlight
