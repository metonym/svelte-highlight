import type { LanguageType } from "./languages";

export interface StreamViewSettings {
  /** Language module from `svelte-highlight/languages/*`. */
  language: LanguageType<string>;
  /** Growing code buffer; chunks may split mid-token or mid-line. @default "" */
  code: string;
  /** Stream finished: hides the caret and renders one full highlight. @default false */
  done: boolean;
  /** Show a blinking caret at the end of output while not `done`. @default true */
  caret: boolean;
  /**
   * Keep the element's parent scrolled to the bottom while streaming, unless
   * the user scrolls away. @default false
   */
  autoScroll: boolean;
}

export interface StreamViewOptions extends Partial<StreamViewSettings> {
  language: LanguageType<string>;
  /** Called after each render with the full highlighted HTML. */
  onHighlight?: (highlighted: string) => void;
  /** Called once when `done` renders. Called again if the stream restarts. */
  onDone?: () => void;
}

export interface StreamView {
  /** The latest highlighted HTML. */
  readonly highlighted: string;
  /**
   * Applies changed settings. While streaming, renders on the next animation
   * frame, so bursts of chunks cost one render. `done` renders at once.
   */
  update(settings: Partial<StreamViewSettings>): void;
  /** Stops rendering and removes the scroll listener. Leaves the DOM as is. */
  destroy(): void;
}

/**
 * Streams highlighted code into `element`, with no framework. Use a `<code>`
 * inside a `<pre>`, and import `svelte-highlight/stream.css` for the caret.
 * Renders the first frame at once.
 * @example
 * import { createStreamView } from "svelte-highlight/stream";
 * import typescript from "svelte-highlight/languages/typescript";
 *
 * const view = createStreamView(document.querySelector("code"), {
 *   language: typescript,
 * });
 * let code = "";
 * for await (const chunk of response) {
 *   code += chunk;
 *   view.update({ code });
 * }
 * view.update({ done: true });
 */
export function createStreamView(
  element: HTMLElement,
  options: StreamViewOptions,
): StreamView;
