import type { SvelteComponentTyped } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { FilePatch } from "./diff-edits";
import type { LanguageType } from "./languages";

/** One file in a `DiffFileList`: a parsed patch, or two texts. */
export interface DiffFile {
  /** Stable identity across updates. @default index + paths */
  key?: string;
  path: string;
  oldPath?: string;
  status?: "modified" | "added" | "deleted" | "renamed" | "binary";
  /** A file from `parsePatch`. Takes precedence over `before`/`after`. */
  patch?: FilePatch;
  before?: string;
  after?: string;
  /** Skips `languageFor` for this file. */
  language?: LanguageType<string>;
}

export type DiffFileListProps = HTMLAttributes<HTMLDivElement> & {
  files: DiffFile[];
  /** @default "unified" */
  view?: "unified" | "split";
  /** @default 3 */
  context?: number;
  /** @default true */
  wordDiff?: boolean;
  /** @default false */
  ignoreWhitespace?: boolean;
  /** @default false */
  wrap?: boolean;
  /** @default false */
  review?: boolean;
  /** @default "default" */
  palette?: "default" | "colorblind";

  /**
   * Tallest a file's diff grows before it scrolls on its own, in pixels.
   * `null` shows every file in full.
   * @default 640
   */
  maxHeight?: number | null;

  /**
   * Picks a language for a path. The default loads one by file extension
   * (see `languageNameForPath`) the first time the file mounts.
   */
  languageFor?: (
    path: string,
  ) =>
    | LanguageType<string>
    | Promise<LanguageType<string> | undefined>
    | undefined;

  /**
   * `"windowed"` mounts files near the viewport and unmounts far ones,
   * keeping their height. `"lazy"` never unmounts. `"none"` mounts every
   * file up front, for printing or browser find on short lists.
   * @default "windowed"
   */
  windowing?: "windowed" | "lazy" | "none";

  /** How far outside the viewport a file mounts. @default "1500px 0px" */
  rootMargin?: string;

  /** The scrolling element, if the list isn't in the page's scroll. @default null */
  root?: Element | null;

  /** Collapse a file by clicking its header. @default true */
  collapsible?: boolean;
};

export type DiffFileListSlots = {
  /** Replaces a file's header. */
  header: {
    file: DiffFile;
    index: number;
    /** From the patch, or once the file has mounted. */
    stats:
      | { additions: number; deletions: number; changes: number }
      | undefined;
    collapsed: boolean;
    toggle: () => void;
  };
};

export default class DiffFileList extends SvelteComponentTyped<
  DiffFileListProps,
  Record<string, never>,
  DiffFileListSlots
> {
  /** Scroll a file's header into view, mounting it first. */
  scrollToFile(index: number, options?: ScrollIntoViewOptions): Promise<void>;
}
