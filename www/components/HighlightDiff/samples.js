// Fixtures for the HighlightDiff preview page.

export const tsBefore = `import { EventEmitter } from "node:events";

/**
 * A tiny in-memory cache with TTL support.
 */
export class Cache<V> extends EventEmitter {
  private store = new Map<string, { value: V; expires: number }>();

  constructor(private ttl = 60_000) {
    super();
  }

  get(key: string): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V) {
    this.store.set(key, { value, expires: Date.now() + this.ttl });
    this.emit("set", key);
  }

  delete(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

function formatKey(namespace: string, key: string) {
  return namespace + ":" + key;
}

function parseKey(raw: string) {
  const [namespace, key] = raw.split(":");
  return { namespace, key };
}

export function createCache<V>(ttl?: number) {
  return new Cache<V>(ttl);
}
`;

export const tsAfter = `import { EventEmitter } from "node:events";

/**
 * A tiny in-memory cache with TTL support and an optional size limit.
 */
export class Cache<V> extends EventEmitter {
  private store = new Map<string, { value: V; expires: number }>();

  constructor(
    private ttl = 60_000,
    private maxSize = Infinity,
  ) {
    super();
  }

  get(key: string): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expires <= Date.now()) {
      this.store.delete(key);
      this.emit("expire", key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V, ttl = this.ttl) {
    if (this.store.size >= this.maxSize) this.evictOldest();
    this.store.set(key, { value, expires: Date.now() + ttl });
    this.emit("set", key);
  }

  delete(key: string) {
    return this.store.delete(key);
  }

  private evictOldest() {
    const oldest = this.store.keys().next().value;
    if (oldest !== undefined) this.store.delete(oldest);
  }

  clear() {
    this.store.clear();
  }

  get size() {
    return this.store.size;
  }
}

function parseKey(raw: string) {
  const [namespace, key] = raw.split(":");
  return { namespace, key };
}

function formatKey(namespace: string, key: string) {
  return \`\${namespace}:\${key}\`;
}

export function createCache<V>(ttl?: number, maxSize?: number) {
  return new Cache<V>(ttl, maxSize);
}
`;

// A change deep inside a block comment and a template literal that open
// far above the hunk. Highlighting the hunk alone gets both wrong.
export const crossHunkBefore = `/*
 * Configuration loader.
 *
 * Reads settings from the environment, then from config files.
 * Every key below is documented in docs/config.md.
 *
 *   PORT        - listen port (default 3000)
 *   HOST        - bind address (default 0.0.0.0)
 *   LOG_LEVEL   - one of: debug, info, warn, error
 *   CACHE_TTL   - seconds; set to 0 to disable caching
 */

const banner = \`
  ┌──────────────────────────┐
  │   service starting up    │
  │   port:  \${process.env.PORT ?? 3000}
  │   host:  \${process.env.HOST ?? "0.0.0.0"}
  │   const x = 1; // not code │
  └──────────────────────────┘
\`;

export function load() {
  return { port: Number(process.env.PORT ?? 3000) };
}
`;

export const crossHunkAfter = crossHunkBefore
  .replace(
    "CACHE_TTL   - seconds; set to 0 to disable caching",
    'CACHE_TTL   - seconds; set to 0 to disable caching\n *   if (x) { return "this is still a comment"; }',
  )
  .replace(
    "│   const x = 1; // not code │",
    "│   const y = 2; // still a string │",
  )
  .replace(
    "Number(process.env.PORT ?? 3000)",
    "Number(process.env.PORT ?? 8080)",
  );

// Reordered functions, so most of the diff is a move.
export const movedBefore = `export function parse(input) {
  const tokens = tokenize(input);
  const ast = buildTree(tokens);
  validate(ast);
  return ast;
}

export function tokenize(input) {
  const out = [];
  for (const ch of input) {
    if (/\\s/.test(ch)) continue;
    out.push({ type: classify(ch), value: ch });
  }
  return out;
}

export function render(ast) {
  return ast.children.map(renderNode).join("");
}

function classify(ch) {
  return /\\d/.test(ch) ? "number" : "symbol";
}
`;

