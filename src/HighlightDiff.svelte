<script>
  import { diffLines, parseUnifiedDiff } from "./diff.js";
  import { escapeHtml, scopeToCssClass, tokenLines } from "./engine.js";
  import LineNumbers from "./LineNumbers.svelte";
  import { ensureRegistered, registry } from "./registry.js";

  /** @type {string | undefined} */
  export let diff = undefined;

  /** @type {string | undefined} */
  export let before = undefined;

  /** @type {string | undefined} */
  export let after = undefined;

  /** @type {import("./languages").LanguageType<string>} */
  export let language;

  /** @type {"both" | "new" | "unified" | "none"} */
  export let gutter = "both";

  /** @type {number} */
  export let context = Number.POSITIVE_INFINITY;

  /** @type {boolean} */
  export let hunkHeaders = true;

  const ADDED_BACKGROUND = "rgba(46, 204, 113, 0.15)";
  const REMOVED_BACKGROUND = "rgba(231, 76, 60, 0.15)";
  const MARKER_TEXT = { add: "+", del: "-", ctx: " " };

  /** @type {Set<string>} */
  let expandedRuns = new Set();

  /** @type {string[]} */
  let lines = [];
  /** @type {(number | null)[]} */
  let numbers = [];
  /** @type {(number | null)[] | undefined} */
  let secondaryNumbers;
  /** @type {Record<number, "added" | "removed">} */
  let lineStates = {};

  /**
   * Local copy of fence.js's unexported renderToken -- escapes the token
   * text and wraps it in a `<span class="hljs-...">` per open scope,
   * innermost first.
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

  /** @param {import("./engine.d.ts").LineToken[]} tokens */
  function renderLine(tokens) {
    return tokens.map(renderToken).join("");
  }

  /** @param {string} text */
  function tokenizeText(text) {
    const { events } = registry.highlight(text, { language: language.name });
    return tokenLines(events);
  }

  /** @param {"add" | "del" | "ctx"} type */
  function markerSpan(type) {
    return `<span class="shl-diff-marker" data-diff="${type}" aria-hidden="true">${MARKER_TEXT[type]}</span>`;
  }

  /**
   * @param {string | undefined} diff
   * @param {string | undefined} before
   * @param {string | undefined} after
   * @returns {import("./diff.d.ts").DiffFile[]}
   */
  function getFiles(diff, before, after) {
    if (diff !== undefined) return parseUnifiedDiff(diff).files;
    if (before !== undefined || after !== undefined) {
      return [
        {
          oldPath: undefined,
          newPath: undefined,
          hunks: [diffLines(before ?? "", after ?? "")],
        },
      ];
    }
    return [];
  }

  /** @param {import("./diff.d.ts").DiffFile} file */
  function fileHeaderText(file) {
    if (file.oldPath === undefined && file.newPath === undefined) return null;
    return `${file.oldPath ?? file.newPath} → ${file.newPath ?? file.oldPath}`;
  }

  /**
   * Builds the four parallel arrays `LineNumbers` needs: one entry per
   * rendered row (a code line, a collapsed run, or a hunk/file header).
   * @param {import("./diff.d.ts").DiffFile[]} files
   * @param {Set<string>} expandedRuns
   */
  function buildRows(files, expandedRuns) {
    /** @type {string[]} */
    const lines = [];
    /** @type {(number | null)[]} */
    const numbers = [];
    /** @type {(number | null)[] | undefined} */
    const secondaryNumbers = gutter === "both" ? [] : undefined;
    /** @type {Record<number, "added" | "removed">} */
    const lineStates = {};

    /**
     * @param {string} html
     * @param {number | null} newNumber
     * @param {number | null} oldNumber
     * @param {"added" | "removed" | undefined} state
     */
    const pushRow = (html, newNumber, oldNumber, state) => {
      const index = lines.length;
      lines.push(html);
      if (gutter === "none") numbers.push(null);
      else if (gutter === "unified") numbers.push(newNumber ?? oldNumber);
      else numbers.push(newNumber);
      secondaryNumbers?.push(oldNumber);
      if (state) lineStates[index] = state;
    };

    /** @param {string} text */
    const pushHeader = (text) => {
      pushRow(
        `<span class="shl-diff-hunk" aria-hidden="true">${escapeHtml(text)}</span>`,
        null,
        null,
        undefined,
      );
    };

    files.forEach((file, fileIndex) => {
      const headerText = fileHeaderText(file);
      if (hunkHeaders && headerText !== null) pushHeader(headerText);

      file.hunks.forEach((hunk, hunkIndex) => {
        if (hunkHeaders) pushHeader(hunk.header);

        const beforeText = hunk.lines
          .filter((l) => l.type !== "add")
          .map((l) => l.text)
          .join("\n");
        const afterText = hunk.lines
          .filter((l) => l.type !== "del")
          .map((l) => l.text)
          .join("\n");
        const beforeTokLines = tokenizeText(beforeText);
        const afterTokLines = tokenizeText(afterText);

        let oldLine = hunk.oldStart;
        let newLine = hunk.newStart;
        let beforeIdx = 0;
        let afterIdx = 0;

        const meta = hunk.lines.map((diffLine) => {
          /** @type {number | null} */
          let oldNumber = null;
          /** @type {number | null} */
          let newNumber = null;
          /** @type {"added" | "removed" | undefined} */
          let state;
          /** @type {string} */
          let html;
          if (diffLine.type === "ctx") {
            oldNumber = oldLine++;
            newNumber = newLine++;
            // A ctx line occupies a slot in both the before and after
            // reconstructions, so both indices must advance even though its
            // HTML is only read from one of them -- otherwise a later add
            // line reads a stale (pre-ctx) afterTokLines slot.
            html = renderLine(
              /** @type {import("./engine.d.ts").LineToken[]} */ (
                beforeTokLines[beforeIdx++]
              ),
            );
            afterIdx++;
          } else if (diffLine.type === "del") {
            oldNumber = oldLine++;
            state = "removed";
            html = renderLine(
              /** @type {import("./engine.d.ts").LineToken[]} */ (
                beforeTokLines[beforeIdx++]
              ),
            );
          } else {
            newNumber = newLine++;
            state = "added";
            html = renderLine(
              /** @type {import("./engine.d.ts").LineToken[]} */ (
                afterTokLines[afterIdx++]
              ),
            );
          }
          return {
            type: diffLine.type,
            oldNumber,
            newNumber,
            state,
            html: markerSpan(diffLine.type) + html,
          };
        });

        let i = 0;
        while (i < meta.length) {
          const row = /** @type {(typeof meta)[number]} */ (meta[i]);
          if (row.type === "ctx") {
            let j = i;
            while (
              j < meta.length &&
              /** @type {(typeof meta)[number]} */ (meta[j]).type === "ctx"
            ) {
              j++;
            }
            const runLength = j - i;
            const runId = `${fileIndex}-${hunkIndex}-${i}`;
            if (runLength > context && !expandedRuns.has(runId)) {
              pushRow(
                `<button type="button" class="shl-diff-collapsed" data-diff-collapsed data-run="${runId}">${runLength} unchanged lines</button>`,
                null,
                null,
                undefined,
              );
            } else {
              for (let k = i; k < j; k++) {
                const m = /** @type {(typeof meta)[number]} */ (meta[k]);
                pushRow(m.html, m.newNumber, m.oldNumber, m.state);
              }
            }
            i = j;
          } else {
            pushRow(row.html, row.newNumber, row.oldNumber, row.state);
            i++;
          }
        }
      });
    });

    return { lines, numbers, secondaryNumbers, lineStates };
  }

  /** @param {MouseEvent} event */
  function handleClick(event) {
    const target = /** @type {HTMLElement | null} */ (event.target);
    const button = target?.closest("[data-diff-collapsed]");
    if (!button) return;
    const runId = button.getAttribute("data-run");
    if (runId == null) return;
    expandedRuns = new Set(expandedRuns).add(runId);
  }

  $: files = getFiles(diff, before, after);
  $: {
    ensureRegistered(language);
    ({ lines, numbers, secondaryNumbers, lineStates } = buildRows(
      files,
      expandedRuns,
    ));
  }
</script>

<!-- The only interactive elements inside are real <button>s (already
     keyboard-operable); this div only delegates their click events. -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div on:click={handleClick}>
  <LineNumbers
    {...$$restProps}
    {lines}
    {numbers}
    {secondaryNumbers}
    {lineStates}
    languageName={language.name}
    style="--line-added-background: var(--diff-add-background, {ADDED_BACKGROUND}); --line-removed-background: var(--diff-del-background, {REMOVED_BACKGROUND})"
  />
</div>

<style>
  div {
    display: contents;
  }

  :global(.shl-diff-marker) {
    user-select: none;
    color: var(--diff-marker-color, currentColor);
  }

  :global(.shl-diff-hunk) {
    user-select: none;
    background: var(--diff-hunk-background, transparent);
    color: var(--diff-hunk-color, inherit);
  }

  :global(.shl-diff-collapsed) {
    all: unset;
    cursor: pointer;
    user-select: none;
    color: var(--diff-collapsed-color, inherit);
  }
</style>
