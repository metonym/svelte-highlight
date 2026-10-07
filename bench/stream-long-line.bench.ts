/** stream-preview.js on a newline-free stream (worst case: O(line) per chunk). */
import { group, task } from "ostia";
import { computeStagedTailPreview } from "../src/stream-preview.js";
import { buildRegistry } from "./_shared.ts";

const registry = await buildRegistry();
const LANGUAGE = "json";
const CHUNK_SIZE = 1_000;

function longLineJson(targetLength: number) {
  const items: string[] = [];
  let length = 2; // "[]"
  let i = 0;
  while (length < targetLength) {
    const item = JSON.stringify({
      id: i,
      name: `item-${i}`,
      active: i % 2 === 0,
      tags: ["a", "b", "c"],
      nested: { value: i * 2, ratio: i / 3 },
    });
    items.push(item);
    length += item.length + 1; // + comma
    i++;
  }
  return `[${items.join(",")}]`;
}

const SIZES = [200_000, 1_000_000];

function streamPreview(code: string) {
  const session = registry.createSession(LANGUAGE);
  let fedCode = "";
  const openScopes: string[] = [];
  const pendingHtml = "";
  let cache: Parameters<typeof computeStagedTailPreview>[0]["cache"];

  for (let i = 0; i < code.length; i += CHUNK_SIZE) {
    const chunk = code.slice(i, i + CHUNK_SIZE);
    session.append(chunk);
    fedCode += chunk;

    ({ cache } = computeStagedTailPreview({
      registry,
      language: LANGUAGE,
      session,
      fedCode,
      openScopes,
      pendingHtml,
      cache,
    }));
  }
}

function streamAppend(code: string) {
  const session = registry.createSession(LANGUAGE);
  for (let i = 0; i < code.length; i += CHUNK_SIZE) {
    session.append(code.slice(i, i + CHUNK_SIZE));
  }
  return session.events().length;
}

for (const size of SIZES) {
  const code = longLineJson(size);
  const label = `${size / 1_000} KB`;
  group(`stream-preview.js: ${label} single-line JSON, 1 KB chunks`, () => {
    task("computeStagedTailPreview() per chunk", () => streamPreview(code));
    task("session.append() per chunk", () => streamAppend(code));
    task("reference: one-shot registry.highlight()", () =>
      registry.highlight(code, { language: LANGUAGE }),
    );
  });
}
