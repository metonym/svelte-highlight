# demo

> Live demo and documentation site for `svelte-highlight`

## Running locally

First, install and build `svelte-highlight` in the root directory of this project.

```sh
yarn && yarn prepack
```

Create a symlink and link the package in this folder:

```sh
yarn link
cd demo && yarn link "svelte-highlight"
```

Finally, run `yarn` in this folder.

## Available scripts

### `yarn dev`

Runs the app in development mode.

### `yarn build:local`

Builds the site with the static adapter for local previewing.
