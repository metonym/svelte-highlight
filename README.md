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

`code` accepts any value and is coerced with `String(code ?? "")`: an object like `{}` renders as `"[object Object]"`, while `undefined`/`null` render as nothing.

```svelte
<script>
  import Highlight from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  const code = "const add = (a: number, b: number) => a + b;";
</script>

<Highlight language={typescript} {code} />
```

### Wrapping Long Lines

By default, overflowing horizontal content is contained by a scrollbar. Set `wrap` to `true` to wrap long lines instead.

```svelte
<Highlight wrap language={typescript} {code} />
```

Don't combine `wrap` with `HighlightStream`'s `virtualize` mode or `HighlightVirtual` -- both assume one fixed-height line per row, which wrapping breaks.

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
<HighlightStyle light={cyanotypeLight} dark={cyanotypeDark} mode="auto">
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

The wrapper's inline style carries the plain light value for each var (e.g. `--shl-keyword:#a626a4`) — a baseline every browser can render. A scoped, deduped `<style>` tag (gated behind `@supports (color: light-dark(...))`) overrides it with `--shl-keyword: light-dark(#a626a4, #c678dd)` (etc.) plus `color-scheme: light dark` on browsers that support `light-dark()`. `mode="light"` / `mode="dark"` force `color-scheme: light` / `dark`. Any other `mode` string (the legacy "CSS selector" mode) omits `color-scheme` inline — set it on your own selector for app-controlled switching, e.g. `[data-theme="dark"] { color-scheme: dark }`.

