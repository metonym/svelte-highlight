/**
 * A JSON array log dump, the "huge log file" shape HighlightVirtual targets.
 * One string per line (rather than an object with several keys) so a
 * 100k-line demo stays comfortably under the engine's per-parse iteration
 * ceiling - see the "one token per line" note on token density below.
 * @param {number} lines
 */
export function generateJsonLog(lines) {
  const parts = [];
  for (let i = 0; i < lines; i++) {
    const level = i % 97 === 0 ? "ERROR" : i % 11 === 0 ? "WARN " : "INFO ";
    const comma = i < lines - 1 ? "," : "";
    const timestamp = String(i).padStart(6, "0");
    parts.push(`  "${timestamp} ${level} processed item ${i}"${comma}`);
  }
  return `[\n${parts.join("\n")}\n]\n`;
}

/**
 * A TypeScript-shaped file with enough structural variety to look real.
 * @param {number} lines
 */
export function generateTypeScript(lines) {
  const parts = [];
  let i = 0;
  while (i < lines) {
    if (i % 200 === 0) {
      parts.push("/**", ` * Section starting at line ${i}.`, " */");
      i += 3;
    } else if (i % 50 === 0) {
      parts.push(
        `export interface Row${i} {`,
        "  id: number;",
        "  label: string;",
        "}",
      );
      i += 4;
    } else {
      parts.push(`export const value${i} = ${i} * 2; // line ${i}`);
      i += 1;
    }
  }
  return `${parts.join("\n")}\n`;
}

/**
 * A long, repetitive Markdown document (headings + prose + a list).
 * @param {number} sections
 */
export function generateMarkdown(sections) {
  const parts = [];
  for (let i = 0; i < sections; i++) {
    parts.push(
      `## Section ${i}`,
      "",
      `Line ${i * 4 + 1} of a very long document. Lorem ipsum dolor sit amet.`,
      "",
      `- item ${i}.a`,
      `- item ${i}.b`,
      "",
    );
  }
  return `${parts.join("\n")}\n`;
}

/**
 * A long, repetitive CSS stylesheet (one rule block per generated selector).
 * @param {number} rules
 */
export function generateCss(rules) {
  const parts = [];
  for (let i = 0; i < rules; i++) {
    parts.push(
      `.generated-${i} {`,
      `  color: hsl(${(i * 37) % 360}deg 70% 50%);`,
      `  padding: ${i % 8}px;`,
      "}",
    );
  }
  return `${parts.join("\n")}\n`;
}

/**
 * Svelte action: counts `[data-line]` descendants (the actual rendered line
 * nodes, excluding the hidden line-height probe) and reports it via
 * `onCount`, re-measuring on every DOM mutation - hydration swapping in the
 * windowed view, and every subsequent scroll-driven repaint.
 * @param {HTMLElement} node
 * @param {(count: number) => void} onCount
 */
export function trackRenderedLineCount(node, onCount) {
  const measure = () => onCount(node.querySelectorAll("[data-line]").length);
  const observer = new MutationObserver(measure);
  observer.observe(node, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style"],
  });
  measure();
  return { destroy: () => observer.disconnect() };
}
