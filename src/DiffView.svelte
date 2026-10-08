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

  /** @type {"default" | "colorblind"} */
  export let palette = "default";

  /** Extra rows rendered above and below the viewport. */
  export let overscan = 10;

  /** Handle n/p/e/c/v (and a/r/u with `review`) when focused. */
  export let keyboard = true;

  import { onMount, tick } from "svelte";
  import { watchLineHeight } from "./virtual-window.js";

  $: ({ class: _class, style: _style, ...rest } = $$restProps);

  /** @type {HTMLElement} */
  let container;
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
  let scrollTop = 0;
  let clientHeight = 600;
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
  $: tops = $diff.tops();
  $: totalUnits = $diff.totalUnits();
  $: columns = $diff.columns();
  $: decisions = $diff.decisions();
  $: current = $diff.current();

  $: start = Math.max(
    0,
    $diff.rowAt(Math.floor(scrollTop / lineHeight)) - overscan,
  );
  $: end = Math.min(
    rows.length,
    $diff.rowAt(Math.ceil((scrollTop + clientHeight) / lineHeight)) +
      1 +
      overscan,
  );
  $: visible = $diff.renderRows(start, end);
  $: windowTop = /** @type {number} */ (tops[start] ?? 0) * lineHeight;

  $: if (hydrated)
    diff.setViewport(scrollTop / lineHeight, clientHeight / lineHeight);

  /** @param {number} unit @param {"start" | "center" | "third"} align */
  function scrollToUnit(unit, align) {
    if (!container) return;
    const top = unit * lineHeight;
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
      const top = /** @type {number} */ (tops[index] ?? 0) * lineHeight;
      const max = Math.max(0, totalUnits * lineHeight - container.clientHeight);
      const target = Math.min(
        max,
        Math.max(0, top - container.clientHeight * 0.6),
      );
      if (Math.abs(container.scrollTop - target) > lineHeight)
        container.scrollTop = target;
    });
  }
  $: followFrontier(), void rows;
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
    const observer = new ResizeObserver(() => {
      if (container) clientHeight = container.clientHeight;
    });
    observer.observe(container);
    const offReveal = diff.on("reveal", ({ unit, align }) =>
      scrollToUnit(unit, align),
    );
    return () => {
      observer.disconnect();
      offReveal();
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  });
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div
  class="shl-diff shl-diff-theme {_class ?? ""}"
  class:shl-diff-split={view === "split"}
  class:shl-diff-colorblind={palette === "colorblind"}
  class:shl-diff-streaming={state.streaming}
  data-select={selectSide}
  role="region"
  aria-label="Diff: {$diff.stats().additions} additions, {$diff.stats()
    .deletions} deletions"
  tabindex="0"
  {...rest}
  style="--shl-diff-gutter: {columns.gutter}ch; --shl-diff-line: {lineHeight}px; tab-size: {options.tabSize}; {_style ??
    ""}"
  on:keydown={onKeydown}
  on:mousedown={onMousedown}
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
      <div class="shl-diff-sizer" style="height: {totalUnits * lineHeight}px;">
        <div
          class="shl-diff-window"
          style="transform: translateY({windowTop}px);"
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
              style="height: {item.span * lineHeight}px;"
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
                      {row.count}
                      lines not in patch
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
                      Expand {row.count} unchanged
                      {row.count === 1 ? "line" : "lines"}
                      <span class="shl-diff-hunk">{row.fold.header}</span>
                    </button>
                  {/if}
                </slot>
              {:else if row.kind === "pending"}
                <span class="shl-diff-fold-label">
                  <span class="shl-diff-spinner" aria-hidden="true"></span>
                  {row.count} {row.count === 1 ? "line" : "lines"} not reached
                  yet
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
                    style="transform: translateX({-scrollOld}px);"
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
                    style="transform: translateX({-scrollNew}px);"
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
                    style="transform: translateX({-scrollNew}px);"
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
</div>

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
    padding: 0 !important;
  }

  .shl-diff-body {
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

  .shl-diff-split .shl-diff-row,
  .shl-diff-split .shl-diff-hbar-row {
    grid-template-columns:
      var(--shl-diff-gutter) 2ch minmax(0, 1fr)
      var(--shl-diff-gutter) 2ch minmax(0, 1fr);
  }

  .shl-diff-hbar-row {
    scrollbar-gutter: stable;
    overflow-y: hidden;
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

  .shl-diff-moved .shl-diff-marker {
    color: var(--shl-diff-move-accent) !important;
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
    background: color-mix(in srgb, var(--shl-diff-move-accent) 8%, transparent);
    color: var(--shl-diff-muted);
  }

  .shl-diff-fold-label {
    display: flex;
    gap: 1ch;
    align-items: center;
    padding-left: 1ch;
    font: inherit;
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

  .shl-diff-rejected.shl-diff-add .shl-diff-code,
  .shl-diff-rejected .shl-diff-side-new {
    text-decoration: line-through;
  }

  .shl-diff-accepted.shl-diff-del .shl-diff-code,
  .shl-diff-accepted .shl-diff-side-old {
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
    height: 100%;
    overflow: hidden;
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
