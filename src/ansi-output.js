import { createAnsiSession } from "./ansi.js";
import { classNames, inlineStyle } from "./ansi-color.js";

/** @typedef {import("./ansi.d.ts").AnsiSegment} AnsiSegment */

/**
 * @typedef {{
 *   text: string;
 *   class: string | undefined;
 *   style: string | undefined;
 *   link: string | undefined;
 * }} RenderedAnsiSegment
 */

/**
 * @param {AnsiSegment} segment
 * @param {boolean} autoContrast
 * @returns {RenderedAnsiSegment}
 */
function render(segment, autoContrast) {
  return {
    text: segment.text,
    class: classNames(segment),
    style: inlineStyle(segment, autoContrast),
    link: segment.link,
  };
}

/**
 * @returns {{
 *   update: (text: string, autoContrast: boolean) => RenderedAnsiSegment[],
 * }}
 */
export function createAnsiOutput() {
  let session = createAnsiSession();
  // Prefix already fed to `session`; a non-append change restarts it.
  let fedText = "";
  /** @type {RenderedAnsiSegment[]} */
  const rendered = [];
  /** @type {boolean | undefined} */
  let renderedContrast;

  return {
    /**
     * Returns the same array, patched in place (unchanged entries keep identity).
     * @param {string} text
     * @param {boolean} autoContrast
     * @returns {RenderedAnsiSegment[]}
     */
    update(text, autoContrast) {
      if (text.startsWith(fedText)) {
        if (text.length > fedText.length) {
          session.append(text.slice(fedText.length));
          fedText = text;
        }
      } else {
        session = createAnsiSession();
        session.append(text);
        fedText = text;
      }

      // Re-render only changed segments; all of them is quadratic when streaming.
      let { start, segments } = session.delta();
      if (autoContrast !== renderedContrast) {
        renderedContrast = autoContrast;
        start = 0;
        segments = session.segments();
      }
      rendered.length = start;
      for (const segment of segments) {
        rendered.push(render(segment, autoContrast));
      }
      return rendered;
    },
  };
}