export const movedAfter = `export function parse(input) {
  const tokens = tokenize(input);
  const ast = buildTree(tokens);
  validate(ast);
  return ast;
}

export function render(ast) {
  return ast.children.map(renderNode).join("");
}

function classify(ch) {
  return /\\d/.test(ch) ? "number" : "symbol";
}

export function tokenize(input) {
  const out = [];
  for (const ch of input) {
    if (/\\s/.test(ch)) continue;
    out.push({ type: classify(ch), value: ch });
  }
  return out;
}
`;

// Re-indented code plus one real change.
export const whitespaceBefore = `function outer() {
  if (enabled) {
    for (const item of items) {
      process(item);
      log(item.id);
    }
  }
}
`;

export const whitespaceAfter = `function outer() {
  if (!enabled) return;
  for (const item of items) {
    process(item);
    log(item.id);
  }
}
`;

/** Streaming rewrite: what the model "types". */
export const streamBefore = `import express from "express";

const app = express();

app.get("/users/:id", async (req, res) => {
  const user = await db.users.find(req.params.id);
  res.json(user);
});

app.post("/users", async (req, res) => {
  const user = await db.users.create(req.body);
  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  await db.users.remove(req.params.id);
  res.sendStatus(204);
});

app.listen(3000);
`;

export const streamAfter = `import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

const UserInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

app.get("/users/:id", async (req, res) => {
  const user = await db.users.find(req.params.id);
  if (!user) return res.sendStatus(404);
  res.json(user);
});

app.post("/users", async (req, res) => {
  const parsed = UserInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  const user = await db.users.create(parsed.data);
  res.status(201).json(user);
});

app.delete("/users/:id", async (req, res) => {
  await db.users.remove(req.params.id);
  res.sendStatus(204);
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(\`listening on \${port}\`));
`;

/** Edit-format fixtures, all targeting `editSource`. */
export const editSource = `def load_config(path):
    with open(path) as f:
        data = json.load(f)
    return data


def connect(config):
    host = config["host"]
    port = config["port"]
    return Client(host, port)


def main():
    config = load_config("config.json")
    client = connect(config)
    client.run()


if __name__ == "__main__":
    main()
`;

export const editSamples = [
  {
    label: "SEARCH/REPLACE blocks (Aider style)",
    text: `I'll add validation and a timeout.

app.py
\`\`\`python
<<<<<<< SEARCH
def load_config(path):
    with open(path) as f:
        data = json.load(f)
    return data
=======
def load_config(path):
    with open(path) as f:
        data = json.load(f)
    if "host" not in data:
        raise ValueError("config is missing 'host'")
    return data
>>>>>>> REPLACE
\`\`\`

app.py
\`\`\`python
<<<<<<< SEARCH
    return Client(host, port)
=======
    return Client(host, port, timeout=config.get("timeout", 30))
>>>>>>> REPLACE
\`\`\`
`,
  },
  {
    label: "Unified diff with wrong line numbers",
    text: `\`\`\`diff
--- a/app.py
+++ b/app.py
@@ -100,7 +100,8 @@
 def main():
     config = load_config("config.json")
     client = connect(config)
-    client.run()
+    with client:
+        client.run()
\`\`\`
`,
  },
  {
    label: "str_replace tool call (JSON)",
    text: JSON.stringify(
      {
        command: "str_replace",
        path: "app.py",
        old_str: '    host = config["host"]\n    port = config["port"]',
        new_str:
          '    host = config.get("host", "localhost")\n    port = int(config.get("port", 8080))',
      },
      null,
      2,
    ),
  },
  {
    label: "MultiEdit (edits array)",
    text: JSON.stringify(
      {
        file_path: "app.py",
        edits: [
          { old_string: "def main():", new_string: "def main() -> int:" },
          {
            old_string: 'if __name__ == "__main__":\n    main()',
            new_string:
              'if __name__ == "__main__":\n    import sys\n    sys.exit(main())',
          },
        ],
      },
      null,
      2,
    ),
  },
  {
    label: "apply_patch envelope",
    text: `*** Begin Patch
*** Update File: app.py
@@ def connect(config):
     host = config["host"]
     port = config["port"]
-    return Client(host, port)
+    client = Client(host, port)
+    client.retry(3)
+    return client
*** End Patch`,
  },
  {
    label: "Mis-indented search (fuzzy: indentation)",
    text: `<<<<<<< SEARCH
with open(path) as f:
    data = json.load(f)
=======
with open(path, encoding="utf-8") as f:
    data = json.load(f)
>>>>>>> REPLACE`,
  },
  {
    label: "Paraphrased search (fuzzy: similarity)",
    text: `<<<<<<< SEARCH
def main():
    config = load_config('config.json')
    client = connect(config)
    client.run()
=======
def main(argv=None):
    config = load_config(argv[1] if argv else "config.json")
    client = connect(config)
    client.run()
    return 0
>>>>>>> REPLACE`,
  },
  {
    label: "Hallucinated search (fails)",
    text: `<<<<<<< SEARCH
def shutdown(client):
    client.close()
=======
def shutdown(client):
    client.close(force=True)
>>>>>>> REPLACE`,
  },
];

