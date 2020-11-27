/// <reference types="svelte" />
import { SvelteComponent } from "svelte";
import { HighlightSvelteProps } from "./HighlightSvelte";
export interface PrettierSvelteOptions {
  svelteSortOrder?: "scripts-styles-markup" | "markup-styles-scripts" | "styles-markup-scripts";
  svelteStrictMode?: boolean;
  svelteAllowShorthand?: boolean;
  svelteBracketNewLine?: boolean;
  svelteIndentScriptAndStyle?: boolean;
}

export interface HighlightSvelteFormattedProps
  extends HighlightSvelteProps,
    svelte.JSX.HTMLAttributes<HTMLElementTagNameMap["'pre'"]> {
  /**
   * @default ""
   */
  code?: string;

  /**
   * Prettier options
   * @default {}
   */
  prettier?: import("prettier").Options & PrettierSvelteOptions;
}

export default class HighlightSvelteFormatted extends SvelteComponent<
  HighlightSvelteFormattedProps,
  { highlight: CustomEvent<string> },
  {}
> {}
