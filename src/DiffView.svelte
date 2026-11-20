<script>
  /**
   * A controller from `createDiffController`.
   * @type {import("./diff-controller.js").DiffController}
   */
  export let diff;

  /** While streaming, keep the newest row in view. */
  export let follow = true;

  /** Show accept/reject controls per change (or fill the `actions` slot). */
  export let review = false;

  /** Wrap long lines instead of scrolling sideways. */
  export let wrap = false;

  /** @type {"default" | "colorblind"} */
  export let palette = "default";

  /** Extra rows rendered above and below the viewport. */
  export let overscan = 10;

  /** Handle n/p/e/c/v (and a/r/u with `review`) when focused. */
  export let keyboard = true;

  /**
   * Render only the rows in view. `"auto"` virtualizes past 500 rows, so
   * small diffs keep browser find, printing, and server rendering.
   * @type {"auto" | boolean}
   */
  export let virtualize = "auto";

  import { afterUpdate, onMount, tick } from "svelte";
  import { watchLineHeight } from "./virtual-window.js";

  $: ({ class: _class, style: _style, ...rest } = $$restProps);

  /** @type {HTMLElement} */
  let container;
  /** @type {HTMLElement} */
  let windowEl;
  /** @type {HTMLElement} */
  let probe;
  /** @type {HTMLElement} */
  let charProbe;
  /** @type {HTMLElement | undefined} */
  let hbarOld;
  /** @type {HTMLElement | undefined} */
  let hbarNew;

  let lineHeight = 18;
  let charWidth = 8;
  let codeWidth = 0;
  let scrollTop = 0;
  let clientHeight = 600;
  let clientWidth = 0;
  let scrollOld = 0;
  let scrollNew = 0;
  let hydrated = false;
  let userScrolled = false;

  /** @type {"old" | "new" | null} */
  let selectSide = null;

  $: options = $diff.options();
  $: view = options.view;
  $: state = $diff.state();
  $: rows = $diff.rows();
  $: columns = $diff.columns();
  $: decisions = $diff.decisions();
  $: current = $diff.current();

  // --- row heights ---
  //
  // Rows are estimated, then measured once rendered. Measured heights are
  // cached by row key until something that changes them does: wrapping,
  // the view, the width, notes, or a new (not just grown) document.

  /** @type {Map<string, number>} */
  let measured = new Map();
  let layoutVersion = 0;

  function resetHeights() {
    measured = new Map();
    layoutVersion++;
  }

  /** @type {unknown[]} */
  let heightDeps = [];
  $: {
    const next = [
      wrap,
      view,
      options.annotations,
      lineHeight,
      state.streaming ? null : state,
    ];
    if (wrap) next.push(clientWidth);
    if (next.some((v, i) => v !== heightDeps[i])) {
      heightDeps = next;
      resetHeights();
    }
  }

  /** @param {import("./diff-controller.js").ViewRow} row */
  function textLength(row) {
    const oldLen =
      row.old === undefined ? 0 : (state.beforeLines[row.old]?.length ?? 0);
    const newLen =
      row.new === undefined
        ? 0
        : row.kind === "incoming"
          ? (state.partial?.length ?? 0)
          : (state.afterLines[row.new]?.length ?? 0);
    if (view === "split") return Math.max(oldLen, newLen);
    return row.kind === "del" ? oldLen : newLen;
  }

  /** @param {import("./diff-controller.js").ViewRow} row */
  function estimate(row) {
    if (row.note)
      return (row.note.body.split("\n").length + 1) * lineHeight + 6;
    if (!wrap || row.kind === "fold" || row.kind === "pending")
      return lineHeight;
    const perLine = Math.max(1, Math.floor((codeWidth || 600) / charWidth));
    return lineHeight * Math.max(1, Math.ceil(textLength(row) / perLine));
  }

  $: offsets = (() => {
    void layoutVersion;
    const out = new Float64Array(rows.length + 1);
    for (let i = 0; i < rows.length; i++) {
      const row = /** @type {import("./diff-controller.js").ViewRow} */ (
        rows[i]
      );
      out[i + 1] =
        /** @type {number} */ (out[i]) +
        (measured.get(row.key) ?? estimate(row));
    }
    return out;
  })();
  $: total = /** @type {number} */ (offsets[rows.length] ?? 0);

  /** Last row whose top is at or above `px`. */
  function indexAt(
    /** @type {number} */ px,
    /** @type {Float64Array} */ table = offsets,
  ) {
    let lo = 0;
    let hi = rows.length - 1;
    let found = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (/** @type {number} */ (table[mid]) <= px) {
        found = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return found;
  }

  $: virtualized = virtualize === "auto" ? rows.length > 500 : virtualize;
  $: start = virtualized
    ? Math.max(0, indexAt(scrollTop, offsets) - overscan)
    : 0;
  $: end = virtualized
    ? Math.min(
        rows.length,
        indexAt(scrollTop + clientHeight, offsets) + 1 + overscan,
      )
    : rows.length;
  $: visible = $diff.renderRows(start, end);
  $: windowTop = /** @type {number} */ (offsets[start] ?? 0);

  $: if (hydrated) {
    void offsets;
    diff.setViewport(indexAt(scrollTop), indexAt(scrollTop + clientHeight) + 1);
  }

  // Measure rendered rows. Growth above the first visible row shifts
  // scrollTop by the same amount, so the content under the reader stays put.
  afterUpdate(() => {
    if (!windowEl || !container) return;
    const anchor = indexAt(container.scrollTop);
    let changed = false;
    let shift = 0;
    for (const el of /** @type {HTMLElement[]} */ ([...windowEl.children])) {
      const key = el.dataset.key;
      const index = Number(el.dataset.index);
      if (key === undefined || Number.isNaN(index)) continue;
      const height = el.getBoundingClientRect().height;
      const used =
        /** @type {number} */ (offsets[index + 1]) -
        /** @type {number} */ (offsets[index]);
      if (Math.abs(height - used) > 0.5) {
        measured.set(key, height);
        changed = true;
        if (index < anchor) shift += height - used;
      }
    }
    const cell = /** @type {HTMLElement | null} */ (
      windowEl.querySelector(".shl-diff-code")
    );
    if (cell && cell.clientWidth > 0) codeWidth = cell.clientWidth;
    if (!changed) return;
    layoutVersion++;
    if (shift !== 0) {
      container.scrollTop += shift;
      scrollTop = container.scrollTop;
    }
  });

  /** @param {number} row @param {"start" | "center" | "third"} align */
  function scrollToRow(row, align) {
    if (!container) return;
    const top = /** @type {number} */ (
      offsets[Math.max(0, Math.min(row, rows.length))] ?? 0
    );
    const offset =
      align === "center"
        ? container.clientHeight / 2
        : align === "third"
          ? container.clientHeight / 3
          : 0;
    container.scrollTop = Math.max(0, top - offset);
    scrollTop = container.scrollTop;
  }

  /** @type {number | undefined} */
  let frame;
  function onScroll() {
    if (frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (container) scrollTop = container.scrollTop;
    });
  }

  /** @param {WheelEvent} event */
  function onWheel(event) {
    const dx =
      event.shiftKey && event.deltaX === 0 ? event.deltaY : event.deltaX;
    if (
      dx === 0 ||
      (Math.abs(dx) < Math.abs(event.deltaY) && !event.shiftKey)
    ) {
      userScrolled = true;
      return;
    }
    if (wrap) return;
    const side = /** @type {HTMLElement} */ (event.target)
      .closest?.("[data-side]")
      ?.getAttribute("data-side");
    const bar = view === "split" && side === "old" ? hbarOld : hbarNew;
    if (!bar) return;
    event.preventDefault();
    bar.scrollLeft += dx;
  }

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    if (!keyboard || event.metaKey || event.ctrlKey || event.altKey) return;
    if (
      /** @type {HTMLElement} */ (event.target).closest(
        "button, input, textarea",
      )
    )
      return;
    const key = event.key;
    if (key === "n" || key === "]" || key === "j") diff.nextChange();
    else if (key === "p" || key === "[" || key === "k") diff.prevChange();
    else if (key === "e") diff.expandAll();
    else if (key === "c") diff.collapseAll();
    else if (key === "v")
      diff.setOptions({ view: view === "split" ? "unified" : "split" });
    else if (review && current >= 0 && key === "a")
      diff.decide(current, "accepted");
    else if (review && current >= 0 && key === "r")
      diff.decide(current, "rejected");
    else if (review && current >= 0 && key === "u")
      diff.decide(current, undefined);
    else return;
    event.preventDefault();
  }

  /** @param {MouseEvent} event */
  function onMousedown(event) {
    const side = /** @type {HTMLElement} */ (event.target)
      .closest?.("[data-side]")
      ?.getAttribute("data-side");
    selectSide =
      view === "split" && (side === "old" || side === "new") ? side : null;
  }

  // --- copy ---

  /**
   * Copies one file's text: in split view, the side the selection started
   * on; in unified view, the new text, or the old text if only removed lines
   * are selected. Fully selected lines come from the source, so tabs and
   * carriage returns survive.
   * @param {ClipboardEvent} event
   */
  function onCopy(event) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
      return;
    const range = selection.getRangeAt(0);
    /** @type {Array<{ row: import("./diff-controller.js").ViewRow, el: HTMLElement }>} */
    const picked = [];
    for (const el of /** @type {HTMLElement[]} */ ([...windowEl.children])) {
      const item = visible[Number(el.dataset.index) - start];
      if (!item || !range.intersectsNode(el)) continue;
      const kind = item.row.kind;
      if (kind === "fold" || kind === "pending" || item.row.note) continue;
      picked.push({ row: item.row, el });
    }
    if (picked.length < 2) return;

    /** @type {"old" | "new"} */
    let side = "new";
    if (view === "split") side = selectSide ?? "new";
    else if (picked.every(({ row }) => row.kind === "del")) side = "old";

    /** @type {string[]} */
    const lines = [];
    for (const { row, el } of picked) {
      if (
        view === "unified" &&
        (side === "new" ? row.kind === "del" : row.kind !== "del")
      )
        continue;
      const index = side === "old" ? row.old : row.new;
      if (index === undefined) continue;
      const cell = el.querySelector(
        view === "split"
          ? `.shl-diff-code[data-side="${side}"] .shl-diff-text`
          : ".shl-diff-code .shl-diff-text",
      );
      if (!cell) continue;
      const whole = document.createRange();
      whole.selectNodeContents(cell);
      const startsInside =
        range.compareBoundaryPoints(Range.START_TO_START, whole) > 0;
      const endsInside =
        range.compareBoundaryPoints(Range.END_TO_END, whole) < 0;
      if (!startsInside && !endsInside) {
        const source =
          side === "old"
            ? state.beforeLines[index]
            : row.kind === "incoming"
              ? state.partial
              : state.afterLines[index];
        lines.push(source ?? "");
        continue;
      }
      const part = whole.cloneRange();
      if (startsInside) part.setStart(range.startContainer, range.startOffset);
      if (endsInside) part.setEnd(range.endContainer, range.endOffset);
      lines.push(part.toString().replace(/\u200b/g, ""));
    }
    if (lines.length === 0 || !event.clipboardData) return;
    event.clipboardData.setData("text/plain", lines.join("\n"));
    event.preventDefault();
  }

  // Follow the streaming frontier unless the reader scrolled away.
  let followQueued = false;
  function followFrontier() {
    if (
      followQueued ||
      !hydrated ||
      !state.streaming ||
      !follow ||
      userScrolled
    )
      return;
    followQueued = true;
    requestAnimationFrame(() => {
      followQueued = false;
      if (!container) return;
      const frontier = rows.findIndex(
        (r) => r.kind === "incoming" || r.kind === "pending",
      );
      const index = frontier === -1 ? rows.length - 1 : frontier;
      const top = /** @type {number} */ (offsets[index] ?? 0);
      const max = Math.max(0, total - container.clientHeight);
      const target = Math.min(
        max,
        Math.max(0, top - container.clientHeight * 0.6),
      );
      if (Math.abs(container.scrollTop - target) > lineHeight)
        container.scrollTop = target;
    });
  }
  $: if (rows) followFrontier();
  $: if (!state.streaming) userScrolled = false;

  /** @param {import("./diff-controller.js").ViewRow} row */
  function rowLabel(row) {
    if (row.kind === "del") return `Removed line ${(row.old ?? 0) + 1}`;
    if (row.kind === "add") return `Added line ${(row.new ?? 0) + 1}`;
    if (row.kind === "change") {
      const parts = [];
      if (row.old !== undefined) parts.push(`removed line ${row.old + 1}`);
      if (row.new !== undefined) parts.push(`added line ${row.new + 1}`);
      return parts.join(", ");
    }
    return undefined;
  }

  /** @param {import("./diff-controller.js").ViewRow} row */
  function moveTitle(row) {
    if (row.movedTo !== undefined) return `Moved to line ${row.movedTo + 1}`;
    if (row.movedFrom !== undefined)
      return `Moved from line ${row.movedFrom + 1}`;
    return undefined;
  }

  /**
   * Without `wrap`, code rows are exactly one line tall.
   * @param {import("./diff-controller.js").ViewRow} row
   * @param {boolean} wrapped
   * @param {number} height
   */
  function rowStyle(row, wrapped, height) {
    return wrapped || row.note
      ? `min-height: ${height}px;`
      : `height: ${height}px;`;
  }

  onMount(() => {
    watchLineHeight(
      () => probe,
      () => lineHeight,
      (height) => (lineHeight = height),
    );
    tick().then(() => {
      if (charProbe)
        charWidth = charProbe.getBoundingClientRect().width / 10 || charWidth;
    });
    hydrated = true;
    clientHeight = container.clientHeight;
    clientWidth = container.clientWidth;
    const observer = new ResizeObserver(() => {
      if (!container) return;
      clientHeight = container.clientHeight;
      clientWidth = container.clientWidth;
    });
    observer.observe(container);
    const offReveal = diff.on("reveal", ({ row, align }) =>
      scrollToRow(row, align),
    );
    return () => {
      observer.disconnect();
      offReveal();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<section
  class="shl-diff shl-diff-theme {_class ?? ""}"
  class:shl-diff-split={view === "split"}
  class:shl-diff-colorblind={palette === "colorblind"}
  class:shl-diff-streaming={state.streaming}
  class:shl-diff-wrap={wrap}
  data-select={selectSide}
  aria-label="Diff: {$diff.stats().additions} additions, {$diff.stats()
    .deletions} deletions"
  tabindex="0"
  {...rest}
  style="--shl-diff-gutter: {columns.gutter}ch; --shl-diff-line: {lineHeight}px; tab-size: {options.tabSize}; {_style ??
    ""}"
  on:keydown={onKeydown}
  on:mousedown={onMousedown}
  on:copy={onCopy}
>
  <div class="shl-diff-frame hljs">
    <div
      class="shl-diff-body"
      bind:this={container}
      on:scroll={onScroll}
      on:wheel={onWheel}
      role="table"
      aria-rowcount={rows.length}
    >
      <div
        class="shl-diff-sizer"
        style={virtualized ? `height: ${total}px;` : undefined}
      >
        <div
          bind:this={windowEl}
          class="shl-diff-window"
          class:shl-diff-window-flat={!virtualized}
          style={virtualized
            ? `transform: translateY(${windowTop}px);`
            : undefined}
        >
          {#each visible as item (item.row.key)}
            {@const row = item.row}
            {@const decision =
              row.change === undefined ? undefined : decisions.get(row.change)}
            <div
              class="shl-diff-row shl-diff-{row.kind}"
              class:shl-diff-moved={row.moved !== undefined}
              class:shl-diff-current={row.change !== undefined &&
                row.change === current}
              class:shl-diff-accepted={decision === "accepted"}
              class:shl-diff-rejected={decision === "rejected"}
              class:shl-diff-unpaired-old={row.kind === "change" &&
                row.old === undefined}
              class:shl-diff-unpaired-new={row.kind === "change" &&
                row.new === undefined}
              style={rowStyle(row, wrap, lineHeight)}
              data-key={row.key}
              data-index={item.index}
              role="row"
              aria-rowindex={item.index + 1}
              aria-label={rowLabel(row)}
              title={moveTitle(row)}
            >
              {#if row.kind === "fold" && row.fold}
                <slot
                  name="fold"
                  fold={row.fold}
                  count={row.count}
                  toggle={() => diff.toggleFold(row.key)}
                >
                  {#if row.fold.unknown}
                    <span class="shl-diff-fold-label">
                      <span class="shl-diff-fold-icon" aria-hidden="true"
                        >⋯</span
                      >
                      {`${row.count} lines not in patch`}
                      <span class="shl-diff-hunk">{row.fold.header}</span>
                    </span>
                  {:else}
                    <button
                      type="button"
                      class="shl-diff-fold-label"
                      on:click={() => diff.toggleFold(row.key)}
                    >
                      <span class="shl-diff-fold-icon" aria-hidden="true"
                        >↕</span
                      >
                      {`Expand ${row.count} unchanged ${row.count === 1 ? "line" : "lines"}`}
                      <span class="shl-diff-hunk">{row.fold.header}</span>
                    </button>
                  {/if}
                </slot>
              {:else if row.kind === "pending"}
                <span class="shl-diff-fold-label">
                  <span class="shl-diff-spinner" aria-hidden="true"></span>
                  {`${row.count} ${row.count === 1 ? "line" : "lines"} not reached yet`}
                </span>
              {:else if row.note}
                <div class="shl-diff-note-slot">
                  <slot name="note" note={row.note}>
                    <div
                      class="shl-diff-note-card shl-diff-note-{row.note.tone ??
                        "info"}"
                    >
                      {#if row.note.author}
                        <strong>{row.note.author}</strong>
                      {/if}
                      <span>{row.note.body}</span>
                    </div>
                  </slot>
                </div>
              {:else if view === "split"}
                <span class="shl-diff-num" aria-hidden="true"
                  >{row.old === undefined ? "" : row.old + 1}</span
                >
                <span class="shl-diff-marker shl-diff-side-old" data-side="old"
                  >{row.kind === "change" && row.old !== undefined
                    ? "-"
                    : ""}</span
                >
                <span class="shl-diff-code shl-diff-side-old" data-side="old"
                  ><span
                    class="shl-diff-text"
                    style={wrap
                      ? undefined
                      : `transform: translateX(${-scrollOld}px);`}
                    >{@html row.old === undefined
                      ? ""
                      : item.oldHtml || "​"}</span
                  ></span
                >
                <span class="shl-diff-num shl-diff-num-new" aria-hidden="true"
                  >{row.new === undefined ? "" : row.new + 1}</span
                >
                <span class="shl-diff-marker shl-diff-side-new" data-side="new"
                  >{row.kind === "change" && row.new !== undefined
                    ? "+"
                    : ""}</span
                >
                <span class="shl-diff-code shl-diff-side-new" data-side="new"
                  ><span
                    class="shl-diff-text"
                    style={wrap
                      ? undefined
                      : `transform: translateX(${-scrollNew}px);`}
                    >{@html row.new === undefined
                      ? ""
                      : item.newHtml || "​"}</span
                  >
                  {#if row.kind === "incoming"}
                    <span class="shl-diff-caret" aria-hidden="true"></span>
                  {/if}</span
                >
              {:else}
                <span class="shl-diff-num" aria-hidden="true"
                  >{row.old === undefined ? "" : row.old + 1}</span
                >
                <span class="shl-diff-num" aria-hidden="true"
                  >{row.new === undefined ? "" : row.new + 1}</span
                >
                <span class="shl-diff-marker"
                  >{row.kind === "del"
                    ? "-"
                    : row.kind === "add" || row.kind === "incoming"
                      ? "+"
                      : ""}</span
                >
                <span class="shl-diff-code" data-side="new"
                  ><span
                    class="shl-diff-text"
                    style={wrap
                      ? undefined
                      : `transform: translateX(${-scrollNew}px);`}
                    >{@html (row.kind === "del"
                      ? item.oldHtml
                      : item.newHtml) || "​"}</span
                  >
                  {#if row.kind === "incoming"}
                    <span class="shl-diff-caret" aria-hidden="true"></span>
                  {/if}</span
                >
              {/if}
              {#if row.first &&
                row.change !== undefined &&
                (review || $$slots.actions)}
                {@const change = row.change}
                <span class="shl-diff-actions">
                  <slot
                    name="actions"
                    {change}
                    {decision}
                    decide={(
                      /** @type {"accepted" | "rejected" | undefined} */ d,
                    ) => diff.decide(change, d)}
                  >
                    {#if decision}
                      <span class="shl-diff-decision">{decision}</span>
                      <button
                        type="button"
                        on:click={() => diff.decide(change, undefined)}
                      >
                        Undo
                      </button>
                    {:else}
                      <button
                        type="button"
                        class="shl-diff-accept"
                        on:click={() => diff.decide(change, "accepted")}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        class="shl-diff-reject"
                        on:click={() => diff.decide(change, "rejected")}
                      >
                        Reject
                      </button>
                    {/if}
                  </slot>
                </span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    </div>
    {#if !wrap}
      <div class="shl-diff-hbar-row" aria-hidden="true">
        {#if view === "split"}
          <span></span><span></span>
          <div
            class="shl-diff-hbar"
            bind:this={hbarOld}
            on:scroll={() => (scrollOld = hbarOld?.scrollLeft ?? 0)}
          >
            <div
              style="width: {(columns.old + 2) * charWidth}px; height: 1px;"
            ></div>
          </div>
          <span></span><span></span>
          <div
            class="shl-diff-hbar"
            bind:this={hbarNew}
            on:scroll={() => (scrollNew = hbarNew?.scrollLeft ?? 0)}
          >
            <div
              style="width: {(columns.new + 2) * charWidth}px; height: 1px;"
            ></div>
          </div>
        {:else}
          <span></span><span></span><span></span>
          <div
            class="shl-diff-hbar"
            bind:this={hbarNew}
            on:scroll={() => (scrollNew = hbarNew?.scrollLeft ?? 0)}
          >
            <div
              style="width: {(Math.max(columns.old, columns.new) + 2) *
                charWidth}px; height: 1px;"
            ></div>
          </div>
        {/if}
      </div>
    {/if}
    <span
      class="shl-diff-probe shl-diff-row"
      bind:this={probe}
      aria-hidden="true"
      ><span class="shl-diff-code">&nbsp;</span></span
    >
    <span class="shl-diff-char-probe" bind:this={charProbe} aria-hidden="true"
      >0000000000</span
    >
  </div>
</section>

<style>
  :global(.shl-diff-theme) {
    --shl-diff-add: rgba(46, 160, 67, 0.16);
    --shl-diff-add-word: rgba(46, 160, 67, 0.45);
    --shl-diff-add-accent: #3fb950;
    --shl-diff-del: rgba(248, 81, 73, 0.16);
    --shl-diff-del-word: rgba(248, 81, 73, 0.45);
    --shl-diff-del-accent: #f85149;
    --shl-diff-move: rgba(163, 113, 247, 0.18);
    --shl-diff-move-accent: #a371f7;
    --shl-diff-muted: color-mix(in srgb, currentColor 45%, transparent);
    --shl-diff-rule: color-mix(in srgb, currentColor 12%, transparent);
  }

  :global(.shl-diff-theme.shl-diff-colorblind) {
    --shl-diff-add: rgba(56, 139, 253, 0.18);
    --shl-diff-add-word: rgba(56, 139, 253, 0.5);
    --shl-diff-add-accent: #58a6ff;
    --shl-diff-del: rgba(219, 109, 40, 0.18);
    --shl-diff-del-word: rgba(219, 109, 40, 0.5);
    --shl-diff-del-accent: #db6d28;
  }

  .shl-diff {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 400px;
    min-width: 0;
    outline: none;
    font-family: var(
      --shl-diff-font,
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Consolas,
      monospace
    );
    font-size: var(--shl-diff-font-size, 13px);
  }

  .shl-diff:focus-visible {
    box-shadow: 0 0 0 2px var(--shl-diff-move-accent);
  }

  .shl-diff-frame {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
  }

  /* Beat a theme's `.hljs` padding without `!important`. */
  .shl-diff .shl-diff-frame.hljs {
    padding: 0;
  }

  .shl-diff-body {
    overflow-anchor: none;
    position: relative;
    flex: 1;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-gutter: stable;
  }

  .shl-diff-sizer {
    position: relative;
  }

  .shl-diff-window {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .shl-diff-window-flat {
    position: static;
  }

  .shl-diff-row,
  .shl-diff-hbar-row {
    display: grid;
    grid-template-columns: var(--shl-diff-gutter) var(--shl-diff-gutter) 2ch minmax(
        0,
        1fr
      );
    align-items: start;
    line-height: var(--shl-diff-line);
    white-space: pre;
    position: relative;
  }

  .shl-diff-hbar-row {
    scrollbar-gutter: stable;
    overflow-y: hidden;
  }

  .shl-diff-split .shl-diff-row,
  .shl-diff-split .shl-diff-hbar-row {
    grid-template-columns:
      var(--shl-diff-gutter) 2ch minmax(0, 1fr)
      var(--shl-diff-gutter) 2ch minmax(0, 1fr);
  }

  .shl-diff-hbar {
    overflow-x: auto;
    overflow-y: hidden;
    height: 10px;
  }

  .shl-diff-num {
    padding-right: 1ch;
    text-align: right;
    color: var(--shl-diff-muted);
    user-select: none;
  }

  .shl-diff-num-new {
    border-left: 1px solid var(--shl-diff-rule);
  }

  .shl-diff-marker {
    color: var(--shl-diff-muted);
    user-select: none;
    text-align: center;
  }

  .shl-diff-code {
    overflow: hidden;
    padding-right: 2ch;
  }

  .shl-diff-text {
    display: inline-block;
  }

  .shl-diff-wrap .shl-diff-row {
    white-space: pre-wrap;
  }

  .shl-diff-wrap .shl-diff-row .shl-diff-code {
    overflow-wrap: anywhere;
  }

  .shl-diff-wrap .shl-diff-text {
    display: inline;
  }

  /* Unified */
  .shl-diff-del {
    background: var(--shl-diff-del);
  }

  .shl-diff-add,
  .shl-diff-incoming {
    background: var(--shl-diff-add);
  }

  .shl-diff-del .shl-diff-marker {
    color: var(--shl-diff-del-accent);
  }

  .shl-diff-add .shl-diff-marker,
  .shl-diff-incoming .shl-diff-marker {
    color: var(--shl-diff-add-accent);
  }

  .shl-diff-del :global(.shl-diff-word) {
    background: var(--shl-diff-del-word);
    border-radius: 2px;
  }

  .shl-diff-add :global(.shl-diff-word),
  .shl-diff-side-new :global(.shl-diff-word) {
    background: var(--shl-diff-add-word);
    border-radius: 2px;
  }

  /* Split: color each side on its own. */
  .shl-diff-split .shl-diff-change > .shl-diff-side-old {
    background: var(--shl-diff-del);
  }

  .shl-diff-split .shl-diff-change > .shl-diff-side-new {
    background: var(--shl-diff-add);
  }

  .shl-diff-split .shl-diff-change > .shl-diff-marker.shl-diff-side-old {
    color: var(--shl-diff-del-accent);
  }

  .shl-diff-split .shl-diff-change > .shl-diff-marker.shl-diff-side-new {
    color: var(--shl-diff-add-accent);
  }

  .shl-diff-split .shl-diff-side-old :global(.shl-diff-word) {
    background: var(--shl-diff-del-word);
    border-radius: 2px;
  }

  .shl-diff-split .shl-diff-unpaired-old > .shl-diff-side-old,
  .shl-diff-split .shl-diff-unpaired-new > .shl-diff-side-new {
    background: repeating-linear-gradient(
      -45deg,
      transparent 0 4px,
      var(--shl-diff-rule) 4px 5px
    );
  }

  .shl-diff-split .shl-diff-incoming > .shl-diff-side-new {
    background: var(--shl-diff-add);
  }

  .shl-diff-split .shl-diff-incoming {
    background: none;
  }

  /* Moved blocks */
  .shl-diff-row.shl-diff-moved,
  .shl-diff-split .shl-diff-moved > .shl-diff-code,
  .shl-diff-split .shl-diff-moved > .shl-diff-marker {
    background: var(--shl-diff-move);
  }

  .shl-diff .shl-diff-row.shl-diff-moved .shl-diff-marker {
    color: var(--shl-diff-move-accent);
  }

  .shl-diff-moved::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: var(--shl-diff-move-accent);
  }

  /* Folds and status rows */
  .shl-diff-fold,
  .shl-diff-pending {
    display: flex;
    overflow: hidden;
    white-space: nowrap;
    background: color-mix(in srgb, var(--shl-diff-move-accent) 8%, transparent);
    color: var(--shl-diff-muted);
  }

  .shl-diff-fold-label {
    font: inherit;
    height: 100%;
    margin: 0;
    padding: 0 0 0 1ch;
    display: flex;
    gap: 1ch;
    align-items: center;
    color: inherit;
    background: none;
    border: 0;
    cursor: default;
    width: 100%;
    text-align: left;
    user-select: none;
  }

  button.shl-diff-fold-label {
    cursor: pointer;
  }

  button.shl-diff-fold-label:hover {
    color: var(--shl-diff-move-accent);
  }

  .shl-diff-hunk {
    opacity: 0.8;
    margin-left: auto;
    padding-right: 2ch;
  }

  .shl-diff-spinner {
    width: 0.8em;
    height: 0.8em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: shl-diff-spin 0.8s linear infinite;
  }

  @keyframes shl-diff-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .shl-diff-caret {
    display: inline-block;
    width: 0.55em;
    height: 1.1em;
    vertical-align: text-bottom;
    background: var(--shl-diff-add-accent);
    animation: shl-diff-blink 1s steps(1) infinite;
  }

  @keyframes shl-diff-blink {
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .shl-diff-caret,
    .shl-diff-spinner {
      animation: none;
    }
  }

  /* Review */
  .shl-diff-current {
    box-shadow: inset 3px 0 0 var(--shl-diff-move-accent);
  }

  .shl-diff-rejected {
    opacity: 0.45;
  }

  .shl-diff-row.shl-diff-rejected.shl-diff-add .shl-diff-code,
  .shl-diff-split .shl-diff-rejected > .shl-diff-side-new {
    text-decoration: line-through;
  }

  .shl-diff-row.shl-diff-accepted.shl-diff-del .shl-diff-code,
  .shl-diff-split .shl-diff-accepted > .shl-diff-side-old {
    text-decoration: line-through;
    opacity: 0.6;
  }

  .shl-diff-actions {
    position: absolute;
    right: 1ch;
    top: 0;
    display: flex;
    gap: 4px;
    z-index: 1;
  }

  .shl-diff-actions button {
    font: inherit;
    font-size: 0.85em;
    line-height: 1.4;
    padding: 0 0.6em;
    border-radius: 3px;
    border: 1px solid var(--shl-diff-rule);
    background: color-mix(in srgb, Canvas 85%, transparent);
    color: CanvasText;
    cursor: pointer;
  }

  .shl-diff-accept:hover {
    border-color: var(--shl-diff-add-accent);
  }

  .shl-diff-reject:hover {
    border-color: var(--shl-diff-del-accent);
  }

  .shl-diff-decision {
    font-size: 0.85em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--shl-diff-muted);
  }

  /* Notes */
  .shl-diff-note-slot {
    grid-column: 1 / -1;
    white-space: normal;
  }

  .shl-diff-note-card {
    margin: 2px 2ch 2px calc(var(--shl-diff-gutter) * 2);
    padding: 0 1ch;
    border-left: 3px solid var(--shl-diff-move-accent);
    background: color-mix(
      in srgb,
      var(--shl-diff-move-accent) 10%,
      transparent
    );
    white-space: pre-wrap;
    overflow: hidden;
    font-family: system-ui, sans-serif;
    font-size: 0.92em;
  }

  .shl-diff-note-card strong {
    margin-right: 1ch;
  }

  .shl-diff-note-card.shl-diff-note-warning {
    border-color: #d29922;
    background: rgba(210, 153, 34, 0.12);
  }

  .shl-diff-note-card.shl-diff-note-error {
    border-color: var(--shl-diff-del-accent);
    background: var(--shl-diff-del);
  }

  .shl-diff-note-card.shl-diff-note-suggestion {
    border-color: var(--shl-diff-add-accent);
    background: var(--shl-diff-add);
  }

  /* Split selection: copy from one side only. */
  .shl-diff[data-select="old"] [data-side="new"],
  .shl-diff[data-select="new"] [data-side="old"] {
    user-select: none;
  }

  .shl-diff-code :global(.shl-diff-cr)::after {
    content: "␍";
    opacity: 0.6;
  }

  .shl-diff-code :global(.shl-diff-noeol)::after {
    content: " ⊘ no newline at end of file";
    color: var(--shl-diff-muted);
    font-style: italic;
    user-select: none;
  }

  .shl-diff-probe,
  .shl-diff-char-probe {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    white-space: pre;
  }
</style>
