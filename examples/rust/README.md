# examples/rust

> `svelte-highlight`'s engine in Rust, running the JavaScript engine in [QuickJS](https://github.com/DelSkayn/rquickjs).

The output is the reference engine's own, so it matches the web components exactly, and there is no port to keep in sync. It passes the whole conformance corpus in [`spec/corpus.json`](../../spec/corpus.json).

## Set-up

```sh
bun install
bun run bundle        # builds dist/engine.js: the engine and every grammar
cargo build --release
```

`src/main.rs` embeds `dist/engine.js` with `include_str!`, so build the bundle first.

## Usage

```sh
cargo run --release -- highlight src/main.rs rust      # the HTML <Highlight> renders
cargo run --release -- detect Cargo.toml               # toml (relevance 28)
cargo run --release -- conformance ../../spec/corpus.json
```

As a library, `Highlighter` in `src/lib.rs` has `tokenize`, `detect` and `html`:

```rust
let highlighter = Highlighter::new(include_str!("../dist/engine.js"))?;
let events = highlighter.tokenize("fn main() {}", "rust")?;
// [Open("keyword"), Text("fn"), Close, Text(" "), Open("title.function"), ...]
```

## Trade-offs

Loading the bundle takes about 0.2s, so create one `Highlighter` and reuse it. A native port would start faster, but it would need an ECMAScript regex engine such as `regress` and would have to track every engine change. [`spec/ENGINE.md`](../../spec/ENGINE.md) describes what such a port has to do.
