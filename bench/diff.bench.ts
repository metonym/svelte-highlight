/** Line diff, streaming sessions, rows, word diffs, and LLM edit apply. */
import { group, task } from "ostia";
import {
  buildRows,
  createDiffSession,
  diffTexts,
  wordDiff,
} from "../src/diff.js";
import { createDiffController } from "../src/diff-controller.js";
import { applyEdits, parseEdits } from "../src/diff-edits.js";
import javascript from "../src/languages/javascript.js";
import { getCorpus, scatterEdits } from "./_shared.ts";

const { javascript: corpus } = await getCorpus();
const lineCount = corpus.split("\n").length;
const edited = scatterEdits(corpus, 150);

// Two unrelated files of the same size: the worst case for Myers.
const half = corpus.slice(0, corpus.length >> 3);
const unrelated = half.split("\n").reverse().join("\n");

// Lockfile-like: thousands of near-identical lines, few unique anchors.
const lock = Array.from(
  { length: 20_000 },
  (_, i) => `    "pkg-${i % 400}": "^1.${i % 7}.0",`,
).join("\n");
const lockEdited = lock.replace(/\^1\.3\.0/g, "^1.4.0");

group(`diffTexts() on real code (${lineCount.toLocaleString()} lines)`, () => {
  task("an edit every 150 lines", () => diffTexts(corpus, edited));
  task("identical", () => diffTexts(corpus, corpus));
  task("unrelated eighth of the corpus", () => diffTexts(half, unrelated));
});

group("diffTexts() on a 20,000-line lockfile", () => {
  task("one version bumped everywhere", () => diffTexts(lock, lockEdited));
});

group("buildRows()", () => {
  const state = diffTexts(corpus, edited);
  task("unified, folded", () => buildRows(state));
  task("split, folded", () => buildRows(state, { view: "split" }));
});

group("streaming session", () => {
  const target = edited.slice(0, edited.length >> 2);
  const chunks = 200;
  const step = Math.ceil(target.length / chunks);
  task(`a quarter of the corpus in ${chunks} chunks`, () => {
    const session = createDiffSession();
    for (let i = step; i < target.length + step; i += step) {
      session.update(corpus, target.slice(0, i), { streaming: true });
    }
  });
});

group("wordDiff()", () => {
  const a =
    "const result = await fetchUser(request.params.id, { cache: true });";
  const b =
    "const user = await fetchUser(req.params.userId, { cache: false });";
  task("one changed line", () => wordDiff(a, b));
});

group("controller", () => {
  const diff = createDiffController({ language: javascript });
  diff.update(corpus, edited);
  diff.expandAll();
  const rows = diff.rows().length;
  task("renderRows() for a 60-row window mid-file", () => {
    const start = rows >> 1;
    diff.renderRows(start, start + 60);
  });
});

group("applyEdits()", () => {
  const lines = corpus.split("\n");
  const at = lines.length >> 1;
  const search = lines.slice(at, at + 6);
  const exact = `<<<<<<< SEARCH\n${search.join("\n")}\n=======\n// replaced\n>>>>>>> REPLACE\n`;
  const fuzzy = `<<<<<<< SEARCH\n${search.map((l) => l.replace(/;$/, "").replace(/"/g, "'")).join("\n")}\n=======\n// replaced\n>>>>>>> REPLACE\n`;
  task("exact match, mid-corpus", () =>
    applyEdits(corpus, parseEdits(exact).edits),
  );
  task("fuzzy match, mid-corpus", () =>
    applyEdits(corpus, parseEdits(fuzzy).edits),
  );
});
