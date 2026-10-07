/** Strip a leading prompt (default `"$ "` or `"> "`) from each line that has one. */
export declare function stripPrompts(code: string, prompts?: string[]): string;

/** Strip a leading `+`/`-` diff marker (and one following space) from each line. */
export declare function stripDiffMarkers(code: string): string;
