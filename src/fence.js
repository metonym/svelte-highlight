import { escapeHtml, scopeToCssClass, tokenLines } from "./engine.js";
import { loadLanguage } from "./load-language.js";
import { ensureRegistered, registry } from "./registry.js";

/**
 * @typedef {import("./fence.d.ts").ParsedMeta} ParsedMeta
 */

const TOKEN_RE = /(\w+)="([^"]*)"|(\w+)=\{([^}]*)\}|\{([^}]*)\}|(\w+)/g;

/**
 * Expands a comma-separated `1,3-5` range string into individual 1-indexed
 * line numbers.
 * @param {string} ranges
 * @returns {number[]}
 */
function parseRanges(ranges) {
  /** @type {number[]} */
  const lines = [];
  for (const part of ranges.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [startStr, endStr] = trimmed.split("-");
    const start = Number(startStr);
    const end = endStr === undefined ? start : Number(endStr);
    if (!Number.isInteger(start) || !Number.isInteger(end)) continue;
    for (let line = start; line <= end; line += 1) lines.push(line);
  }
  return lines;
}

/**
 * @param {string} meta
 * @returns {ParsedMeta}
 */
export function parseMeta(meta) {
  /** @type {ParsedMeta} */
  const result = { lines: {} };

  for (const match of meta.matchAll(TOKEN_RE)) {
    const [
      ,
      titleKey,
      titleValue,
      stateKey,
      stateRanges,
      bareRanges,
      bareWord,
    ] = match;

    if (titleKey !== undefined) {
      if (titleKey === "title") result.title = titleValue ?? "";
      continue;
    }

    if (stateKey !== undefined) {
      if (stateKey !== "mark" && stateKey !== "ins" && stateKey !== "del")
        continue;
      for (const line of parseRanges(stateRanges ?? ""))
        result.lines[line] = stateKey;
      continue;
    }

    if (bareRanges !== undefined) {
      for (const line of parseRanges(bareRanges)) result.lines[line] = "mark";
      continue;
    }

    if (bareWord === "showLineNumbers") result.showLineNumbers = true;
  }

  return result;
}

/** @param {string} value */
function escapeAttribute(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * @param {import("./engine.d.ts").LineToken} token
 */
function renderToken(token) {
  let html = escapeHtml(token.text);
  for (let i = token.scopes.length - 1; i >= 0; i -= 1) {
    const scope = /** @type {string} */ (token.scopes[i]);
    html = `<span class="${scopeToCssClass(scope, "hljs-")}">${html}</span>`;
  }
  return html;
}

/**
 * @param {{ code: string; lang: string; meta?: string }} options
 * @returns {Promise<string>}
 */
export async function highlightFence({ code, lang, meta }) {
  const language = await loadLanguage(
    /** @type {import("./languages").LanguageName} */ (lang),
  );
  ensureRegistered(language);
  const { events } = registry.highlight(code, { language: lang });
  const parsedMeta = meta === undefined ? undefined : parseMeta(meta);

  const lines = tokenLines(events)
    .map((tokens, index) => {
      const state = parsedMeta?.lines[index + 1];
      const stateAttr = state ? ` data-line-state="${state}"` : "";
      return `<span class="line"${stateAttr}>${tokens.map(renderToken).join("")}</span>`;
    })
    .join("\n");

  const titleAttr =
    parsedMeta?.title === undefined
      ? ""
      : ` data-title="${escapeAttribute(parsedMeta.title)}"`;
  const showLineNumbersAttr = parsedMeta?.showLineNumbers
    ? ' data-show-line-numbers="true"'
    : "";

  return (
    `<pre class="hljs" data-language="${escapeAttribute(lang)}"${titleAttr}${showLineNumbersAttr}>` +
    `<code class="hljs">${lines}</code></pre>`
  );
}