/** Model output streamed into the "live edit" demo. */
export const streamedEditOutput = `I'll validate the config and add a timeout.

<<<<<<< SEARCH
def load_config(path):
    with open(path) as f:
        data = json.load(f)
    return data
=======
def load_config(path):
    """Load and validate a JSON config file."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    for key in ("host", "port"):
        if key not in data:
            raise ValueError(f"config is missing {key!r}")
    return data
>>>>>>> REPLACE

<<<<<<< SEARCH
    return Client(host, port)
=======
    timeout = float(config.get("timeout", 30))
    return Client(host, port, timeout=timeout)
>>>>>>> REPLACE

<<<<<<< SEARCH
    client.run()
=======
    try:
        client.run()
    finally:
        client.close()
>>>>>>> REPLACE
`;

/** Fake commit history for the git viewer. */
export const commits = [
  {
    sha: "4890b1c2",
    author: "Floyd Wang",
    date: "2026-10-05",
    title: "speech: pace waveform at one bar per 80 ms",
    patch: `diff --git a/crates/speech/src/level.rs b/crates/speech/src/level.rs
index 3a1f0e2..9bc44d1 100644
--- a/crates/speech/src/level.rs
+++ b/crates/speech/src/level.rs
@@ -128,14 +128,16 @@ mod tests {
     #[test]
     fn meter_tracks_peaks() {
         let mut meter = LevelMeter::new();
         meter.reset(16_000, 1);
-        // 25 ms at 16 kHz is 400 samples; feed 1 000 samples in uneven pushes.
-        assert!(!meter.push(&tone(1_000, 150)));
-        assert!(meter.push(&tone(1_000, 300)));
-        assert!(meter.push(&tone(1_000, 550)));
+        // Two and a half levels' worth of audio in uneven pushes.
+        let window = window_for(16_000, 1);
+        assert!(!meter.push(&tone(1_000, window / 3)));
+        assert!(meter.push(&tone(1_000, window)));
+        assert!(meter.push(&tone(1_000, window + window / 6)));
         assert_eq!(meter.levels().len(), 2);
-        assert!(meter.last_level_at().is_some());
+        assert!(meter.lead_at(Instant::now()).is_some());
     }

     #[test]
     fn the_window_follows_the_stream_format() {
@@ -156,7 +158,7 @@ mod tests {
         let mut meter = LevelMeter::new();
         meter.reset(16_000, 1);
         // -60 dBFS: below the -50 dB floor of the scale.
-        meter.push(&tone(32, 400));
+        meter.push(&tone(32, window_for(16_000, 1)));
         assert_eq!(meter.levels().next(), Some(0.0));
     }
 }
diff --git a/crates/speech/src/waveform.rs b/crates/speech/src/waveform.rs
index 77de001..1a2b3c4 100644
--- a/crates/speech/src/waveform.rs
+++ b/crates/speech/src/waveform.rs
@@ -40,9 +40,12 @@ impl SpeechWaveform {
     pub fn paint(&self, bounds: Bounds, cx: &mut App) {
-        let bars = self.levels.iter().rev().take(self.capacity);
+        let elapsed = self.started.elapsed().as_millis() as f32;
+        let offset = (elapsed % BAR_MS) / BAR_MS;
+        let bars = self.levels.iter().rev().take(self.capacity + 1);
         for (i, level) in bars.enumerate() {
-            let x = bounds.right() - (i as f32 + 1.0) * BAR_WIDTH;
+            let x = bounds.right() - (i as f32 + 1.0 - offset) * BAR_WIDTH;
             paint_bar(x, level, cx);
         }
+        cx.request_animation_frame();
     }
 }
diff --git a/website/component/speech.md b/website/component/speech.md
index 1111111..2222222 100644
--- a/website/component/speech.md
+++ b/website/component/speech.md
@@ -12,4 +12,6 @@
 ## Waveform

-The waveform shows one bar per audio level.
+The waveform shows one bar per 80 ms of audio and scrolls smoothly
+between bars, so speech reads as a continuous signal.
+
 See [LevelMeter](./level.md) for how levels are computed.
`,
  },
  {
    sha: "6150a8c6",
    author: "kevin",
    date: "2026-10-05",
    title: "input: count characters, not bytes, when validating",
    patch: `diff --git a/crates/input/src/validate.ts b/crates/input/src/validate.ts
index 0a0a0a0..0b0b0b0 100644
--- a/crates/input/src/validate.ts
+++ b/crates/input/src/validate.ts
@@ -1,12 +1,13 @@
 export interface Rule {
   max?: number;
   min?: number;
 }

 export function validate(value: string, rule: Rule): string | null {
-  const length = new TextEncoder().encode(value).length;
+  // Count user-perceived characters, so "👍🏽" is one, not eight.
+  const length = [...new Intl.Segmenter().segment(value)].length;
   if (rule.max !== undefined && length > rule.max) {
-    return "Too long";
+    return \`Too long (\${length}/\${rule.max})\`;
   }
   if (rule.min !== undefined && length < rule.min) {
     return "Too short";
diff --git a/crates/input/src/legacy.ts b/crates/input/src/legacy.ts
deleted file mode 100644
index 5555555..0000000
--- a/crates/input/src/legacy.ts
+++ /dev/null
@@ -1,3 +0,0 @@
-export function byteLength(value: string) {
-  return new TextEncoder().encode(value).length;
-}
diff --git a/crates/input/src/segment.ts b/crates/input/src/segment.ts
new file mode 100644
index 0000000..6666666
--- /dev/null
+++ b/crates/input/src/segment.ts
@@ -0,0 +1,5 @@
+const segmenter = new Intl.Segmenter();
+
+export function graphemes(value: string): string[] {
+  return [...segmenter.segment(value)].map((s) => s.segment);
+}
`,
  },
  {
    sha: "1269b7ab",
    author: "Oleg Kossoy",
    date: "2026-10-05",
    title: "text_view: normalize GFM table rows to the header",
    patch: `diff --git a/src/table.css b/src/table.css
index abcdef0..abcdef1 100644
--- a/src/table.css
+++ b/src/table.css
@@ -3,8 +3,9 @@
 .table {
   border-collapse: collapse;
-  width: 100%;
+  width: max-content;
+  min-width: 100%;
 }

 .table td,
 .table th {
-  padding: 4px 8px;
+  padding: 6px 12px;
   border: 1px solid var(--border);
 }
diff --git a/src/table.json b/src/table.json
index 1234567..7654321 100644
--- a/src/table.json
+++ b/src/table.json
@@ -1,6 +1,7 @@
 {
   "align": "left",
-  "pad": true,
+  "pad": "header",
+  "normalize": true,
   "columns": 3,
   "header": ["Name", "Type", "Default"]
 }
`,
  },
];

