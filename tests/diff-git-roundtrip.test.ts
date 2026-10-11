// Real-data check: for files changed in this repo's recent commits, a patch
// from `toUnifiedPatch` must make `git apply` reproduce the "after" file
// exactly. Uses whatever history the checkout has (CI may be shallow).

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { diffStats, diffTexts, toUnifiedPatch } from "../src/diff.js";

const COMMITS = 120;
const MAX_BYTES = 512 * 1024;

function git(args: string[], input?: string) {
  const result = Bun.spawnSync(["git", ...args], {
    stdin: input === undefined ? undefined : Buffer.from(input),
    stderr: "pipe",
  });
  return {
    ok: result.exitCode === 0,
    out: result.stdout.toString(),
    err: result.stderr.toString(),
  };
}

/** `[sha, path]` pairs for text files each commit modified. */
function changedFiles() {
  const log = git([
    "log",
    `-n${COMMITS}`,
    "--no-merges",
    "--diff-filter=M",
    "--numstat",
    "--format=@%H",
  ]);
  if (!log.ok) return [];
  const pairs: Array<[string, string]> = [];
  let sha = "";
  for (const line of log.out.split("\n")) {
    if (line.startsWith("@")) {
      sha = line.slice(1);
      continue;
    }
    const [added, , file] = line.split("\t");
    // Binary files show "-" counts.
    if (!file || added === "-" || file.includes(" => ")) continue;
    pairs.push([sha, file]);
  }
  return pairs;
}

/** Reads many blobs through one `git cat-file --batch`. */
function readBlobs(specs: string[]) {
  const result = Bun.spawnSync(["git", "cat-file", "--batch"], {
    stdin: Buffer.from(`${specs.join("\n")}\n`),
    stderr: "pipe",
  });
  const out = Buffer.from(result.stdout);
  const blobs: Array<string | null> = [];
  let pos = 0;
  for (let i = 0; i < specs.length; i++) {
    const eol = out.indexOf(10, pos);
    const header = out.subarray(pos, eol).toString();
    pos = eol + 1;
    if (header.endsWith(" missing") || header.endsWith(" ambiguous")) {
      blobs.push(null);
      continue;
    }
    const size = Number(header.split(" ")[2]);
    blobs.push(out.subarray(pos, pos + size).toString("utf8"));
    pos += size + 1;
  }
  return blobs;
}

/** Applies `patch` in `dir`; returns git's error, if any. */
function gitApply(dir: string, patch: string) {
  const applied = Bun.spawnSync(["git", "apply", "--whitespace=nowarn", "-"], {
    cwd: dir,
    stdin: Buffer.from(patch),
    stderr: "pipe",
  });
  return applied.exitCode === 0 ? null : applied.stderr.toString().trim();
}

/**
 * Round-trips each pair through one combined patch. Returns a description
 * of every pair that didn't reproduce its "after" text.
 */
function roundTrip(
  cases: Array<{ name: string; before: string; after: string }>,
) {
  const dir = mkdtempSync(path.join(tmpdir(), "shl-diff-"));
  const failures: string[] = [];
  try {
    const patches = cases.map(({ before, after }, i) => {
      writeFileSync(path.join(dir, `f${i}`), before);
      return toUnifiedPatch(diffTexts(before, after), {
        oldPath: `a/f${i}`,
        newPath: `b/f${i}`,
      });
    });
    const changed = patches.filter(
      (_, i) => cases[i]?.before !== cases[i]?.after,
    );
    if (changed.length > 0 && gitApply(dir, changed.join(""))) {
      // Find the culprits one at a time.
      cases.forEach((c, i) => {
        if (c.before === c.after) return;
        writeFileSync(path.join(dir, `f${i}`), c.before);
        const error = gitApply(dir, patches[i] ?? "");
        if (error) failures.push(`${c.name}: ${error}`);
      });
      return failures;
    }
    cases.forEach((c, i) => {
      if (readFileSync(path.join(dir, `f${i}`), "utf8") !== c.after) {
        failures.push(`${c.name}: applied, but the result differs`);
        return;
      }
      const stats = diffStats(diffTexts(c.before, c.after));
      if (
        stats.additions - stats.deletions !==
        countLines(c.after) - countLines(c.before)
      ) {
        failures.push(`${c.name}: line counts don't add up`);
      }
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return failures;
}

const pairs = changedFiles();

describe("toUnifiedPatch round trip through git apply", () => {
  it("handles edge cases git cares about", () => {
    const cases = [
      ["missing final newline, changed", "a\nb", "a\nc"],
      ["newline removed at the end", "a\nb\n", "a\nb"],
      ["newline added at the end", "a\nb", "a\nb\n"],
      ["file emptied", "x\ny\n", ""],
      ["file filled", "", "y\nz\n"],
      ["CRLF to LF", "one\r\ntwo\r\n", "one\ntwo\n"],
      ["insert at the top", "b\nc\n", "a\nb\nc\n"],
      ["delete at the bottom", "a\nb\nc\n", "a\nb\n"],
      ["tabs and trailing spaces", "\tif (x) {  \n}\n", "    if (x) {\n}\n"],
    ].map(([name, before, after]) => ({
      name: name ?? "",
      before: before ?? "",
      after: after ?? "",
    }));
    expect(roundTrip(cases)).toEqual([]);
  });

  // A shallow clone has no parents to diff against.
  (pairs.length === 0 ? it.skip : it)(
    `reproduces every file changed in the last ${COMMITS} commits`,
    () => {
      const blobs = readBlobs(
        pairs.flatMap(([sha, file]) => [`${sha}^:${file}`, `${sha}:${file}`]),
      );
      const cases = pairs.flatMap(([sha, file], i) => {
        const before = blobs[i * 2];
        const after = blobs[i * 2 + 1];
        if (before == null || after == null) return [];
        if (before.length > MAX_BYTES || after.length > MAX_BYTES) return [];
        return [{ name: `${sha.slice(0, 8)} ${file}`, before, after }];
      });
      expect(cases.length).toBeGreaterThan(0);
      expect(roundTrip(cases)).toEqual([]);
    },
    60_000,
  );
});

function countLines(text: string) {
  if (text === "") return 0;
  return text.split("\n").length - (text.endsWith("\n") ? 1 : 0);
}
