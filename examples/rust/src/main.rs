//! Usage:
//!   cargo run --release -- highlight <file> <language>   prints HTML
//!   cargo run --release -- detect <file>                 prints the language
//!   cargo run --release -- conformance <corpus.json>     checks spec/corpus.json

use serde::Deserialize;
use serde_json::Value;
use svelte_highlight_rust::{Error, Event, Highlighter};

const BUNDLE: &str = include_str!("../dist/engine.js");

fn main() -> Result<(), Error> {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let highlighter = Highlighter::new(BUNDLE)?;
    match args.iter().map(String::as_str).collect::<Vec<_>>().as_slice() {
        ["highlight", file, language] => {
            let code = std::fs::read_to_string(file)?;
            println!("{}", highlighter.html(&code, language)?);
        }
        ["detect", file] => {
            let code = std::fs::read_to_string(file)?;
            let detected = highlighter.detect(&code)?;
            println!(
                "{} (relevance {})",
                detected.language.as_deref().unwrap_or("none"),
                detected.relevance
            );
        }
        ["conformance", corpus] => conformance(&highlighter, corpus)?,
        _ => {
            eprintln!("usage: highlight <file> <language> | detect <file> | conformance <corpus.json>");
            std::process::exit(2);
        }
    }
    Ok(())
}

#[derive(Deserialize)]
struct Corpus {
    tokenize: Vec<TokenizeCase>,
    detect: Vec<DetectCase>,
}

#[derive(Deserialize)]
struct TokenizeCase {
    language: String,
    code: String,
    events: Vec<Value>,
}

#[derive(Deserialize)]
struct DetectCase {
    code: String,
    language: Option<String>,
    relevance: f64,
}

/// The corpus's compact form: text as a string, open as `[scope]`, close
/// as `0`, with adjacent text merged.
fn compact(events: &[Event]) -> Vec<Value> {
    let mut out: Vec<Value> = Vec::new();
    for event in events {
        match event {
            Event::Text(text) => match out.last_mut() {
                Some(Value::String(last)) => last.push_str(text),
                _ => out.push(Value::String(text.clone())),
            },
            Event::Open(scope) => out.push(Value::Array(vec![Value::String(scope.clone())])),
            Event::Close => out.push(Value::from(0)),
        }
    }
    out
}

fn conformance(highlighter: &Highlighter, path: &str) -> Result<(), Error> {
    let corpus: Corpus = serde_json::from_str(&std::fs::read_to_string(path)?)?;
    let mut failures = Vec::new();
    for case in &corpus.tokenize {
        let events = compact(&highlighter.tokenize(&case.code, &case.language)?);
        if events != case.events {
            failures.push(format!("tokenize {}", case.language));
        }
    }
    for (index, case) in corpus.detect.iter().enumerate() {
        let detected = highlighter.detect(&case.code)?;
        if detected.language != case.language || detected.relevance != case.relevance {
            failures.push(format!(
                "detect #{index}: {:?} {} (want {:?} {})",
                detected.language, detected.relevance, case.language, case.relevance
            ));
        }
    }
    let total = corpus.tokenize.len() + corpus.detect.len();
    println!("{} of {} cases pass", total - failures.len(), total);
    for failure in &failures {
        println!("  fail: {failure}");
    }
    if failures.is_empty() {
        Ok(())
    } else {
        std::process::exit(1)
    }
}
