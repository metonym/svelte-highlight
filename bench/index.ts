/**
 * mitata benchmark suite entrypoint. Each ./*.bench.ts module registers its
 * bench()/group() calls as an import side effect; this file just imports
 * them all and flushes the queue once with run().
 *
 * Run everything: bun run bench
 * Filter (matches against benchmark names): bun run bench -- "tokenize"
 *
 * For a faster feedback loop, run a single suite directly instead - each
 * *.bench.ts file self-runs when it's the entry point:
 *   bun bench/text-diff.bench.ts
 */
import { run } from "mitata";

import "./ansi.bench.ts";
import "./tokenize.bench.ts";
import "./auto-detect.bench.ts";
import "./incremental.bench.ts";
import "./dom-paint.bench.ts";
import "./text-diff.bench.ts";
import "./render.bench.ts";

const filterArg = process.argv[2];

await run(filterArg ? { filter: new RegExp(filterArg, "i") } : {});
