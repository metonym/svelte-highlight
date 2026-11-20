import type { LanguageName } from "./languages";

/** A language name for a file path, from its name or extension. */
export function languageNameForPath(path: string): LanguageName | undefined;