/** Extension -> language module key used by the preview. */
export const extToLanguage = {
  rs: "rust",
  ts: "typescript",
  js: "javascript",
  md: "markdown",
  css: "css",
  json: "json",
  py: "python",
};

/**
 * A large TypeScript-ish file and a copy with edits scattered through it.
 * @param {number} lines
 * @param {number} edits
 */
export function generateLargePair(lines, edits) {
  const out = [];
  for (let i = 0; i < lines; i++) {
    if (i % 40 === 0) out.push(`/** Section ${i / 40}: generated helpers. */`);
    else if (i % 40 === 1)
      out.push(`export function helper${i}(input: number): number {`);
    else if (i % 40 === 39) out.push("}");
    else
      out.push(
        `  const v${i} = input * ${i % 97} + ${(i * 7) % 13}; // step ${i}`,
      );
  }
  const after = out.slice();
  // Deterministic pseudo-random edit positions.
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  const positions = Array.from(
    { length: edits },
    () => Math.floor(rand() * (lines - 2)) + 1,
  ).sort((a, b) => b - a);
  for (const p of positions) {
    const kind = rand();
    if (kind < 0.4) after[p] = `${after[p]?.replace("input", "input2")}`;
    else if (kind < 0.7)
      after.splice(p, 0, `  // TODO(review): check overflow near ${p}`);
    else if (kind < 0.85) after.splice(p, 1);
    else
      after.splice(
        p,
        0,
        "  if (input < 0) {",
        `    throw new RangeError("negative input at ${p}");`,
        "  }",
      );
  }
  return { before: `${out.join("\n")}\n`, after: `${after.join("\n")}\n` };
}

