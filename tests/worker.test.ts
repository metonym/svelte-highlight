import { createRegistry, registerAll, tokenLines } from "../src/engine.js";
import { LanguageLoadError } from "../src/load-language.js";
import type { PostMessageTarget, WorkerHighlighter } from "../src/worker.d.ts";
import { createWorkerHighlighter, serveHighlighter } from "../src/worker.js";

function makeSpyWorker() {
  const { port1, port2 } = new MessageChannel();
  serveHighlighter(port1 as unknown as PostMessageTarget);
  const sent: Record<string, unknown>[] = [];
  const spyWorker = {
    postMessage: (msg: unknown, transfer?: Transferable[]) => {
      sent.push(msg as Record<string, unknown>);
      if (transfer) port2.postMessage(msg, transfer);
      else port2.postMessage(msg);
    },
    set onmessage(fn: ((event: MessageEvent) => void) | null) {
      port2.onmessage = fn;
    },
    terminate: () => port2.close(),
  } as unknown as PostMessageTarget;
  return { sent, spyWorker };
}

async function referenceHighlight(code: string, name: string) {
  const registry = createRegistry();
  const language = (await import(`../src/languages/${name}.js`)).default;
  registerAll(registry, language);
  return registry.highlight(code, { language: name });
}

async function referenceTokenLines(code: string, name: string) {
  const registry = createRegistry();
  const language = (await import(`../src/languages/${name}.js`)).default;
  registerAll(registry, language);
  const { events } = registry.tokenize(code, name);
  return tokenLines(events);
}

const SAMPLES: Record<string, string> = {
  // biome-ignore lint/suspicious/noTemplateCurlyInString: `${name}` is TypeScript source text being highlighted, not a JS template placeholder
  typescript: "const greet = (name: string): string => `Hi, ${name}`;",
  python: "def greet(name):\n    return f'Hi, {name}'",
  css: ".a { color: red; }\n.b::before { content: 'x'; }",
};

describe("createWorkerHighlighter", () => {
  for (const mode of ["worker", "local"] as const) {
    describe(`${mode} mode`, () => {
      function getHighlighter(): WorkerHighlighter {
        if (mode === "worker") {
          const { spyWorker } = makeSpyWorker();
          return createWorkerHighlighter(spyWorker);
        }
        return createWorkerHighlighter();
      }

      for (const name of Object.keys(SAMPLES)) {
        it(`highlight() and tokenLines() match a direct registry for ${name}`, async () => {
          const h = getHighlighter();
          const code = /** @type {string} */ (SAMPLES[name] as string);

          const result = await h.highlight(code, name);
          const reference = await referenceHighlight(code, name);
          expect(result).toEqual(reference);

          const lines = await h.tokenLines(code, name);
          const referenceLines = await referenceTokenLines(code, name);
          expect(lines).toEqual(referenceLines);

          h.terminate();
        });
      }

      it("rejects LanguageLoadError for an unknown language", async () => {
        const h = getHighlighter();
        let error: unknown;
        try {
          await h.highlight("code", "not-a-real-language");
        } catch (err) {
          error = err;
        }
        expect(error).toBeInstanceOf(LanguageLoadError);
        expect((error as LanguageLoadError).language).toBe(
          "not-a-real-language",
        );
        h.terminate();
      });

      it("session append/replace/finish matches a direct StreamSession", async () => {
        const h = getHighlighter();
        const session = h.createSession("typescript");

        await session.append("const a = 1;");
        await session.append("\nconst b = 2;");

        const snapshotBeforeFinish = await session.snapshot();
        const eventsBeforeFinish = await session.events();
        expect(snapshotBeforeFinish).toBeTruthy();
        expect(Array.isArray(eventsBeforeFinish)).toBe(true);

        await session.replace(0, 5, "let");

        const result = await session.finish();

        const registry = createRegistry();
        const typescript = (await import("../src/languages/typescript.js"))
          .default;
        registerAll(registry, typescript);
        const reference = registry.createSession("typescript");
        reference.append("const a = 1;");
        reference.append("\nconst b = 2;");
        reference.replace(0, 5, "let");
        const referenceResult = reference.finish();

        expect(result).toEqual(referenceResult);
        h.terminate();
      });

      it("terminate() does not throw", () => {
        const h = getHighlighter();
        expect(() => h.terminate()).not.toThrow();
      });
    });
  }

  it("batches synchronous append() calls into one session.append message", async () => {
    const { sent, spyWorker } = makeSpyWorker();
    const h = createWorkerHighlighter(spyWorker);
    const session = h.createSession("typescript");

    const promises = [
      session.append("a"),
      session.append("b"),
      session.append("c"),
    ];
    await Promise.all(promises);

    const appendMessages = sent.filter((m) => m.op === "session.append");
    expect(appendMessages).toHaveLength(1);
    expect(appendMessages[0]?.text).toBe("abc");

    h.terminate();
  });
});
