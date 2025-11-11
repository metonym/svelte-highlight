/**
 * Shared regex patterns used across build scripts
 */

/** Matches strings that start with a digit */
export const STARTS_WITH_DIGIT = /^[0-9]/;

/** Matches strings containing a dash */
export const CONTAINS_DASH = /-/;

/** Matches CSS files that are not minified (negative lookbehind for .min) */
export const NON_MINIFIED_CSS = /(?<!\.min)\.(css)$/;

/** Matches CSS files */
export const CSS_FILE = /\.(css)$/;

/** Matches the exact string "default" */
export const DEFAULT_STRING = /^default$/;

/** Matches backticks (for escaping in template literals) */
export const BACKTICK = /`/g;

/** Matches dash or period (for splitting strings) */
export const DASH_OR_PERIOD = /-|\./g;

/** Matches "License" or "Author" (case insensitive) */
export const LICENSE_OR_AUTHOR = /(License|Author)/i;

/** Matches selectors starting with "pre " */
export const PRE_SELECTOR = /^pre /;

/** Matches Windows line endings (CRLF) */
export const WINDOWS_LINE_ENDING = /\r\n/g;

/** Matches trailing spaces or tabs at the end of lines */
export const TRAILING_WHITESPACE = /[ \t]+$/gm;

/** Matches leading newlines at the start of a string */
export const LEADING_NEWLINES = /^\n+/;

/** Matches 3 or more consecutive newlines */
export const MULTIPLE_NEWLINES = /\n{3,}/g;

/** Matches trailing newlines at the end of a string */
export const TRAILING_NEWLINES = /\n*$/;
