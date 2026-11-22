# Highlighting engine specification

This describes what `svelte-highlight/engine` computes, so that another host (a Rust crate, a Python package, an embedded JS runtime) can produce the same output from the same grammars. `src/engine.js` is the reference implementation. Where this document and the code disagree, the code wins and this document has a bug.

[`corpus.json`](corpus.json) is the conformance corpus: code samples with the events this engine produces for them. A host conforms if it reproduces every case. `tests/conformance.test.ts` runs the reference engine against it.

## Versioning

The grammar format below is generated data. Its fields can change in any minor release of the package, so a host must use grammars from the package version it targets, and the corpus from that release's git tag.

Event streams, scope names and the rules in this document are stable across versions. A change to them is a breaking change of the package.

## Output: the scope-event stream

Tokenizing returns a list of events:

| Event | Shape | Meaning |
| :-- | :-- | :-- |
| `TEXT` | `{ t: 0, v: string }` | A run of source text. Never empty. |
| `OPEN` | `{ t: 1, s: string }` | A scope starts, e.g. `"keyword"` or `"title.class"`. |
| `CLOSE` | `{ t: 2 }` | The innermost open scope ends. |

Two properties always hold:

1. The `TEXT` values concatenate to exactly the input.
2. `OPEN` and `CLOSE` are balanced and properly nested.

Where one run of text ends and the next begins is not part of the contract: adjacent `TEXT` events may be split differently by different hosts. The corpus stores events with adjacent `TEXT` merged, and conformance compares after merging.