/** Small edge cases, each a before/after pair. */
export const edgeCases = [
  { label: "Empty → content", before: "", after: "hello\nworld\n" },
  { label: "Content → empty", before: "hello\nworld\n", after: "" },
  {
    label: "Identical",
    before: "same\nsame\nsame\n",
    after: "same\nsame\nsame\n",
  },
  {
    label: "Missing newline at end of file",
    before: "a\nb\nc\n",
    after: "a\nb\nc",
  },
  {
    label: "CRLF → LF",
    before: "line one\r\nline two\r\n",
    after: "line one\nline two\n",
  },
  {
    label: "Unicode, emoji, CJK, RTL",
    before: 'const greeting = "héllo 👋🏽 世界";\nconst rtl = "مرحبا";\n',
    after: 'const greeting = "hello 👋🏿 世界!";\nconst rtl = "مرحبا بك";\n',
  },
  {
    label: "Tabs vs spaces",
    before: "if (x) {\n\treturn 1;\n}\n",
    after: "if (x) {\n    return 1;\n}\n",
  },
  {
    label: "HTML-significant characters",
    before: 'const html = "<b>bold</b> & <i>italic</i>";\n',
    after: 'const html = "<strong>bold</strong> &amp; <em>italic</em>";\n',
  },
  {
    label: "Very long line (scroll horizontally)",
    before: `const data = [${Array.from({ length: 80 }, (_, i) => i).join(", ")}];\n`,
    after: `const data = [${Array.from({ length: 80 }, (_, i) => (i === 61 ? 6100 : i)).join(", ")}];\n`,
  },
  {
    label: "Minified one-liner",
    before:
      '{"name":"svelte-highlight","version":"7.23.1","private":false,"type":"module"}\n',
    after:
      '{"name":"svelte-highlight","version":"8.0.0","private":false,"type":"module","sideEffects":false}\n',
  },
  {
    label: "Everything changed",
    before: "alpha\nbeta\ngamma\n",
    after: "one\ntwo\nthree\nfour\n",
  },
  {
    label: "Control characters",
    before: "bell:\u0007 nul:\u0000 esc:\u001b[0m\n",
    after: "bell: nul: esc:\n",
  },
];

/** Language samples: [name, before, after]. */
export const languageSamples = {
  python: [
    "def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(10))\n",
    "from functools import cache\n\n@cache\ndef fib(n: int) -> int:\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\nprint(fib(90))\n",
  ],
  rust: [
    `fn main() {\n    let v = vec![1, 2, 3];\n    let sum: i32 = v.iter().sum();\n    println!("{}", sum);\n}\n`,
    `fn main() {\n    let v: Vec<i64> = (1..=100).collect();\n    let sum: i64 = v.iter().copied().sum();\n    println!("sum = {sum}");\n}\n`,
  ],
  css: [
    ".button {\n  color: white;\n  background: #0f62fe;\n  padding: 8px 16px;\n}\n",
    ".button {\n  color: white;\n  background: var(--accent, #0f62fe);\n  padding: 0.5rem 1rem;\n  border-radius: 4px;\n}\n\n.button:hover {\n  filter: brightness(1.1);\n}\n",
  ],
  json: [
    `{\n  "name": "demo",\n  "version": "1.0.0",\n  "dependencies": {\n    "svelte": "^4.0.0"\n  }\n}\n`,
    `{\n  "name": "demo",\n  "version": "2.0.0",\n  "type": "module",\n  "dependencies": {\n    "svelte": "^5.0.0",\n    "svelte-highlight": "^7.23.1"\n  }\n}\n`,
  ],
  yaml: [
    "name: CI\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm test\n",
    "name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: oven-sh/setup-bun@v2\n      - run: bun test\n",
  ],
  markdown: [
    "# Title\n\nSome *text* here.\n\n- one\n- two\n",
    `# Title\n\nSome **bold** text here, with a [link](https://example.com).\n\n- one\n- two\n- three\n\n\`\`\`js\nconsole.log("hi");\n\`\`\`\n`,
  ],
};
