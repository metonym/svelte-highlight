# rollup

> Rollup example using [svelte-rollup-template](https://github.com/metonym/svelte-rollup-template).

## Getting Started

Install the project dependencies.

```bash
yarn install
```

## Available Scripts

### `yarn develop`

Runs the app in development mode with livereload enabled. Visit `http://localhost:3000` to view the app.

To configure the port number, modify the `port` value in [rollup.config.js](rollup.config.js#L48).

```diff
serve({
  contentBase: ['build'],
- port: 3000
+ port: 8080
})
```

### `yarn build`

Builds the app in production mode.

First, the `build/` folder is removed. Next, Rollup is run in production. Similar to development mode, the `public/` folder is first copied into `build/` before Rollup outputs the minified `bundle.css` and `bundle.js`.

Lastly, the [postbuild.js](postbuild.js) script runs a couple of [PostHTML](https://github.com/posthtml/posthtml) plugins on the static assets in `build/`.

The first plugin ([posthtml-hash](https://github.com/posthtml/posthtml-hash)) hashes `bundle.css` and `bundle.js`. The second plugin ([htmlnano](https://github.com/posthtml/htmlnano)) minifies `build/index.html`.

#### 1/2 Hashing Static Assets

```html
<!-- Result of `posthtml-hash` -->
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Svelte Rollup Template</title>
    <link rel="stylesheet" href="bundle.b19ea05c629cee24e7b1.css">
  </head>
  <body>
    <script src="bundle.d84688974c6150c07e5f.js"></script>
  </body>
</html>
```

#### 2/2 Minifying `build/index.html`

```html
<!-- Result of `htmlnano` -->
<!DOCTYPE html><html><head><meta charset="utf-8"><title>Svelte Rollup Template</title><link rel="stylesheet" href="bundle.b19ea05c629cee24e7b1.css"></head><body> <script src="bundle.d84688974c6150c07e5f.js"></script> </body></html>
```
