import { createRegistry, registerAll, tokenLines } from "./engine.js";
import { resolveLanguageName } from "./fence.js";
import { LanguageLoadError, loadLanguage } from "./load-language.js";
import { ensureRegistered, registry as sharedRegistry } from "./registry.js";

/**
 * @typedef {import("./worker.d.ts").PostMessageTarget} PostMessageTarget
 * @typedef {import("./worker.d.ts").ServeHighlighterOptions} ServeHighlighterOptions
 * @typedef {import("./worker.d.ts").WorkerSession} WorkerSession
 * @typedef {import("./worker.d.ts").WorkerHighlighter} WorkerHighlighter
 * @typedef {import("./engine.d.ts").Registry} Registry
 */

/**
 * Resolves `name` to a canonical, registered language name on `registry`,
 * loading and registering the grammar on demand the first time it's seen.
 * Concurrent calls for the same (resolved) name share one in-flight load.
 * @param {Registry} registry
 * @param {(name: string) => Promise<import("./languages/index.d.ts").LanguageType<string>>} loadLanguageFn
 * @returns {(name: string) => Promise<string>}
 */
function createLanguageResolver(registry, loadLanguageFn) {
  /** @type {Map<string, Promise<string>>} */
  const pending = new Map();

  return async function ensureLanguage(name) {
    const resolved = resolveLanguageName(name);
    if (resolved === undefined) throw new LanguageLoadError(name);
    if (registry.get(resolved) !== undefined) return resolved;

    let promise = pending.get(resolved);
    if (promise === undefined) {
      promise = (async () => {
        const language = await loadLanguageFn(resolved);
        registerAll(registry, language);
        return resolved;
      })();
      pending.set(resolved, promise);
    }
    return promise;
  };
}

/**
 * @param {unknown} error
 * @returns {{ name: string; message: string; language?: string }}
 */
function serializeError(error) {
  if (error instanceof LanguageLoadError) {
    return {
      name: error.name,
      message: error.message,
      language: error.language,
    };
  }
  const err = /** @type {{ name?: string; message?: string }} */ (error);
  return {
    name: err?.name ?? "Error",
    message: err?.message ?? String(error),
  };
}

/**
 * Installs an `onmessage` handler on `scope` that answers highlight and
 * streaming-session requests inside a worker (or any `postMessage`-shaped
 * target). Grammars register on demand the first time a language name is
 * seen, resolving aliases the same way `svelte-highlight/fence` does.
 * @param {PostMessageTarget} [scope]
 * @param {ServeHighlighterOptions} [options]
 */
export function serveHighlighter(
  scope = /** @type {any} */ (typeof self === "undefined" ? undefined : self),
  {
    registry = createRegistry(),
    loadLanguage:
      loadLanguageFn = /** @type {(name: string) => Promise<import("./languages/index.d.ts").LanguageType<string>>} */ (
      loadLanguage
    ),
  } = {},
) {
  const ensureLanguage = createLanguageResolver(registry, loadLanguageFn);
  /** @type {Map<number, import("./engine.d.ts").StreamSession>} */
  const sessions = new Map();

  /**
   * @param {number} sessionId
   * @returns {import("./engine.d.ts").StreamSession}
   */
  function getSession(sessionId) {
    const session = sessions.get(sessionId);
    if (session === undefined) throw new Error(`Unknown session: ${sessionId}`);
    return session;
  }

  /**
   * @param {any} msg
   * @returns {Promise<unknown>}
   */
  async function dispatch(msg) {
    switch (msg.op) {
      case "highlight": {
        const language = await ensureLanguage(msg.language);
        return registry.highlight(msg.code, { language });
      }
      case "tokenLines": {
        const language = await ensureLanguage(msg.language);
        const { events } = registry.tokenize(msg.code, language);
        return tokenLines(events);
      }
      case "loadLanguage": {
        const language = await ensureLanguage(msg.language);
        return { language };
      }
      case "session.create": {
        const language = await ensureLanguage(msg.language);
        sessions.set(msg.sessionId, registry.createSession(language));
        return undefined;
      }
      case "session.append": {
        getSession(msg.sessionId).append(msg.text);
        return undefined;
      }
      case "session.replace": {
        getSession(msg.sessionId).replace(msg.from, msg.to, msg.text);
        return undefined;
      }
      case "session.finish": {
        const session = getSession(msg.sessionId);
        const result = session.finish(msg.options);
        sessions.delete(msg.sessionId);
        return result;
      }
      case "session.snapshot": {
        const session = getSession(msg.sessionId);
        return { snapshot: session.snapshot(), events: session.events() };
      }
      default:
        throw new Error(`Unknown op: ${msg.op}`);
    }
  }

  // Processed strictly in arrival order: an async handler (e.g. one that
  // loads a grammar) must fully settle before the next message is handled,
  // so e.g. a session.create's registration always completes before a
  // subsequent session.append for the same session is processed.
  let queue = Promise.resolve();

  scope.onmessage = (event) => {
    const msg = event.data;
    queue = queue.then(async () => {
      try {
        const result = await dispatch(msg);
        scope.postMessage({ id: msg.id, result });
      } catch (error) {
        scope.postMessage({ id: msg.id, error: serializeError(error) });
      }
    });
  };
}

/**
 * @param {{ name: string; message: string; language?: string }} error
 * @returns {Error}
 */
function toError(error) {
  if (error.name === "LanguageLoadError") {
    return new LanguageLoadError(/** @type {string} */ (error.language));
  }
  return Object.assign(new Error(error.message), { name: error.name });
}

/**
 * @param {PostMessageTarget} worker
 * @returns {WorkerHighlighter}
 */