See it live, with a mode toggle, on the [dual-palette preview page](https://svhe.onrender.com/preview-dual-palette).

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

`HighlightStyle` also inlines `color-scheme` from the palette(s) it's given — `palette.colorScheme` for a single `theme`, or a value derived from `mode` for a `light`/`dark` pair — so native form controls and scrollbars inside a themed block follow the theme too.

`extras` isn't a corner case for every theme — e.g. the `3024` theme's `extras` covers 7 declarations, including `.hljs ::selection`, `.hljs::selection`, `.hljs-operator`, and `.ruby .hljs-property`, all silently dropped when that theme is imported as a `ThemePalette` object (`svelte-highlight/themes/3024`) instead of its `.css` artifact. There's no per-theme fidelity indicator today; [SUPPORTED_THEMES.md](SUPPORTED_THEMES.md) is where one could eventually live.

### Creating themes

`svelte-highlight/theme` exports a typed, programmatic way to build or derive `ThemePalette` objects, instead of hand-writing `--shl-*` vars against the full scope vocabulary.

**`defineTheme()`** builds a complete palette from a small typed definition: a ~14-key **semantic role** layer (pick a dozen colors, get a full theme) plus optional per-scope precision overrides.

```js
import { defineTheme } from "svelte-highlight/theme";

const midnight = defineTheme({
  name: "midnight",
  roles: {
    background: "#0b1021",
    foreground: "#d6deeb",
    comment: { color: "#637777", fontStyle: "italic" },
    keyword: "#c792ea",
    string: "#ecc48d",
    literal: "#f78c6c",
    function: "#82aaff",
    type: "#ffcb8b",
    variable: "#addb67",
    tag: "#7fdbca",
  },
  scopes: {
    "title.class_": "#ffd700", // per-scope precision on top of roles
    "meta keyword": "#5f7e97",
  },
});
```

```svelte
<HighlightStyle theme={midnight}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

`roles` are `foreground`, `background`, `comment`, `keyword`, `string`, `literal`, `function`, `type`, `variable`, `property`, `tag`, `punctuation`, `meta`, `addition`, `deletion` — each expands to a documented set of `--shl-*` scope vars. A bare string is shorthand for `{ color: string }`; both roles and `scopes` also accept a `{ color, background, fontStyle, fontWeight, textDecoration }` object. Precedence is `extends` palette vars → `roles` → `scopes` (later layers win per-var, not per-role). `foreground`/`background` are required unless `extends` is given. `ROLE_SCOPES` is exported for tooling that wants to enumerate exactly which scopes a role expands to.

**`extendTheme()`** derives a new palette from any shipped or user palette with role- or scope-level overrides:

```js
import atomOneDark from "svelte-highlight/themes/atom-one-dark";
import { extendTheme } from "svelte-highlight/theme";

const branded = extendTheme(atomOneDark, {
  name: "atom-one-dark-branded",
  roles: { keyword: "#ff79c6" },
});
```

**`paletteToCss()`** emits any palette as a CSS string — for build-time/global CSS instead of the `HighlightStyle` component:

```js
import { paletteToCss } from "svelte-highlight/theme";

writeFileSync("public/midnight.css", paletteToCss(midnight));
```

`defineTheme` output is a plain `ThemePalette` — spreadable, serializable, diffable, and valid everywhere shipped palettes work, per [Themes are data](#theming) above.

**`validatePalette()`** self-checks a `ThemePalette` — useful for a hand-built or hand-edited palette, e.g. one assembled via the [Themes are data](#theming) spread pattern above:

```js
import { validatePalette } from "svelte-highlight/theme";

const custom = {
  ...atomOneDark,
  vars: { ...atomOneDark.vars, "--shl-keyword": "#ff79c6" },
};

validatePalette(custom); // -> [] when clean; otherwise a list of issues
```

It flags a missing/malformed `vars` object, a missing `--shl-fg`/`--shl-bg`, a `vars` key outside the `--shl-*` grammar, and a `--shl-fg`/`--shl-bg` value that doesn't look like a recognized color — never throws. `defineTheme` already runs it (plus an unknown-`scopes`-key check) automatically in dev mode.

### Importing VS Code themes

`svelte-highlight/theme/textmate` imports VS Code / TextMate theme JSON (thousands of existing editor themes) into a `ThemePalette`:

```js
import { fromTextMate } from "svelte-highlight/theme/textmate";
import nightOwl from "./night-owl-color-theme.json" with { type: "json" };

const palette = fromTextMate(nightOwl);
```

`fromTextMate` accepts a **parsed object** only — VS Code themes are often JSONC, so parsing is the caller's job. The scope mapping is best-effort: TextMate scope selectors are matched against a starter table by segment-prefix (`"entity.name.function"` matches `"entity.name.function.method.ts"`), with the most specific (longest) match winning ties broken by the later `tokenColors` entry — the same specificity semantics VS Code itself uses. The starter table covers common scopes, including Markdown code spans/fences and invalid/illegal markers; because matching generalizes by prefix, a row like `"keyword"` already resolves any more-specific scope sharing that prefix, so `"keyword.control"` and `"keyword.operator"` resolve differently without needing a dedicated row for each. Entries that don't map to anything are never silently dropped; pass `onWarn` to observe them:

```js
const palette = fromTextMate(nightOwl, {
  onWarn: (message) => console.warn(message),
});
```

To count unmapped entries instead of observing each one as it happens, use `fromTextMateWithWarnings`, which aggregates every `onWarn` call:

```js
import { fromTextMateWithWarnings } from "svelte-highlight/theme/textmate";

const { palette, warnings } = fromTextMateWithWarnings(nightOwl);
// warnings.length is the number of unmapped tokenColors entries
```

When present, `theme.semanticTokenColors` is read as a higher-priority overlay on top of `tokenColors` — matching VS Code's own precedence when semantic highlighting is enabled. It's resolved against a starter table of VS Code's default semantic token types (`namespace`, `class`, `interface`, `enum`, `struct`, `typeParameter`, `type`, `parameter`, `variable`, `enumMember`, `property`, `event`, `decorator`, `label`, `function`, `method`, `macro`, `comment`, `string`, `keyword`, `number`, `regexp`, `operator`); modifiers (`"variable.readonly"`) and language scoping (`"variable:typescript"`) are not resolved — only the base type before the first `.` or `:` is matched.

`fromTextMate` never populates `ThemePalette.extras` — `editor.background` is always read as a single solid color assigned straight to `--shl-bg`. This matches VS Code's own model (VS Code doesn't support gradients for `editor.background` either), so it's a deliberate, low-risk scope cut rather than a gap to fix.

Real VS Code theme files are usually JSONC (comments, trailing commas), which `fromTextMate` doesn't accept directly. `scripts/import-textmate-theme.ts` is a local dev recipe — not an installed CLI — that strips comments/trailing commas and writes the resulting `ThemePalette` as JSON; copy it into your own project and adapt as needed:

```sh
bun scripts/import-textmate-theme.ts ./night-owl-color-theme.json ./night-owl.palette.json
```

## Styling

Import styles from `svelte-highlight/styles`. See [SUPPORTED_STYLES.md](SUPPORTED_STYLES.md) for a list of supported styles. For new projects, prefer [Theming](#theming) above — this is the original, string-based theming path, kept fully supported for backward compatibility. Legacy styles are stable and will not be removed. One concrete reason to pick this path over `ThemePalette`: `base.css` assumes the default `hljs-` class prefix, so projects using a custom `classPrefix` should stay here. 45 of the styles (90 dark/light files) are original pairs authored by svelte-highlight rather than ported from highlight.js, marked as custom in the gallery and in `SUPPORTED_STYLES.md`.

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

Under a strict Content Security Policy without `'unsafe-inline'` for `style-src`, the browser silently drops this injected `<style>` tag with no visible error. Use [CSS StyleSheet](#css-stylesheet) below instead, which is CSP-safe by construction since it's a normal stylesheet reference.

This snippet also has no protection against duplicate `<style>` tags: placing it inside a component that's mounted more than once emits one `<style>` tag per mount. For anything mounted more than once, use [`HighlightStyle`](#highlightstyle) instead, which dedupes automatically across instances of the same theme.

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

`theme` is required. `scopeClass` defaults to a hash of the theme string. Pass your own, or bind it (`bind:scopeClass`) / read it from the slot (`let:scopeClass`). An empty string is treated the same as omitting `scopeClass` — it falls back to the auto-hash. `scopeClass` must be a single valid CSS class name; a value like `"a b"` will warn in the console and won't scope as expected.

For a page-wide theme, use `{@html theme}` as shown above.

Under a `style-src` CSP that requires a nonce, pass `nonce` and it's attached to the `<style>` tag `HighlightStyle` injects into `<svelte:head>`:

```svelte
<HighlightStyle theme={a11yDark} nonce={cspNonce}>
  <Highlight language={typescript} {code} />
</HighlightStyle>
```

A single `ThemePalette` (`theme` as an object, not a `light`/`dark` pair) never injects a `<style>` tag at all — only inline vars on the wrapper — so it's unaffected by a `style-src` nonce requirement in the first place; that's a reason to prefer it under a strict CSP.

**Known limitation:** on the CSS-string path, server-side rendering emits one `<style>` tag per `HighlightStyle` instance, even when several instances on the page share the exact same theme — the client-side dedupe only kicks in after hydration. This is harmless (CSS is idempotent), but adds extra bytes on pages with many repeated identical-theme instances. The `ThemePalette` object path has no such concern for a single theme, since it never injects a `<style>` tag to begin with.

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

The `ThemePalette` object pair path (`light`/`dark` as [`ThemePalette`s](#theming) rather than CSS strings) works the same way, but resolves the pair via `light-dark()` instead of `prefers-color-scheme`/selector gating. On a browser that predates `light-dark()` support, it now falls back to the light theme instead of rendering broken (unset) colors: a scoped, deduped `<style>` tag applies the `light-dark()` values behind `@supports (color: light-dark(...))`, and the wrapper's own inline style carries the plain light value as the pre-`@supports` baseline. Single-theme (`theme` alone, no pair) SSR-identical guarantees are unaffected either way.

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

| Variable                  | Description                                       | Default value               |
| :------------------------ | :------------------------------------------------ | :--------------------------- |
| --line-number-color       | Text color of the line numbers                    | `currentColor`               |
| --line-number-digit-width | Width of a single gutter digit                    | `0.6em`                      |
| --border-color            | Border color of the column of line numbers        | `currentColor`               |
| --highlighted-background  | Background color of highlighted lines             | `rgba(254, 241, 96, 0.2)`    |
| --line-added-background   | Background color of `lineStates` `"added"` lines   | `rgba(46, 204, 113, 0.15)`   |
| --line-removed-background | Background color of `lineStates` `"removed"` lines | `rgba(231, 76, 60, 0.15)`    |
| --unhighlighted-opacity   | Opacity of un-highlighted lines (focus mode)      | `1`                          |
| --unhighlighted-filter    | CSS filter for un-highlighted lines (focus mode)  | `none`                       |
| --padding                 | Fallback padding for `--padding-left` / `--padding-right` | `1em`                 |
| --padding-left            | Left padding for `td` elements                    | `var(--padding, 1em)`        |
| --padding-right           | Right padding for `td` elements                   | `var(--padding, 1em)`        |

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
| --langtag-font-size     | Font size of the langtag        | `inherit`     |

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

### `FileTabs` variables

| Variable               | Description                                                     | Default value                                |
| :---------------------- | :--------------------------------------------------------------- | :-------------------------------------------- |
| --file-tabs-gap         | Gap between tabs                                                  | `0`                                            |
| --file-tabs-background  | Tab strip background                                              | `inherit`                                      |
| --tab-overflow-fade     | Width of the scroll shadow shown on the overflowing edge          | `1.5rem`                                       |
| --tab-padding           | Padding of each tab                                               | `0.5em 1em`                                    |
| --tab-color             | Text color of inactive tabs                                      | `inherit`                                      |
| --tab-background        | Background color of inactive tabs                                | `transparent`                                  |
| --tab-inactive-opacity  | Opacity of inactive tabs (active and hovered tabs stay opaque)    | `0.55`                                         |
| --tab-active-color      | Text color of the active tab                                     | the highlighted code's text color              |
| --tab-active-background | Background color of the active tab                               | the highlighted code's background              |
| --tab-focus-outline     | Keyboard focus outline of a tab                                   | `2px solid currentColor`                       |

## Svelte Syntax Highlighting

Use the `HighlightSvelte` component for Svelte syntax highlighting. Its grammar understands Svelte 5 runes (`$state`, `$derived`, `$effect` and its suffixed forms, `$props.id`, `$inspect.trace`), store auto-subscription (`$store`, `$store()`, `$store.prop`), `lang="ts"`/`context="module"` script-block resolution, and directive shorthand (`on:`, `bind:`, `use:`, and friends) — genuinely ahead of generic HTML-plus-embedded-JS Svelte highlighting, which has no notion that runes exist.

```svelte
<script>
  import { HighlightSvelte } from "svelte-highlight";
  import github from "svelte-highlight/styles/github";

  const code = `<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
<\/script>

<button on:click={() => count++}>{doubled} (store: {$externalCount})</button>`;
</script>

<svelte:head>
  {@html github}
</svelte:head>

<HighlightSvelte {code} />
```

Nested template declaration tags are also supported — including a second, shadowing `{const ...}` declared inside a nested element within the same `{#each}` block.

See the [kitchen-sink live demo](https://svhe.onrender.com/preview-svelte) for a fuller tour of Svelte highlighting across every theme.

## Auto-highlighting

The `HighlightAuto` component uses the [highlightAuto API](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto) and attempts to guess what grammar to use based on the provided `code`. Its `on:highlight` event's `secondBest` field surfaces the runner-up candidate and its relevance, for showing detection confidence.

> [!WARNING]
> Mounting `HighlightAuto` statically imports all 279 shipped grammars, regardless of `languageNames`, so bundle size is unconditionally larger than a `Highlight` with a single named language. Specify a language if possible.

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

You can restrict [language auto-detection](https://highlightjs.readthedocs.io/en/latest/api.html#highlightauto-value-languagesubset) to a subset using the `languageNames` prop. This can improve performance and accuracy — it narrows the candidates scored during detection, but it does not reduce bundle size, since all shipped grammars are imported unconditionally (see the warning above). A grammar registered with `disableAutodetect: true` stays excluded from detection even when explicitly named in `languageNames`.

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

### Windowed Lines

`LineNumbers` re-splits the entire `highlighted` string into lines on every update, which is wasteful once you're already rendering a window out of a much larger document. Pass a pre-split `lines` array instead -- the same per-line HTML shape `svelte-highlight/tokenized-document`'s `lineRange` (see [Large documents](#large-documents)) and `HighlightStream`'s incremental rendering already produce -- and set `lineCount` to the *total* document line count so the gutter is sized for the whole document instead of jittering as the window scrolls. `startingLineNumber` offsets the row numbers to match the window's position; `highlightedLines`/`lineStates` index relative to the `lines` array actually rendered, not the absolute document line.

```svelte
<script>
  import { LineNumbers } from "svelte-highlight";
  import { createTokenizedDocument } from "svelte-highlight/tokenized-document";
  import typescript from "svelte-highlight/languages/typescript";

  const doc = createTokenizedDocument({ language: typescript });
  doc.setCode(bigFile);

  const start = 50_000;
  const end = 50_040;
</script>

<LineNumbers
  lines={doc.lineRange(start, end)}
  startingLineNumber={start + 1}
  lineCount={doc.lineCount()}
/>
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

### Line States

`highlightedLines` only supports one visual treatment. Use `lineStates` for a per-line state map -- `"highlighted"` (same treatment as `highlightedLines`), `"focus"` (exempt from dimming, no background color), `"added"`, or `"removed"` -- so diff-style and meta-string-style decorations can share one primitive. Indices start at zero and are merged with `highlightedLines`, which is equivalent to setting `"highlighted"` here.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    lineStates={{ 1: "added", 2: "removed", 4: "focus" }}
  />
</Highlight>
```

Use `--line-added-background` and `--line-removed-background` to customize the background colors.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    lineStates={{ 1: "added", 2: "removed" }}
    --line-added-background="rgba(0, 255, 0, 0.15)"
    --line-removed-background="rgba(255, 0, 0, 0.15)"
  />
</Highlight>
```

### Custom Styles

Use `--style-props` to customize styles.

| Style prop                | Description                                              | Default value              |
| :------------------------ | :------------------------------------------------------ | :-------------------------- |
| --line-number-color       | Text color of the line numbers                          | `currentColor`              |
| --line-number-digit-width | Width of a single gutter digit                          | `0.6em`                     |
| --border-color            | Border color of the column of line numbers              | `currentColor`              |
| --padding                 | Fallback padding for `--padding-left` / `--padding-right` | `1em`                     |
| --padding-left            | Left padding for `td` elements                          | `var(--padding, 1em)`       |
| --padding-right           | Right padding for `td` elements                         | `var(--padding, 1em)`       |
| --highlighted-background  | Background color of highlighted lines                   | `rgba(254, 241, 96, 0.2)`   |
| --line-added-background   | Background color of `lineStates` `"added"` lines         | `rgba(46, 204, 113, 0.15)`  |
| --line-removed-background | Background color of `lineStates` `"removed"` lines        | `rgba(231, 76, 60, 0.15)`   |
| --unhighlighted-opacity   | Opacity of un-highlighted lines (focus mode)             | `1`                         |
| --unhighlighted-filter    | CSS filter for un-highlighted lines (focus mode)         | `none`                      |

See [Styling with CSS variables](#styling-with-css-variables) for the full list, including container-level variables like `--border-radius`, `--width`, and `--overflow-x`.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <LineNumbers
    {highlighted}
    --line-number-color="pink"
    --line-number-digit-width="0.75em"
    --border-color="rgba(255, 255, 255, 0.2)"
    --padding-left={0}
    --padding-right="3em"
    --highlighted-background="#000"
    --border-radius="8px"
    --max-width="40rem"
  />
</Highlight>
```

The gutter's position and border use logical CSS properties (`inset-inline-start`/`inset-inline-end`), so it follows `dir="rtl"` without any extra configuration.

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
- **Escape** then **Tab**/**Shift+Tab** moves keyboard focus out of the editor instead of indenting, so the block never traps focus. Any other key clears this and restores normal Tab behavior.
- **Cmd/Ctrl+Z** undo and **Shift+Cmd/Ctrl+Z** (or **Ctrl+Y**) redo. Typing bursts collapse into a single undo step; cap the retained history with the `historyLimit` prop (default `200`).

Pasting and dragging content into the editor both insert plain text only, regardless of the source payload (rich text, HTML, etc.).

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

### Read-only

Set `readonly` to keep highlighting, caret placement, and selection active while blocking edits (typing, paste, drag-and-drop, and Tab/Shift+Tab indent). The imperative API still works, so a consumer can toggle a document read-only without swapping components.

```svelte
<script>
  let readonly = false;
</script>

<HighlightEditable language={typescript} bind:code {readonly} />
<button on:click={() => (readonly = !readonly)}>
  {readonly ? "Unlock" : "Lock"}
</button>
```

### Experimental: CSS Custom Highlight engine

`engine="css-highlights"` paints tokens with the [CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API) (`CSS.highlights`, `::highlight()`) instead of wrapping them in `<span>`s. The editable `<code>` stays plain text (one `<span>` per line, reused from the default engine's line structure, but with no per-token spans inside), so a repaint never replaces the DOM the caret is sitting in.

Requires Chrome 105+, Safari 17.2+, or Firefox 140+. Where `CSS.highlights` is unavailable, `HighlightEditable` falls back to `engine="dom"` silently; check what actually ran with `editor.resolvedEngine()`.

Pass `theme` (the same theme string you'd give `HighlightStyle`) to generate `::highlight()` rules from it. Only `color`/`background-color` convert, and only for single-class `.hljs-<scope>` rules — compound (`.hljs-title.class_`) and descendant-selector (`.hljs-meta .hljs-keyword`) scopes have no `::highlight()` equivalent and get **no color at all**, not just plain weight/style.

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

### Adding a gutter

`HighlightEditable` has no slot and doesn't expose `highlighted`/`languageName`, so it can't be wrapped directly in `LineNumbers` the way a static `Highlight` block can. Mirror the same `code` in a second, read-only `Highlight` instance wrapped in `LineNumbers`, and position it alongside the editable block:

```svelte
<script>
  import { Highlight, HighlightEditable, LineNumbers } from "svelte-highlight";
  import typescript from "svelte-highlight/languages/typescript";

  let code = "const add = (a: number, b: number) => a + b";
</script>

<HighlightEditable language={typescript} bind:code />

<Highlight language={typescript} {code} let:highlighted let:languageName>
  <LineNumbers {highlighted} {languageName} />
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

The language tag is one badge (`LangTag.svelte` + `langtag.css`) reached three ways: automatically, via `Highlight`/`HighlightAuto`/`HighlightSvelte`'s built-in fallback render when `langtag` is set; directly, via the standalone `LangTag` component; or via `LineNumbers`' own `langtag`/`languageName` props, which are not wired to a wrapping `Highlight` automatically and must be forwarded manually from slot props (see [Language Tag](#language-tag) under Line Numbers).

Set `langtag` to `true` to display the language name in the top right corner of the code block.

Customize the language tag `background`, `color`, and `border-radius` using style props.

Setting `langtag` opts a `<Highlight>` usage out of the [`svelte-highlight/static`](#static-mode) build-time transform, since static output can't pull in `langtag.css`.

If the highlighted output is empty (e.g. empty `code`, or code that highlights to an empty string), the badge and code block still render, but the code falls back to plain, unhighlighted text — the `hljs` class is still applied, there's just no syntax-highlighting markup inside it.

See the [Languages page](SUPPORTED_LANGUAGES.md) for a list of supported languages.

| Style prop              | Description                     | Default value |
| :---------------------- | :------------------------------ | :------------ |
| --langtag-top           | Top position of the langtag     | `0`           |
| --langtag-right         | Right position of the langtag   | `0`           |
| --langtag-background    | Background color of the langtag | `inherit`     |
| --langtag-color         | Text color of the langtag       | `inherit`     |
| --langtag-border-radius | Border radius of the langtag    | `0`           |
| --langtag-padding       | Padding of the langtag          | `1em`         |
| --langtag-font-size     | Font size of the langtag        | `inherit`     |

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

  function defineDotenv(hljs) {
    return {
      name: "dotenv",
      contains: [
        hljs.HASH_COMMENT_MODE,
        { className: "keyword", begin: /^[ \t]*export(?=[ \t])/ },
        { className: "attr", begin: /[A-Za-z_][A-Za-z0-9_]*(?=[ \t]*=)/ },
        {
          className: "string",
          variants: [
            { begin: /"/, end: /"/, contains: [hljs.BACKSLASH_ESCAPE] },
            { begin: /'/, end: /'/ },
          ],
        },
      ],
    };
  }

  const languagePromise = fromHighlightJs("dotenv", defineDotenv);
</script>

{#await languagePromise then language}
  <Highlight {language} code={'PORT=3000\n# comment'} />
{/await}
```

`fromHighlightJs` needs `highlight.js` itself, which svelte-highlight does not bundle — install it as your own dependency (`npm install highlight.js`). It's only imported the first time you call `fromHighlightJs`, so pages that never use it don't pay for it.

`fromHighlightJs` also accepts an optional third `source` argument (raw source text, e.g. via a bundler's `?raw` import) to recover array-membership `on:begin` guards the compiled callback alone can't expose, and the returned object carries a `warnings: string[]` field (empty when clean) so you can detect a degraded conversion without reading the console.

```ts
const language = await fromHighlightJs("dotenv", defineDotenv, grammarSourceText);
if (language.warnings.length > 0) {
  console.error("dotenv degraded:", language.warnings);
}
```

If you're using TypeScript, use the `LanguageType` interface to type the language.

```ts
import type { LanguageType } from "svelte-highlight";
import { fromHighlightJs } from "svelte-highlight/compat";

const language: LanguageType<"dotenv"> = await fromHighlightJs(
  "dotenv",
  (hljs) => ({
    name: "dotenv",
    contains: [
      hljs.HASH_COMMENT_MODE,
      { className: "attr", begin: /[A-Za-z_][A-Za-z0-9_]*(?=[ \t]*=)/ },
    ],
  }),
);
```

Building a package for others to install? Ship the converted grammar directly instead of calling `fromHighlightJs` at runtime — see [`scripts/convert-grammars.ts`](scripts/convert-grammars.ts) for the converter this package's own bundled languages go through.

### Conversion fidelity

`fromHighlightJs` and [`scripts/convert-grammars.ts`](scripts/convert-grammars.ts) (the pipeline behind every one of the ~244 bundled `svelte-highlight/languages/*` grammars) share the exact same converter, so a custom grammar goes through identical logic to every shipped one, not a lesser path.

Most hljs grammars are plain-JSON `contains`/`begin`/`end`/`className` rules, which convert as-is. A grammar can also use `on:begin`, `on:end`, or `__beforeBegin` callbacks for cases regexes alone can't express; the converter recognizes six specific shapes and turns them into declarative flags:

- An `on:begin` callback that copies the matched text so the closing delimiter must equal the opening one (heredocs).
- An `on:begin` callback that only accepts a match at the very start of input (a shebang guard).
- An `on:begin` callback that disambiguates an opening tag from a generic comparison (JSX).
- An `on:begin` callback that checks the character immediately before the match (a letter-boundary guard).
- An `on:begin` callback checking `SOME_SET.has(match[0])` against a module-level word list — recovered only when you also pass the grammar's own source text as `fromHighlightJs`'s third argument, since the compiled callback alone doesn't expose the backing array.
- A `__beforeBegin` callback that rejects a match immediately following a `.` (hljs's `beginKeywords` dot-guard).

Any other `on:begin`/`on:end`/`__beforeBegin` body converts too, but with a `console.warn` and the rule's relevance forced to zero — it still matches, unconditionally, without skewing auto-detection. Check `language.warnings` (see above) to catch this without reading the console.

Upgrading a custom language written before 7.16? Before 7.16, a custom language was `{ name, register: (hljs) => modeObject }` passed synchronously straight to `<Highlight>`'s `language` prop. Since 7.16 replaced the highlight.js runtime with this package's own engine, `register` must be plain-JSON grammar IR instead, and `fromHighlightJs` (now async, requiring `{#await}`) is the replacement shown above.

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

Registering a grammar checks its canonical name, not an alias lookup, before skipping — so a grammar that aliases another (highlight.js's "ini" aliases "toml") can't make the real grammar look already-registered before it has actually loaded.

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

`loadLanguage` accepts a [supported language name](SUPPORTED_LANGUAGES.md), dynamically imports its grammar, and resolves with the language object. It rejects with a `LanguageLoadError` for an unrecognized name, so handle the `{:catch}` block (or `.catch`) when the name comes from untrusted input. `LanguageLoadError` is importable from `svelte-highlight` for an `instanceof` check:

```js
import { LanguageLoadError } from "svelte-highlight";

try {
  const grammar = await loadLanguage(name);
} catch (error) {
  if (error instanceof LanguageLoadError) {
    // handle a missing/misspelled language name
  }
}
```

Grammars with embedded sublanguages (`astro`, `svelte`, and others with a `dependencies` list) register their dependencies automatically — `Highlight`, `HighlightAuto`, and `HighlightSvelte` all call `ensureRegistered` on the language they're given, which registers the grammar and recurses through its dependencies.

`loadLanguage` does a fresh `import()` on every call and keeps no explicit cache, but it's safe to call repeatedly for the same name: module loaders dedupe dynamic imports by resolved specifier rather than re-fetching, so repeated calls resolve to the same cached module.

> **Note:** Because the imported name is dynamic, the bundler cannot prune unused grammars and will emit a chunk for every language — all 279 shipped grammars. Prefer a static `import` when the language is known ahead of time, and reach for `loadLanguage` only when it is not.

A practical case is rendering Markdown, where each fenced block declares its own language — see "[Rendering Markdown/MDX fences](#rendering-markdownmdx-fences)" below for a ready-made `highlightFence` helper built on top of `loadLanguage`.

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
- `langtag`, if set, is a bare flag or a static boolean literal (`langtag={true}`/`langtag={false}`) - not a variable or expression. Static output can't pull in `langtag.css` (that only happens when a runtime `LangTag` is in the bundle), so a truthy `langtag` renders the language badge as a plain inline-styled `<span>` instead, themed with the same `--langtag-*` custom properties `LangTag` reads - customization is limited to those variables, not `LangTag`'s slot content.

Dynamic `code` or `language`, `loadLanguage`, `HighlightAuto`, `HighlightSvelte`, and `HighlightEditable` keep the runtime component. No warning. That's intentional.

If a usage looks static but still fails (language module missing, `highlight.js` throws), it falls back to the runtime component and calls `onWarn`. Usually that's a typo or a resolution quirk, not a dynamic usage you meant to keep:

```js
highlightStatic({
  onWarn(message, { filename, line, cause }) {
    // defaults to `console.warn(`[svelte-highlight/static] ${filename}:${line} - ${message}`)`
  },
});
```

To measure how many `<Highlight>` usages a build actually converted to static markup, pass `onSummary`. It fires once per file with at least one shape-matched usage (files with none don't trigger it), so summing across calls gives a build-wide total:

```js
let matched = 0;
let succeeded = 0;

highlightStatic({
  onSummary(summary) {
    matched += summary.matched;
    succeeded += summary.succeeded;
  },
});
```

Scope is small on purpose. Extra props on `<Highlight>` don't carry over to the emitted `<pre>`. Unused `Highlight` and language imports are left in place; bundlers drop them (`sideEffects` in `package.json` is narrow enough).

### Rendering Markdown/MDX fences

`highlightStatic` only transforms literal `<Highlight>` usages in `.svelte` files. Markdown/MDX/mdsvex code fences never go through the Svelte compiler at all, so `svelte-highlight/fence` provides a separate, framework-agnostic building block: `parseMeta(meta)` and `highlightFence({ code, lang, meta })`, a plain async function with zero Svelte dependency.

```js
import { highlightFence } from "svelte-highlight/fence";

const html = await highlightFence({
  code: 'const add = (a, b) => a + b;\nconst sub = (a, b) => a - b;\nexport { add, sub };',
  lang: "typescript",
  meta: '{1,3-5} title="app.ts"',
});
```

`lang` accepts either the grammar's canonical file name or a known alias (e.g. `"ts"`, `"sh"`) -- `highlightFence` resolves it internally via `resolveLanguageName`, and rejects with `LanguageLoadError` when neither resolves. `meta` is the Expressive Code/Shiki-style vocabulary standardized on by tools like Astro, Starlight, and rehype-pretty-code: a bare `{1,3-5}` or `mark={1,3-5}` marks lines, `ins={...}`/`del={...}` mark insertions/deletions, `title="..."` sets a title, and `showLineNumbers` is a bare flag. The output wraps each line in `<span class="line" data-line-state="mark|ins|del">` (only when a state applies) inside a `<pre class="hljs" data-language="...">`, so a `mark`/`ins`/`del`-aware stylesheet can target `[data-line-state]` the same way it would target Expressive Code or Shiki output.

Call `resolveLanguageName` directly when you need the canonical name ahead of `highlightFence` -- e.g. to pick a display label, or to call `loadLanguage`/`<Highlight>` yourself instead:

```js
import { resolveLanguageName } from "svelte-highlight/fence";

resolveLanguageName("ts"); // "typescript"
resolveLanguageName("nope"); // undefined
```

It trims, lowercases, and reads only the first word, so passing a whole info string (`resolveLanguageName("ts title=\"app.ts\"")`) works too. The alias table it reads from is also importable directly, as `svelte-highlight/languages/aliases` (`LANGUAGE_ALIASES: Readonly<Record<string, string>>`), for consumers that want the raw alias -> canonical mapping without going through `resolveLanguageName`.

**mdsvex.** Wire `highlightFence` into `highlight.highlighter`, whose signature is `(code, lang, meta) => string | Promise<string>`:

```js
// mdsvex.config.js
import { highlightFence } from "svelte-highlight/fence";

/** @type {import("mdsvex").MdsvexOptions} */
const config = {
  highlight: {
    highlighter: (code, lang, meta) => highlightFence({ code, lang, meta }),
  },
};

export default config;
```

**markdown-it.** Wire it into the `highlight` constructor option, whose signature is `(str, lang, attrs) => string` — markdown-it inserts the returned string verbatim (no further escaping), and `highlight` isn't allowed to be `async`, so pre-render fences you know about or fall back to a sync path for the rest:

```js
import MarkdownIt from "markdown-it";
import { highlightFence } from "svelte-highlight/fence";

const md = new MarkdownIt({
  highlight(str, lang, attrs) {
    // highlightFence is async; markdown-it's highlight isn't, so either
    // pre-highlight fences in a separate async pass before render() and
    // look the result up here, or fall back to escaped plain text.
    return md.utils.escapeHtml(str);
  },
});
```

**rehype.** `rehype`/`unist-util-visit` are the consumer's dependencies, not this package's. A rehype plugin walks the hast tree *after* `remark-rehype` has already converted fenced code to `<pre><code class="language-*">` — the fence's `meta` string isn't part of that hast by default, only `lang` (via the `language-*` class), so pass `meta` through only if an earlier remark step attached it (e.g. `node.data.hProperties["data-meta"] = mdastNode.meta`):

```js
import { visit } from "unist-util-visit";
import { highlightFence } from "svelte-highlight/fence";

function rehypeHighlightFence() {
  return async (tree) => {
    const nodes = [];
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || parent === undefined || index === undefined) return;
      const code = node.children.find((child) => child.tagName === "code");
      if (code) nodes.push({ node, index, parent, code });
    });

    for (const { node, index, parent, code } of nodes) {
      const lang = code.properties?.className
        ?.map(String)
        .find((c) => c.startsWith("language-"))
        ?.slice("language-".length);
      if (!lang) continue;

      const html = await highlightFence({
        code: code.children.map((c) => (c.type === "text" ? c.value : "")).join(""),
        lang,
        meta: code.properties?.["data-meta"],
      });
      parent.children[index] = { type: "raw", value: html };
    }
  };
}
```

## Action

Use the `highlight` action to highlight existing `<pre><code>` markup in place. This is useful for progressively enhancing server-rendered content (e.g. markdown) without swapping in a component.

Place `use:highlight` on the `<code>` element inside a `<pre>`, matching the theme CSS's `.hljs code` selector -- elsewhere (directly on `<pre>`, or a non-`<pre><code>` element) it still highlights but may not be visually targeted by the active theme.

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

`language` is also optional: when omitted, the action reads a `language-xxx` class off its own node (the Prism/highlight.js Markdown convention) and resolves it via `loadLanguage`, so server-rendered Markdown output needs no per-block `language` prop. With no matching class, it warns in dev and dispatches `error`.

```svelte
<pre><code class="language-typescript" use:highlight>const add = (a, b) => a + b;</code></pre>
```

### Dispatched Events

The action dispatches `highlighted` (`detail: { html, language }`) on success and `error` (`detail: { error }`) on failure, on the node it's placed on.

```svelte
<pre><code
  use:highlight={{ language: typescript, code }}
  on:highlighted={(e) => console.log(e.detail.html, e.detail.language)}
  on:error={(e) => console.error(e.detail.error)}
></code></pre>
```

`highlighted` is also a composition hook for a sibling `LineNumbers`: `on:highlighted={(e) => (highlighted = e.detail.html)}` feeding `<LineNumbers {highlighted} languageName={typescript.name} />`.

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

Control the pacing curve with `easing`: a function mapping elapsed-time fraction (`0`-`1`) to revealed-fraction (`0`-`1`). It defaults to `linear`; import a named curve or pass your own. Total typing duration is always `speed` × character count, no matter the curve -- only the pacing within that duration changes.

```svelte
<script>
  import Highlight, { Typewriter, easeOutCubic } from "svelte-highlight";
</script>

<Highlight language={typescript} {code} let:highlighted>
  <Typewriter {highlighted} easing={easeOutCubic} />
</Highlight>
```

Named curves: `linear` (default), `easeInQuad`/`easeOutQuad`/`easeInOutQuad`, `easeInCubic`/`easeOutCubic`/`easeInOutCubic`, `easeInSine`/`easeOutSine`/`easeInOutSine`.

Set `speed={0}` to reveal all content on the very first frame -- a documented "skip typing" escape hatch, useful for a "skip" button or for finishing an off-screen instance instantly.

By default `granularity="char"` reveals one character at a time. Set `granularity="word"` to reveal a full word per step instead -- a ChatGPT-style token-by-token reveal. Total typing duration and `easing` are unaffected either way; only which character counts `revealed` may land on changes.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <Typewriter {highlighted} granularity="word" />
</Highlight>
```

Fire `on:progress` for a progress bar or "X% typed" indicator -- it dispatches `{ revealed, total }` (visible-character counts) whenever `revealed` advances. `revealed` and `total` are also exposed for `bind:revealed`/`bind:total`, though both are read-only in practice: the component overwrites them every frame.

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <Typewriter
    {highlighted}
    bind:revealed
    bind:total
    on:progress={(e) => console.log(`${e.detail.revealed}/${e.detail.total}`)}
  />
</Highlight>
```

`Typewriter` doesn't gate itself on `prefers-reduced-motion` -- if you want to honor it, check `matchMedia("(prefers-reduced-motion: reduce)")` yourself and skip rendering `Typewriter` (or set a very low `speed`). Customize the caret with `--caret-width`, `--caret-height`, `--caret-gap`, `--caret-color`, and `--caret-blink`.


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

`code` doesn't have to only grow by appending -- an edit to already-streamed text (an LLM regenerating an earlier paragraph, say) is handled incrementally too, via `StreamSession#replace()` under the hood, instead of discarding the session and re-tokenizing the whole buffer from scratch.

A blinking caret marks the end of output while `!done`; setting `done` hides it and performs one final full highlight, so the finished output matches what `Highlight` would render for the same code. `on:done` fires right after that final highlight. Customize the caret with the same `--caret-width`, `--caret-height`, `--caret-gap`, `--caret-color`, and `--caret-blink` variables as `Typewriter`.

A blinking caret is a purely visual cue, so the root element also carries `aria-busy` while `!done`, and a visually-hidden, polite live region announces `doneText` (default `"Code finished streaming"`) once `done` flips to `true` -- screen reader users get the same "still streaming" / "finished" signal sighted users get from the caret. Set `doneText` to `""` to disable the announcement.

Set `autoScroll` to keep the container pinned to the bottom as output grows -- it stops auto-scrolling as soon as you scroll up, and resumes once you scroll back to the bottom.

```svelte
<HighlightStream language={typescript} {code} {done} autoScroll style="max-height: 20em; overflow-y: auto;" />
```

Per-chunk work is O(tail), not O(stream length so far): finished output is sealed into immutable chunks the DOM never re-diffs, so a response that's ten times longer doesn't cost ten times more per repaint. DOM updates stay proportional to the changed lines -- fine for chat-sized output up to very long responses, but every line ever streamed still stays in the DOM; for a stream that runs long enough to *scroll* through, set `virtualize` to bound that too.

```svelte
<HighlightStream language={typescript} {code} {done} virtualize style="height: 20em;" />
```

`virtualize` renders only the lines within the scrolled viewport (plus `overscan`), the same windowing `HighlightVirtual` does for static documents -- a stream that runs to tens of thousands of lines still costs a couple dozen DOM nodes. It swaps the sealed-chunk session for `TokenizedDocument` (see [Large documents](#large-documents) below), so output always reflects the streaming (non-canonicalized) parse, even once `done` -- unlike the default mode, which upgrades to a canonical final render. `on:highlight` isn't dispatched in this mode, since materializing the full HTML on every repaint would defeat the point of windowing; `on:done`, the caret, and `autoScroll` all keep working. `on:windowchange` fires with `{ start, end, lineCount }` whenever the rendered window moves, so you can show something like "lines *N*-*M* of *T*" without counting DOM nodes yourself. Row math assumes one line per fixed-height row, so `virtualize` can't wrap lines -- it always renders with `white-space: pre`, overriding any `white-space` you pass through `$$restProps`. `bind:this`, then call `scrollToLine(line)` to scroll a given line into view -- works in both `virtualize` and default modes.

### Streaming Markdown with multiple fences

`HighlightStream` highlights a single growing code buffer, but LLM chat output is Markdown: prose interleaved with several fenced code blocks, each in its own language. `svelte-highlight/fence`'s `createFenceSplitter` (see "[Rendering Markdown/MDX fences](#rendering-markdownmdx-fences)" above) turns that growing Markdown string into prose and fence segments, so you can drive one `HighlightStream` per fence as it streams in:

```svelte
<script>
  import { HighlightStream, loadLanguage } from "svelte-highlight";
  import { createFenceSplitter } from "svelte-highlight/fence";
  import github from "svelte-highlight/styles/github";

  const splitter = createFenceSplitter();
  let segments = splitter.segments();
  let done = false;

  // Wire this up to your streaming source (fetch, WebSocket, SSE, ...).
  async function stream() {
    for (const chunk of chunks) {
      splitter.append(chunk);
      segments = splitter.segments();
      await new Promise((r) => setTimeout(r, 30));
    }
    done = true;
  }
</script>

<svelte:head>
  {@html github}
</svelte:head>

{#each segments as segment (segment.id)}
  {#if segment.kind === "text"}
    <p style="white-space: pre-wrap">{segment.text}</p>
  {:else}
    {#await loadLanguage(segment.lang ?? "plaintext") then grammar}
      <HighlightStream language={grammar} code={segment.code} done={!segment.open} />
    {/await}
  {/if}
{/each}
```

Every segment's `id` is stable across both `append` (growing the buffer) and a full `set` (a regenerated buffer, keyed by common prefix) for everything before the first change, so the keyed `{#each}` never re-mounts a fence's `HighlightStream` just because more text arrived elsewhere in the document -- only the segment that actually changed gets a new instance. A `MarkdownStream` component that wraps this pattern is a separate deliverable; `createFenceSplitter` is the headless primitive underneath it.

## Large documents

`HighlightVirtual` renders only the visible lines of a huge document (plus a small overscan margin) inside its own scroll container -- a 100k-line file costs a couple dozen DOM line nodes, not one per line. It exploits the same engine checkpoint/resume primitive `HighlightStream` uses for streaming, but for *random-access* windows into a static document instead of a growing tail.

```svelte
<script>
  import { HighlightVirtual } from "svelte-highlight";
  import json from "svelte-highlight/languages/json";
  import atomOneDark from "svelte-highlight/styles/atom-one-dark";
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<HighlightVirtual language={json} code={hugeLogDump} style="height: 480px" />
```

The rendered `<pre>` is the scroll container itself -- size it with `style`/`class`/`$$restProps`, same as `Highlight`, but `white-space` can't be overridden this way: it's pinned to `pre` because the windowing math depends on a uniform line height. Content doesn't wrap (uniform line height is a v1 constraint, measured once from a rendered probe line). `overscan` (default `12`) controls how many extra lines render above/below the viewport; `checkpointInterval` (default `100`) controls how often the engine snapshots its parse state, trading a little memory for cheaper random access. Concretely, memory scales with `document lines / checkpointInterval` retained checkpoints, each holding a full engine snapshot plus open-scope/pending-HTML state -- and checkpoints are never evicted: they're retained for the entire lifetime of the `TokenizedDocument` instance, across any number of `append()` calls, until a `setCode()` call with unrelated content triggers a full reset. This is fine for the target "huge static document" use case, since checkpoints are bounded by that one document's size, but worth knowing for a long-lived instance that's repeatedly `setCode()`-reset with genuinely new documents rather than recreated. A consumer worried about retained memory can call `doc.checkpointCount()` directly rather than estimating it from `lineCount()`/`checkpointInterval`. Server-rendered output is the full document as plain escaped text (predictable cost for huge documents); the windowed, highlighted view takes over after hydration. In practice this means every page load flashes from unstyled monochrome text to highlighted, windowed content right after hydration, with no fade -- unlike `HighlightStream`'s default (non-`virtualize`) mode, which SSRs already-highlighted HTML. Nothing here requires a component change to soften today: since the container already needs an explicit size (`style`/`class`/`$$restProps`, above), reserving that same `min-height`/`height` up front prevents layout shift, and a CSS transition keyed off a `data-hydrated` attribute or class toggle you set yourself -- e.g. in `onMount` on a wrapping element -- can fade the flash instead of leaving it instant.

`on:windowchange` fires with `{ start, end, lineCount }` whenever the rendered window moves, so you can show something like "lines *N*-*M* of *T*" without counting DOM nodes yourself. `bind:this`, then call `scrollToLine(line)` to scroll a given line into view -- useful for a "jump to line" control -- without guessing at the line height yourself.

For custom virtualization, servers, or tests, `svelte-highlight/tokenized-document` exposes the same windowing primitive headlessly:

```js
import { createTokenizedDocument } from "svelte-highlight/tokenized-document";
import typescript from "svelte-highlight/languages/typescript";

const doc = createTokenizedDocument({ language: typescript });
doc.setCode(bigFile);
doc.lineCount(); // cheap -- never triggers tokenization
doc.lineRange(50_000, 50_040); // 40 highlighted lines in O(window + interval)
doc.append(moreCode); // streaming growth, no re-tokenization
```

`Typewriter`'s tokenizer is available the same way, for a custom reveal UI or non-DOM use: `svelte-highlight/typewriter-units` exposes `tokenizeTypewriter`, `buildUnitMarkup`, `createTypewriterSplitter`, and `computeWordBoundaries` headlessly.

```js
import {
  computeWordBoundaries,
  tokenizeTypewriter,
} from "svelte-highlight/typewriter-units";

const units = tokenizeTypewriter(highlighted);
const wordBoundaries = computeWordBoundaries(units); // for word-by-word reveal
```

`lineRange` tokenizes lazily and caches the most recently resolved window, so scrolling through even a huge document only ever pays for the lines actually requested. Its output matches `HighlightStream`'s live (non-canonicalized) parse: constructs needing multi-line lookahead across a window's edge can render slightly differently than `registry.highlight()`'s canonical output, the same tradeoff streaming already makes. `TokenizedDocument` doesn't support mid-document edits -- `append` and full `setCode` resets only. For a bounded, editable document (not a windowed/virtualized one), `HighlightEditable` solves mid-document editing, built on its own checkpoint-resume re-tokenizer (`src/incremental-tokenize.js`, not itself a public export). The two aren't unified today -- there's no single primitive yet for a document that's both editable and virtualized.

### Without virtualization

For documents in the low thousands to tens of thousands of lines (roughly 2,000-20,000), `HighlightVirtual`'s hard constraints -- no wrapping, an SSR-to-hydration flash, a fixed-height v1 container -- may not be worth taking on. The CSS [`content-visibility: auto`](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility) property gets you a native-scrolling, cheap-to-render alternative built entirely from already-public APIs, at the cost of the DOM-node count `HighlightVirtual` avoids:

```svelte
<script>
  import { createRegistry, registerAll, tokenLines } from "svelte-highlight/engine";
  import typescript from "svelte-highlight/languages/typescript";

  const registry = createRegistry();
  registerAll(registry, typescript);

  export let code;
  const { events } = registry.highlight(code, { language: "typescript" });
  const lines = tokenLines(events); // [[{ text, scopes }, …], …]

  function scopeClass(scope) {
    return scope
      .split(".")
      .map((piece) => `hljs-${piece}`)
      .join(" ");
  }
</script>

<div class="hljs" style="content-visibility: auto; contain-intrinsic-size: auto 1000px;">
  {#each lines as line}
    <div style="white-space: pre; content-visibility: auto; contain-intrinsic-size: auto 20px;">
      {#each line as token}<span class={token.scopes.map(scopeClass).join(" ")}>{token.text}</span>{/each}
    </div>
  {/each}
</div>
```

Each line is its own block-level `<div>`, not a row in a `<table>`/`<tr>` (the way `LineNumbers` renders) -- `content-visibility` doesn't apply to table-internal display types, so off-screen table rows never get the skip. Off-screen `<div>` lines do: the browser skips layout/paint/style for them, using `contain-intrinsic-size` as a placeholder size until they scroll near the viewport. Unlike `HighlightVirtual`, this is a progressive enhancement, not a hard requirement -- browsers without `content-visibility` support just render every line normally, and you get native text selection, find-in-page, and line wrapping for free (drop the `white-space: pre` on each line's `<div>` to allow it).

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

Malformed or unsupported escape sequences are dropped. Nothing throws. OSC 8 hyperlinks only render as links for `http:`, `https:`, and `mailto:` URIs; any other scheme renders as plain text. `parseAnsi` is one-shot and drops a trailing unterminated sequence, so for streamed output accumulate the full text and re-parse it rather than calling it once per chunk.

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

### Wrapping long lines

`AnsiOutput` never wraps by default -- long lines scroll horizontally. Set `wrap` to wrap them instead:

```svelte
<AnsiOutput {text} wrap />
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

`active` is reconciled whenever `files` changes: an unknown or stale value (including a `bind:active` set before `files` loads) falls back to `files[0]`; removing the active file selects its former neighbor (same index, clamped to the new length), like closing a tab in an editor; an empty `files` array sets `active` to `undefined` and the tab panel omits `aria-labelledby`. `on:change` fires once whenever this reconciliation actually changes `active`.

When the tab strip overflows, its overflowing edge fades to signal there's more to scroll to; changing `active` (by click, keyboard, or `bind:active`) scrolls that tab into view.

The active tab's `--tab-active-color` and `--tab-active-background` are resolved from the highlighted code's computed style after mount, so they render as `inherit`/`transparent` on first paint; for an SSR-critical, above-the-fold tab strip, set `--tab-active-background` and `--tab-active-color` yourself to avoid a flash before hydration.

## Component API

### `Highlight`

#### Props

| Name     | Type                                           | Default value  |
| :------- | :--------------------------------------------- | :------------- |
| code     | `any`                                          | N/A (required) |
| language | { name: `string`; register: `object` } | N/A (required) |
| langtag  | `boolean`                                      | `false`        |
| wrap     | `boolean`                                      | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

#### Dispatched Events

- **on:highlight**: fired after `code` is highlighted, once per change (not on unrelated re-renders), including when the result is empty (empty `code`)

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

    /**
     * The scope-event stream behind `highlighted`. See "Headless usage"
     * below for consuming it directly (tokenLines, toRanges, custom
     * renderers) instead of re-parsing the HTML.
     */
    console.log(e.detail.events);
  }}
/>
```

### `HighlightStyle`

#### Props

| Name       | Type                    | Default value            |
| :--------- | :---------------------- | :------------------------ |
| theme      | `string \| ThemePalette` | N/A                       |
| light      | `string \| ThemePalette` | N/A                       |
| dark       | `string \| ThemePalette` | N/A                       |
| mode       | `"auto" \| "light" \| "dark" \| string` | `"auto"`   |
| scopeClass | `string`                | hash of `theme`           |
| nonce      | `string`                | N/A                       |

The default slot exposes `{ scopeClass }`. `$$restProps` are forwarded to the top-level `div` element.

### `LineNumbers`

#### Props

| Name               | Type                                                        | Default value                       |
| :----------------- | :---------------------------------------------------------- | :----------------------------------- |
| highlighted        | `string`                                                     | N/A (required unless `lines` is set) |
| lines              | `string[]`                                                   | `undefined`                          |
| lineCount          | `number`                                                     | `undefined`                          |
| hideBorder         | `boolean`                                                    | `false`                              |
| wrapLines          | `boolean`                                                    | `false`                              |
| startingLineNumber | `number`                                                     | `1`                                  |
| highlightedLines   | `number[]`                                                   | `[]`                                 |
| lineStates         | `Record<number, "highlighted" \| "focus" \| "added" \| "removed">` | `{}`                           |
| langtag            | `boolean`                                                    | `false`                              |
| languageName       | `string`                                                     | `"plaintext"`                        |

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
| wrap         | `boolean` | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

### `HighlightSvelte`

#### Props

| Name    | Type      | Default value  |
| :------ | :-------- | :------------- |
| code    | `any`     | N/A (required) |
| langtag | `boolean` | `false`        |
| wrap    | `boolean` | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

#### Dispatched Events

- **on:highlight**: fired after `code` is highlighted, once per change (not on unrelated re-renders), including when the result is empty (empty `code`)

```svelte
<HighlightSvelte
  {code}
  on:highlight={(e) => {
    /**
     * The highlighted HTML as a string.
     * @example "<span>...</span>"
     */
    console.log(e.detail.highlighted);

    /** The scope-event stream behind `highlighted`. See "Headless usage" below. */
    console.log(e.detail.events);
  }}
/>
```

### `HighlightAuto`

#### Props

| Name          | Type             | Default value  |
| :------------ | :--------------- | :------------- |
| code          | `any`            | N/A (required) |
| languageNames | `LanguageName[]` | `undefined`    |
| langtag       | `boolean`        | `false`        |
| wrap          | `boolean`        | `false`        |

`$$restProps` are forwarded to the top-level `pre` element.

**Note:** `LanguageName` is a union type of all supported language names, providing autocomplete and type safety. You can import it from `svelte-highlight`:

```ts
import type { LanguageName } from "svelte-highlight";
```

#### Dispatched Events

- **on:highlight**: fired after `code` is highlighted, once per change (not on unrelated re-renders), including when the result is empty (empty `code`, or no candidate language matches)

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

    /** The scope-event stream behind `highlighted`. See "Headless usage" below. */
    console.log(e.detail.events);

    /**
     * The runner-up candidate and its relevance, for surfacing detection
     * confidence. `undefined` when no other candidate scored above zero.
     * @example { language: "typescript", relevance: 6 }
     */
    console.log(e.detail.secondBest);
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
| readonly     | `boolean`                                      | `false`        |

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

| Name               | Type                                    | Default value  |
| :----------------- | :-------------------------------------- | :------------- |
| code               | `string`                                | `""`           |
| language           | { name: `string`; register: `object` }  | N/A (required) |
| done               | `boolean`                               | `false`        |
| caret              | `boolean`                               | `true`         |
| autoScroll         | `boolean`                               | `false`        |
| virtualize         | `boolean`                               | `false`        |
| overscan           | `number`                                | `12`           |
| checkpointInterval | `number`                                | `100`          |
| doneText           | `string`                                | `"Code finished streaming"` |

`$$restProps` are forwarded to the top-level `pre` element. `overscan` and `checkpointInterval` only apply when `virtualize` is set. `doneText` is announced by a visually-hidden live region once `done` becomes `true`; set it to `""` to disable the announcement.

#### Methods

Use `bind:this`, then call `scrollToLine(line)` -- works in both `virtualize` and default modes.

#### Dispatched Events

- **on:highlight**: fired after each highlight pass, with `{ highlighted }` -- not dispatched when `virtualize` is set
- **on:done**: fired after the final full highlight once `done` is set
- **on:windowchange**: fired with `{ start, end, lineCount }` whenever the rendered window moves -- only dispatched when `virtualize` is set

```svelte
<HighlightStream
  language={typescript}
  {code}
  {done}
  on:highlight={(e) => console.log(e.detail.highlighted)}
  on:done={() => console.log("stream finished")}
/>
```

### `HighlightVirtual`

#### Props

| Name              | Type                                           | Default value  |
| :---------------- | :--------------------------------------------- | :------------- |
| code               | `any`                                          | N/A (required) |
| language           | { name: `string`; register: `object` } | N/A (required) |
| overscan           | `number`                                       | `12`           |
| checkpointInterval | `number`                                       | `100`          |

`$$restProps` are forwarded to the top-level `pre` element (the scroll container -- size it with `style`/`class`, but `white-space` is pinned to `pre` and can't be overridden this way).

#### Methods

Use `bind:this`, then call `scrollToLine(line)`.

#### Dispatched Events

- **on:windowchange**: fired whenever the rendered window changes, with `{ start, end, lineCount }`

```svelte
<HighlightVirtual language={json} code={hugeLogDump} style="height: 480px" />
```

See [Large documents](#large-documents) above.

### `FileTabs`

#### Props

| Name   | Type       | Default value  |
| :----- | :--------- | :------------- |
| files  | `string[]` | N/A (required) |
| active | `string`   | `files[0]`     |

`$$restProps` are forwarded to the top-level `div` element. `active` supports `bind:active` and is reconciled against `files`: an unknown value falls back to `files[0]`, removing the active file selects its former neighbor, and an empty `files` array sets `active` to `undefined`.

#### Dispatched Events

- **on:change**: fired when the user picks a tab, with `{ active }`

```svelte
<FileTabs {files} on:change={(e) => console.log(e.detail.active)} let:active>
  <Highlight language={sources[active].language} code={sources[active].code} />
</FileTabs>
```

### `Typewriter`

#### Props

| Name        | Type                     | Default value |
| :---------- | :----------------------- | :------------ |
| highlighted | `string`                 | `""`          |
| speed       | `number`                 | `30`          |
| play        | `boolean`                | `true`        |
| easing      | `(t: number) => number`  | `linear`      |
| granularity | `"char" \| "word"`       | `"char"`      |
| revealed    | `number`                 | `0`           |
| total       | `number`                 | `0`           |

`$$restProps` are forwarded to the top-level `pre` element. `revealed`/`total` are read-only in practice (overwritten every frame) but exposed for `bind:revealed`/`bind:total`.

#### Dispatched Events

- **on:done**: fires when typing finishes
- **on:progress**: fires whenever `revealed` advances, with `{ revealed, total }`

```svelte
<Highlight language={typescript} {code} let:highlighted>
  <Typewriter {highlighted} on:done={() => console.log("revealed")} />
</Highlight>
```

## Headless usage

The highlighting engine's output is a flat scope-event stream (`ScopeEvent[]`): a sequence of `TEXT`/`OPEN`/`CLOSE` events that `renderHtml`, `toRanges`, and `tokenLines` each render differently. Every `<Highlight>`-family component exposes this stream (as `events`, in the default slot and the `highlight` event detail — see [Component API](#component-api) above), and `svelte-highlight/engine` + `svelte-highlight/registry` expose it directly, so highlighting can be consumed headlessly: server routes, build pipelines, tests, or any non-component context. `svelte-highlight/engine` has zero Svelte dependency and works in any JS runtime.

### Zero-bundler usage from a CDN

`svelte-highlight/engine` has no `import` statements of its own, so it — and any generated language grammar — can be loaded straight from a CDN like [esm.sh](https://esm.sh), with no bundler, build step, or Svelte in the loop:

```html
<script type="module">
  import { createRegistry, registerAll, renderHtml } from "https://esm.sh/svelte-highlight/engine";
  import typescript from "https://esm.sh/svelte-highlight/languages/typescript";

  const registry = createRegistry();
  registerAll(registry, typescript);

  const { events } = registry.tokenize("const greeting: string = 'hi';", "typescript");
  document.querySelector("pre").innerHTML = renderHtml(events);
</script>
```

See it as a complete page in [examples/cdn](examples/cdn).

### Stability tiers

- **Stable, semver-governed:** `ScopeEvent`, `TEXT`/`OPEN`/`CLOSE`, `TokenRange`, `HighlightResult`, `LineToken`, `Renderer`, `renderHtml`, `toRanges`, `extendLines`, `tokenLines`, `escapeHtml`, `createHtmlRenderer`, `createRangeRenderer`, `createLineRenderer`, `Registry` and its methods, `createRegistry`, `registerAll`, `StreamSession`, `TokenizedDocument`, `createTokenizedDocument`, `TextSegment`, `FenceSegment`, `MarkdownSegment`, `FenceSplitter`, `createFenceSplitter`, `UnknownLanguageError`, `TokenizerLoopError`. `Snapshot` is a serializable format that round-trips within one library version, but is **not** guaranteed stable across versions — a snapshot from an older release may be rejected on resume. The same caveat applies to `TokenizedDocument`: its method surface (`setCode`/`append`/`lineCount`/`lineRange`/`tokenizedThrough`/`checkpointCount`) is stable and semver-governed, but internally it resumes from `Snapshot`s the same way `StreamSession` does, so anything that tried to serialize and later resume a `TokenizedDocument`'s internal state directly would hit the same cross-version instability -- the public API doesn't expose that today.
- **Generated data, versioned with the library:** `GrammarIR`/`GrammarState`. These come from the build pipeline and are consumed by `registerAll`; treat them as opaque payloads whose field-level structure may change in any minor release. Always load grammars from the same package version as the engine.
- **Experimental, may change in a minor release:** `createWorkerHighlighter`, `serveHighlighter`, `PostMessageTarget`, `WorkerHighlighter`, `WorkerSession`, `ServeHighlighterOptions` (`svelte-highlight/worker`). The wire protocol between the two halves is not part of the public contract — only the documented function behavior is.

### Headless highlighting, isolated registry

Use `createRegistry()` when you want an instance isolated from the components' shared registry (SSR request isolation, tests):

```js
import { createRegistry, registerAll, renderHtml, tokenLines } from "svelte-highlight/engine";
import typescript from "svelte-highlight/languages/typescript";

const registry = createRegistry();
registerAll(registry, typescript);

const { events, value } = registry.highlight(code, { language: "typescript" });
// value: same HTML the <Highlight> component renders
// events: the scope-event stream — one tokenization, any number of consumers
const lines = tokenLines(events); // [[{ text: "const", scopes: ["keyword"] }, …], …]
```

### Joining the components' shared registry

Use `svelte-highlight/registry` when a language registered here should also be visible to `<Highlight>` (and vice versa):

```js
import { registry, ensureRegistered } from "svelte-highlight/registry";
import typescript from "svelte-highlight/languages/typescript";

ensureRegistered(typescript);
const ranges = registry.tokenizeRanges(code, { language: "typescript" });
```

### Streaming, headless

The same primitives `HighlightStream` uses:

```js
import { registry } from "svelte-highlight/registry";

const session = registry.createSession("typescript");
session.append(chunk); // repeat as chunks arrive
session.replace(from, to, text); // patch an earlier range without restarting
const snapshot = session.snapshot(); // JSON-serializable checkpoint
const { value } = session.finish();
```

### Highlighting in a Web Worker

`svelte-highlight/worker` is a headless pair — a worker-side handler and a main-thread client — for running the engine off the main thread. Both halves have zero Svelte dependency.

```js
// highlight.worker.js
import { serveHighlighter } from "svelte-highlight/worker";
serveHighlighter();
```

```js
import { createWorkerHighlighter } from "svelte-highlight/worker";

const highlighter = createWorkerHighlighter(
  typeof Worker !== "undefined"
    ? new Worker(new URL("./highlight.worker.js", import.meta.url), { type: "module" })
    : undefined,
);
```

An omitted (or falsy) `worker` runs the identical API in-process against `svelte-highlight/registry`'s shared singleton instead — the SSR/tests fallback, and why the construction above is a single ternary: the same code works whether or not `Worker` exists in the current environment.

```js
const { value } = await highlighter.highlight(code, "typescript");
const lines = await highlighter.tokenLines(code, "typescript");
```

Streaming works the same way as `registry.createSession`, just async:

```js
const session = highlighter.createSession("typescript");
await session.append(chunk); // repeat as chunks arrive
await session.replace(from, to, text); // patch an earlier range without restarting
const snapshot = await session.snapshot(); // JSON-serializable checkpoint
const { value } = await session.finish();
```

Grammars load lazily inside the worker, per language, the first time each is seen. `HighlightStream` can't yet consume a remote, worker-backed session — its incremental rendering assumes a same-thread `StreamSession` — so streaming highlight results back into a component still requires posting the resolved HTML/events yourself. `terminate()` tears down the underlying `Worker` (a no-op in local mode).

### Reaching the stream from a component — no HTML re-parsing

```svelte
<Highlight language={typescript} {code} let:highlighted let:events>
  <pre><code>{@html highlighted}</code></pre>
  <TokenMinimap {events} />
</Highlight>

<Highlight language={typescript} {code} on:highlight={(e) => analyze(e.detail.events)} />
```

### A third-party render target

`Renderer<Out>` names the contract that `renderHtml`, `toRanges`, and `tokenLines` (via `createHtmlRenderer`, `createRangeRenderer`, `createLineRenderer`) all conform to — implement it to plug a custom render target into the same pipeline:

```js
import { TEXT, OPEN, CLOSE } from "svelte-highlight/engine";

/** @type {import("svelte-highlight/engine").Renderer<MyOutput>} */
const myRenderer = {
  render(events) {
    for (const ev of events) {
      if (ev.t === TEXT) {
        /* ev.v */
      } else if (ev.t === OPEN) {
        /* ev.s */
      } else {
        /* CLOSE */
      }
    }
    return out;
  },
};
```

### Errors

- **`UnknownLanguageError`** (`{ language }`): thrown by `tokenize`, `highlight`, `tokenizeRanges`, and `createSession` when `language` isn't registered.
- **`TokenizerLoopError`** (`{ grammarName, iterations }`): thrown once a parse exceeds 500,000 tokenizer iterations, guarding against a grammar bug that never advances position.

Both are exported from `svelte-highlight/engine` and are distinct from `LanguageLoadError` (exported from `svelte-highlight` and `svelte-highlight/load-language`), which fires from a grammar module's *dynamic import* failure, not a registry lookup.

### `illegal` is enforced only during auto-detection

A grammar's `illegal` pattern only aborts `tokenizeAuto`/`highlightAuto`: a candidate whose text matches its own `illegal` pattern loses relevance scoring and is dropped from consideration. An explicit `tokenize`/`highlight`/`createSession` call never checks it, unlike hljs's own `ignoreIllegals: false` default, which throws on the same condition. This is deliberate: streamed or LLM-generated code is routinely "illegal" mid-stream — an unclosed string, a dangling `#` — and an explicit-language highlighter that could throw partway through a stream would be unusable for that case. For hljs-style strict validation, run `highlightAuto(code, [language])` instead.

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
- [examples/worker](examples/worker)

## [Changelog](CHANGELOG.md)

## License

[MIT](LICENSE)

Grammars and themes are derived from [highlight.js](https://github.com/highlightjs/highlight.js), used under its [BSD-3-Clause license](LICENSE.highlight.txt). The highlighting engine itself is original code under this package's MIT license — no highlight.js source is included in it.

[npm]: https://img.shields.io/npm/v/svelte-highlight.svg?style=for-the-badge&color=%23ff3e00
[npm-url]: https://npmjs.com/package/svelte-highlight
