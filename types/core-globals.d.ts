// Globals the framework-free core may use. Each one exists in browsers,
// web workers, Node, Bun, and Deno. `tsconfig.core.json` drops the DOM lib,
// so any other DOM global in core fails the type check.

declare var console: {
  log(...data: unknown[]): void;
  warn(...data: unknown[]): void;
  error(...data: unknown[]): void;
};

declare function queueMicrotask(callback: () => void): void;

declare function structuredClone<T>(value: T): T;

/** Worker global scope. Core only feature-detects it. */
declare var self: unknown;

/** Set by Vite and other bundlers; absent elsewhere. */
interface ImportMeta {
  readonly env?: { readonly DEV?: boolean };
}