A scope `language:<name>` wraps the events of an embedded language (see [Embedded languages](#embedded-languages)).

### Rendering

`renderHtml` turns events into the markup highlight.js produces: `TEXT` is HTML-escaped (`&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#x27;`), `OPEN` becomes `<span class="...">` and `CLOSE` becomes `</span>`. A scope maps to classes by these rules:

- `language:xml` becomes `language-xml`.
- A dotted scope `a.b.c` becomes `hljs-a b_ c__`: the first part gets the prefix, and each later part gets one more underscore than the one before.
- Any other scope `a` becomes `hljs-a`.

## Input: grammars

A grammar is a JSON object (`GrammarIR`). The package ships each one as the `register` field of `languages/<name>.js`.

| Field | Meaning |
| :-- | :-- |
| `name` | Canonical language name. |
| `aliases` | Other names it registers under. |
| `caseInsensitive` | Patterns get the `i` flag, and keywords match lowercased. |
| `unicode` | Patterns get the `u` flag. |
| `disableAutodetect` | Never a candidate in auto-detection. |
| `supersetOf` | Wins relevance ties against the named language. |
| `states` | Every state, by index. State `0` is the top level. |
| `keywordTables` | Keyword tables that states share by index. |

### States

A state is one mode of the tokenizer: the top level, a string, a comment, a function signature. All fields are optional.

| Field | Meaning |
| :-- | :-- |
| `begin` | Pattern that enters this state from a parent that lists it in `rules`. |
| `end` | Pattern that leaves it. |
| `rules` | Indexes of the states that can begin inside this one, in priority order. |
| `scope` | Scope opened on entry and closed on exit. |
| `relevance` | Added to the score when the state ends. Default `1`. |
| `keywords` | Word table, or an index into `keywordTables`. See [Keywords](#keywords). |
| `keywordPattern` | Pattern that finds candidate words. Default `\w+`. |
| `endsWithParent` | The parent's `end` can also end this state. |
| `endsParent` | Ending this state also ends its parent, and so on up while each has `endsParent`. |
| `skip` | The matched text stays in the parent's text buffer, and no keywords are processed for it. |
| `excludeBegin` | The `begin` match is text of the parent, not of this state. |
| `returnBegin` | The `begin` match isn't consumed. This state sees it again. |
| `excludeEnd` | The `end` match is text of the parent. |
| `returnEnd` | The `end` match isn't consumed. The parent sees it again. |
| `subLanguage` | The state's text is tokenized as another language. See [Embedded languages](#embedded-languages). |
| `illegal` | Pattern that, during auto-detection only, rejects the language. |
| `wrapScope` | The `begin` match is emitted as one token with this scope. |
| `captureScopes` | The `begin` match is emitted group by group. |
| `endWrapScope` | Like `wrapScope`, for the `end` match. |
| `endCaptureScopes` | Like `captureScopes`, for the `end` match. |
| `endSameAsBegin` | `end` only matches when its group 1 equals the `begin` match's group 1 (heredocs). |
| `starts` | Index of a state to enter right after this one ends. |
| `onlyAtInputStart`, `notAfterDot`, `xmlTagGuard`, `letterBoundaryGuard`, `beginWordSet` | Extra conditions on a `begin` match. See [Guards](#guards). |

### Patterns

Patterns are ECMAScript regular expressions, as JavaScript's `RegExp` runs them, compiled with the flags `mg` plus `i` and `u` from the grammar. Hosts outside JavaScript need an engine with the same semantics. Grammars use lookahead, backreferences, and `\w` and `\b` in their non-Unicode meaning (ASCII word characters). No bundled grammar uses lookbehind. In Rust, `regress` implements ECMAScript semantics; the `regex` crate can't run these patterns.

A pattern is searched from a position, not anchored to it: the match is the first one at or after the position.

Positions and lengths in this document count UTF-16 code units, as JavaScript strings do. A host that indexes by bytes or code points has to convert at the regex boundary. Event text is a string, so it is the same in any encoding.

## Tokenizing

The tokenizer keeps:

- a stack of frames, each a state plus the position its `begin` matched at and, for `endSameAsBegin`, its group 1. It starts with state `0`.
- `pos`, the position up to which input is consumed.
- a text buffer: consumed input not yet emitted.
- `relevance`, starting at 0, and a count of hits per keyword.

### The main loop

Repeat until no match is found:

1. **Find the next lexeme.** Search, from `pos`:
   - the `begin` pattern of every state in the top frame's `rules`, in order;
   - the `end` pattern of the top frame, then of each frame below it for as long as the frame above has `endsWithParent`, innermost first;
   - in auto-detection only, the top state's `illegal` pattern.

   A candidate must pass its guards (see [Guards](#guards)); otherwise the search for that pattern continues from one position after the failed match. The lexeme is the candidate that starts earliest. Ties go to `begin` patterns in `rules` order, then to `end` patterns innermost first, then to `illegal`.
2. Append the input from `pos` to the lexeme's start to the buffer.
3. **Handle it**, as a begin, an end or an illegal (below).
4. Advance `pos` to the lexeme's start plus what step 3 consumed. If that is no progress (same `pos`, and the frame stack is unchanged), append one character to the buffer and advance by one instead.

When no lexeme is left: append the rest of the input to the buffer, [flush](#flushing-the-buffer), and close any scopes still open.

A run is abandoned with an error after more than 500,000 iterations, if that is also more than three times `pos`.

### Begin

For a `begin` match of state `S`:

1. If `S.skip`, append the match to the buffer.
2. Otherwise:
   - if `S.excludeBegin`, append the match to the buffer;
   - [flush](#flushing-the-buffer) the buffer as the parent's text;
   - unless `S.returnBegin` or `S.excludeBegin`, the buffer becomes the match.
3. Enter `S`:
   - open `S.scope` if set;
   - if `S.wrapScope`: emit the buffer as one token with that scope, then empty the buffer;
   - else if `S.captureScopes`: [emit the captures](#captures), then empty the buffer;
   - push a frame.
4. Consume the match, or nothing if `S.returnBegin`.

### End

For an `end` match found at frame depth `d`:

1. Extend `d` outward while the frame at `d` has `endsParent` (stopping above the top level).
2. Let `O` be the top frame's state (the innermost one, even when the match came from a frame below it):
   - if `O.endWrapScope`: flush, then emit the match as one token with that scope;
   - else if `O.endCaptureScopes`: flush, then [emit the captures](#captures);
   - else if `O.skip`: append the match to the buffer;
   - else: append the match unless `O.returnEnd` or `O.excludeEnd`, flush, and if `O.excludeEnd`, the buffer becomes the match.
3. Pop frames until the stack has `d` frames. For each popped state: close its scope if it has one, and add its `relevance` unless it has `skip` or `subLanguage`.
4. If the last popped state has `starts`, enter that state as in Begin step 3, with the same match.
5. Consume the match, or nothing if `O.returnEnd`.

### Illegal

Only searched during auto-detection. A match ends the run: the language is rejected and scores 0.

### Flushing the buffer

Flushing emits the buffer as text of the top state, then empties it. With `subLanguage`, the buffer is tokenized as an embedded language. Otherwise it goes through keyword processing.

### Keywords

A state's keyword table maps a word to `[scope, relevance]`. `keywordTables` entries are lists of `[scope, relevance, "word word ..."]` groups, which expand into that map.

To process text under a state with keywords: search the text with `keywordPattern` from the start. For each match, look up the matched text (lowercased if the grammar is `caseInsensitive`). On a hit:

- Count the hit for that word. While the word has 7 hits or fewer, add its relevance to the score.
- If the scope starts with `_`, the word only adds relevance. It stays plain text.
- Otherwise emit the text before it, then the word as a token with that scope.

The text after the last token is emitted as plain text. A state without keywords emits the whole text as plain text.

### Captures

`captureScopes` maps group numbers to scopes, in ascending order. For each group that participated in the match: with a scope, emit the group's text as one token with it. With `null`, run the group's text through keyword processing of the top state.

### Tokens

Emitting text `x` as a token with scope `s` means `OPEN s`, `TEXT x`, `CLOSE`, and nothing if `x` is empty.

### Guards

A `begin` candidate also has to pass the first of these that its state sets:

| Field | Condition |
| :-- | :-- |
| `onlyAtInputStart` | The match starts at position 0. |
| `notAfterDot` | The character before the match isn't `.`. |
| `xmlTagGuard` | The match (`<Name`) is a real tag and not a type parameter. See below. |
| `letterBoundaryGuard` | The match is at position 0, or the character before it is a digit or `_`. |
| `beginWordSet` | The matched text is one of the listed words. |

For `xmlTagGuard`, look at the character after the match. The match is not a tag when that character is `<` or `,`. Nor when it is `>` and `</Name` doesn't occur later. Nor when the text after the match starts with optional whitespace and `=`, or with whitespace, `extends` and whitespace. Otherwise it is a tag.

For `endSameAsBegin`, an `end` candidate has to have the same group 1 as the frame's `begin` match.

### Embedded languages

A state with `subLanguage` gets its buffer tokenized by another grammar when it flushes:

- **A single name.** Tokenize the text with that language. If the registry has no such language, emit the text as plain text instead. The embedded parse continues across flushes from the same embedding: if the previous flush for this language came from a frame that began at the same position, the new parse starts with that parse's frame stack and reopens its scopes first. Otherwise it starts fresh.
- **A list of names, or an empty list.** Auto-detect among those languages, or among all languages when the list is empty.

The embedded events are wrapped in `OPEN language:<name>` and `CLOSE` when a language was used. When auto-detection finds none, they're emitted unwrapped. If the embedding state's relevance is above 0, the embedded parse's relevance is added to the score.

## Auto-detection

`tokenizeAuto(code, subset)` picks the best language:

1. The candidates are `subset`, or every registered language, minus those with `disableAutodetect`.
2. Score each candidate on the first 8,000 code units of the code, with `illegal` patterns active. A rejected run, or one that errors, scores 0 with the code as plain text.
3. A candidate beats the best so far if its relevance is higher. On a tie, it wins only if its `supersetOf` names the best so far. Otherwise the earlier candidate stays.
4. If the code was longer than the sample, the winner is tokenized again over the whole code, without `illegal`. That full run's relevance is the reported one.

With no candidate scoring above 0, the result has no language and the code is one `TEXT` event.

## The corpus

`corpus.json` has this shape:

```json
{
  "events": "TEXT is a string, OPEN is [scope], CLOSE is 0",
  "tokenize": [{ "language": "rust", "code": "...", "events": ["fn", ["keyword"], "..."] }],
  "detect": [{ "code": "...", "language": "rust", "relevance": 12 }]
}
```

Events are stored compactly: a string is a `TEXT` event, `["scope"]` an `OPEN`, and `0` a `CLOSE`, with adjacent text merged.

- **`tokenize`:** with every bundled language registered, tokenizing `code` as `language` must produce `events`.
- **`detect`:** auto-detecting `code` among every bundled language must pick `language` with `relevance`.

Regenerate it with `bun scripts/build-conformance.ts` when a grammar or engine change is meant to change output, and review the diff.