function createRemoteHighlighter(worker) {
  let nextId = 1;
  let nextSessionId = 1;
  /** @type {Map<number, { resolve: (value: any) => void; reject: (reason?: unknown) => void }>} */
  const pending = new Map();

  worker.onmessage = (event) => {
    const { id, result, error } = event.data;
    const callbacks = pending.get(id);
    if (callbacks === undefined) return;
    pending.delete(id);
    if (error) callbacks.reject(toError(error));
    else callbacks.resolve(result);
  };

  /**
   * @param {string} op
   * @param {Record<string, unknown>} payload
   * @returns {Promise<any>}
   */
  function send(op, payload) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, op, ...payload });
    });
  }

  /**
   * @param {string} language
   * @returns {WorkerSession}
   */
  function createSession(language) {
    const sessionId = nextSessionId++;
    const created = send("session.create", { sessionId, language });

    /** @type {{ text: string; promise: Promise<void>; resolve: () => void; reject: (reason?: unknown) => void } | null} */
    let pendingAppend = null;

    function flushAppend() {
      const batch = /** @type {NonNullable<typeof pendingAppend>} */ (
        pendingAppend
      );
      pendingAppend = null;
      created
        .then(() => send("session.append", { sessionId, text: batch.text }))
        .then(() => batch.resolve(), batch.reject);
    }

    return {
      append(chunk) {
        if (pendingAppend === null) {
          /** @type {() => void} */
          let resolveFn = () => {};
          /** @type {(reason?: unknown) => void} */
          let rejectFn = () => {};
          const promise = new Promise((resolve, reject) => {
            resolveFn = /** @type {() => void} */ (resolve);
            rejectFn = reject;
          });
          pendingAppend = {
            text: chunk,
            promise,
            resolve: resolveFn,
            reject: rejectFn,
          };
          queueMicrotask(flushAppend);
        } else {
          pendingAppend.text += chunk;
        }
        return pendingAppend.promise;
      },
      async replace(from, to, text) {
        if (pendingAppend) await pendingAppend.promise;
        await created;
        await send("session.replace", { sessionId, from, to, text });
      },
      async finish(options) {
        if (pendingAppend) await pendingAppend.promise;
        await created;
        return send("session.finish", { sessionId, options });
      },
      async snapshot() {
        if (pendingAppend) await pendingAppend.promise;
        await created;
        const { snapshot } = await send("session.snapshot", { sessionId });
        return snapshot;
      },
      async events() {
        if (pendingAppend) await pendingAppend.promise;
        await created;
        const { events } = await send("session.snapshot", { sessionId });
        return events;
      },
    };
  }

  return {
    highlight(code, language) {
      return send("highlight", { code, language });
    },
    tokenLines(code, language) {
      return send("tokenLines", { code, language });
    },
    createSession,
    terminate() {
      if (typeof worker.terminate === "function") worker.terminate();
      else worker.close?.();
    },
  };
}

/**
 * Same resolve-then-register logic as `createLanguageResolver`, but against
 * `svelte-highlight/registry`'s shared singleton via `ensureRegistered`
 * (which also registers a grammar's embedded sub-languages) instead of an
 * arbitrary registry + `registerAll`.
 * @type {Map<string, Promise<string>>}
 */
const localPending = new Map();

/**
 * @param {string} name
 * @returns {Promise<string>}
 */
async function ensureLocalLanguage(name) {
  const resolved = resolveLanguageName(name);
  if (resolved === undefined) throw new LanguageLoadError(name);
  if (sharedRegistry.get(resolved) !== undefined) return resolved;

  let promise = localPending.get(resolved);
  if (promise === undefined) {
    promise = (async () => {
      const language = await loadLanguage(
        /** @type {import("./languages/index.d.ts").LanguageName} */ (resolved),
      );
      ensureRegistered(language);
      return resolved;
    })();
    localPending.set(resolved, promise);
  }
  return promise;
}

/**
 * @returns {WorkerHighlighter}
 */
function createLocalHighlighter() {
  /**
   * @param {string} language
   * @returns {WorkerSession}
   */
  function createSession(language) {
    const sessionPromise = ensureLocalLanguage(language).then((resolved) =>
      sharedRegistry.createSession(resolved),
    );

    return {
      async append(chunk) {
        (await sessionPromise).append(chunk);
      },
      async replace(from, to, text) {
        (await sessionPromise).replace(from, to, text);
      },
      async finish(options) {
        return (await sessionPromise).finish(options);
      },
      async snapshot() {
        return (await sessionPromise).snapshot();
      },
      async events() {
        return (await sessionPromise).events();
      },
    };
  }

  return {
    async highlight(code, language) {
      const resolved = await ensureLocalLanguage(language);
      return sharedRegistry.highlight(code, { language: resolved });
    },
    async tokenLines(code, language) {
      const resolved = await ensureLocalLanguage(language);
      const { events } = sharedRegistry.tokenize(code, resolved);
      return tokenLines(events);
    },
    createSession,
    terminate() {},
  };
}

/**
 * The main-thread client for a `serveHighlighter` worker. Given a `worker`
 * (real `Worker`, or anything `postMessage`/`onmessage`-shaped), every call
 * round-trips through it. Given no `worker`, runs the identical API
 * in-process against `svelte-highlight/registry`'s shared singleton, so a
 * language loaded this way is visible to `<Highlight>` on the same page —
 * the SSR/tests fallback.
 * @param {PostMessageTarget} [worker]
 * @returns {WorkerHighlighter}
 */
export function createWorkerHighlighter(worker) {
  return worker ? createRemoteHighlighter(worker) : createLocalHighlighter();
}
