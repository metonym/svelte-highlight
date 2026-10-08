// Reads this repo's git history at build time, for the HighlightDiff
// preview's real-data section.

import { execFileSync } from "node:child_process";

const MAX_FILE_BYTES = 400 * 1024;
const MAX_COMMIT_BYTES = 8 * 1024 * 1024;

function git(args: string[]) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
}

export interface CommitSummary {
  sha: string;
  title: string;
  author: string;
  date: string;
  additions: number;
  deletions: number;
  files: number;
  /** Why this commit is in the list, if it was picked on purpose. */
  label?: string;
}

export interface CommitFile {
  path: string;
  oldPath: string;
  status: "modified" | "added" | "deleted" | "renamed";
  before: string;
  after: string;
  /** Set when the file was left out. */
  skipped?: string;
}

function summary(sha: string, label?: string): CommitSummary {
  const [title = "", author = "", date = ""] = git([
    "show",
    "-s",
    "--format=%s%x00%an%x00%as",
    sha,
  ])
    .trim()
    .split("\0");
  let additions = 0;
  let deletions = 0;
  let files = 0;
  for (const line of git(["show", "--numstat", "--format=", "-M", sha]).split(
    "\n",
  )) {
    const [added, removed] = line.split("\t");
    if (added === undefined || removed === undefined) continue;
    files++;
    additions += Number(added) || 0;
    deletions += Number(removed) || 0;
  }
  return {
    sha,
    title,
    author,
    date,
    additions,
    deletions,
    files,
    ...(label ? { label } : {}),
  };
}

/**
 * Recent commits, plus a few picked for being hard. Empty when the build
 * has no git or no history (a shallow clone has one commit).
 */
export function listCommits(): CommitSummary[] {
  try {
    return readCommits();
  } catch {
    return [];
  }
}

function readCommits(): CommitSummary[] {
  const recent = git(["log", "-n60", "--no-merges", "--format=%H"])
    .trim()
    .split("\n");
  if (recent.length < 2) return [];
  const picks: Array<[string, string[]]> = [
    [
      "Lockfile change",
      ["log", "-n1", "--no-merges", "--format=%H", "--", "bun.lock"],
    ],
    [
      "Engine rewrite with renames",
      ["log", "-n1", "--format=%H", "--grep=replace highlight.js runtime"],
    ],
    [
      "Largest recent refactor",
      ["log", "-n1", "--format=%H", "--grep=shrink generated grammars"],
    ],
  ];
  const featured = picks.flatMap(([label, args]) => {
    const sha = git(args).trim();
    // A shallow clone may have the commit but not its parent.
    if (sha && blob(`${sha}^:package.json`) === null) return [];
    return sha ? [summary(sha, label)] : [];
  });
  const seen = new Set(featured.map((c) => c.sha));
  return [
    ...featured,
    ...recent.filter((sha) => sha && !seen.has(sha)).map((sha) => summary(sha)),
  ];
}

function blob(spec: string) {
  try {
    return git(["show", spec]);
  } catch {
    return null;
  }
}

/** Full before/after text of every text file a commit changed. */
export function commitFiles(sha: string): CommitFile[] {
  const files: CommitFile[] = [];
  let total = 0;
  const statuses = git(["show", "--name-status", "--format=", "-M", sha])
    .trim()
    .split("\n");
  const numstat = git(["show", "--numstat", "--format=", "-M", sha])
    .trim()
    .split("\n");
  statuses.forEach((line, i) => {
    const [code = "", first = "", second] = line.split("\t");
    const path = second ?? first;
    const oldPath = first;
    const status =
      code[0] === "A"
        ? "added"
        : code[0] === "D"
          ? "deleted"
          : code[0] === "R"
            ? "renamed"
            : "modified";
    const base: CommitFile = { path, oldPath, status, before: "", after: "" };
    if (numstat[i]?.startsWith("-\t-\t")) {
      files.push({ ...base, skipped: "binary" });
      return;
    }
    const before = status === "added" ? "" : blob(`${sha}^:${oldPath}`);
    const after = status === "deleted" ? "" : blob(`${sha}:${path}`);
    if (before === null || after === null) {
      files.push({ ...base, skipped: "unreadable" });
      return;
    }
    const size = before.length + after.length;
    if (before.length > MAX_FILE_BYTES || after.length > MAX_FILE_BYTES) {
      files.push({
        ...base,
        skipped: `too large (${Math.round(size / 1024)} KB)`,
      });
      return;
    }
    if (total + size > MAX_COMMIT_BYTES) {
      files.push({ ...base, skipped: "commit size limit" });
      return;
    }
    total += size;
    files.push({ ...base, before, after });
  });
  return files;
}
