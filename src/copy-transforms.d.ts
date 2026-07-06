/**
 * Strip a leading prompt from each line that has one. Lines without a
 * matching prompt (e.g. command output in a multi-command block) are kept
 * as-is.
 */
export declare function stripPrompts(code: string, prompts?: string[]): string;

/**
 * Strip a leading diff marker (`+ `, `- `, or a bare `+`/`-` immediately
 * before content) from each line. Context lines without a marker are left
 * unchanged.
 */
export declare function stripDiffMarkers(code: string): string;
