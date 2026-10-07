import type {
  HighlightResult,
  LineToken,
  Registry,
  ScopeEvent,
  Snapshot,
} from "./engine.d.ts";
import type { LanguageType } from "./languages/index.d.ts";

/** Shape both a real `Worker` and a `MessagePort` satisfy. */
export interface PostMessageTarget {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent) => void) | null;
  terminate?(): void;
  close?(): void;
}

export interface ServeHighlighterOptions {
  registry?: Registry;
  loadLanguage?: (name: string) => Promise<LanguageType<string>>;
}

/**
 * Answers `createWorkerHighlighter` requests on `scope` (default: `self`),
 * loading grammars on demand and resolving aliases like `svelte-highlight/fence`.
 */
export declare function serveHighlighter(
  scope?: PostMessageTarget,
  options?: ServeHighlighterOptions,
): void;

export interface WorkerSession {
  append(chunk: string): Promise<void>;
  replace(from: number, to: number, text: string): Promise<void>;
  finish(options?: { canonicalize?: boolean }): Promise<HighlightResult>;
  events(): Promise<ScopeEvent[]>;
  snapshot(): Promise<Snapshot>;
}

export interface WorkerHighlighter {
  highlight(code: string, language: string): Promise<HighlightResult>;
  tokenLines(code: string, language: string): Promise<LineToken[][]>;
  createSession(language: string): WorkerSession;
  terminate(): void;
}

/**
 * Client for a `serveHighlighter` worker. Without `worker`, runs in-process
 * against the shared `svelte-highlight/registry` (SSR/tests fallback).
 */
export declare function createWorkerHighlighter(
  worker?: PostMessageTarget,
): WorkerHighlighter;
