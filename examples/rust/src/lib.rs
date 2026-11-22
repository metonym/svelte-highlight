//! svelte-highlight's engine in Rust, by running the JavaScript engine in
//! QuickJS. Output is the reference engine's own, so it matches the web
//! components exactly. See `spec/ENGINE.md` in the repository.

use rquickjs::{Context, Function, Object, Runtime};
use serde::Deserialize;

/// One scope event, as in `spec/ENGINE.md`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Event {
    Text(String),
    Open(String),
    Close,
}

#[derive(Deserialize)]
struct RawEvent {
    t: u8,
    v: Option<String>,
    s: Option<String>,
}

impl From<RawEvent> for Event {
    fn from(raw: RawEvent) -> Self {
        match raw.t {
            0 => Event::Text(raw.v.unwrap_or_default()),
            1 => Event::Open(raw.s.unwrap_or_default()),
            _ => Event::Close,
        }
    }
}

/// An auto-detection result.
#[derive(Debug)]
pub struct Detected {
    pub language: Option<String>,
    pub relevance: f64,
    pub events: Vec<Event>,
}

#[derive(Deserialize)]
struct RawDetected {
    language: Option<String>,
    relevance: f64,
    events: Vec<RawEvent>,
}

pub type Error = Box<dyn std::error::Error>;

/// The engine with every bundled grammar, loaded from `dist/engine.js`.
pub struct Highlighter {
    _runtime: Runtime,
    context: Context,
}

impl Highlighter {
    /// Evaluates the bundle built by `bun run bundle`.
    pub fn new(bundle: &str) -> Result<Self, Error> {
        let runtime = Runtime::new()?;
        // Deeply nested grammars recurse; QuickJS's default stack is small.
        runtime.set_max_stack_size(64 * 1024 * 1024);
        let context = Context::full(&runtime)?;
        context.with(|ctx| ctx.eval::<(), _>(bundle))?;
        Ok(Self { _runtime: runtime, context })
    }

    fn call(&self, name: &str, args: (String, Option<String>)) -> Result<String, Error> {
        self.context.with(|ctx| {
            let api: Object = ctx.globals().get("svelteHighlight")?;
            let function: Function = api.get(name)?;
            let result: String = match args {
                (code, Some(language)) => function.call((code, language))?,
                (code, None) => function.call((code,))?,
            };
            Ok(result)
        })
    }

    /// Tokenizes `code` as `language`.
    pub fn tokenize(&self, code: &str, language: &str) -> Result<Vec<Event>, Error> {
        let json = self.call("tokenize", (code.into(), Some(language.into())))?;
        let raw: Vec<RawEvent> = serde_json::from_str(&json)?;
        Ok(raw.into_iter().map(Event::from).collect())
    }

    /// Picks the best language for `code` among every bundled one.
    pub fn detect(&self, code: &str) -> Result<Detected, Error> {
        let raw: RawDetected = serde_json::from_str(&self.call("detect", (code.into(), None))?)?;
        Ok(Detected {
            language: raw.language,
            relevance: raw.relevance,
            events: raw.events.into_iter().map(Event::from).collect(),
        })
    }

    /// The same HTML `<Highlight>` renders.
    pub fn html(&self, code: &str, language: &str) -> Result<String, Error> {
        self.call("html", (code.into(), Some(language.into())))
    }
}
