import type { Readable } from "svelte/store";

/** Context key for the store that holds the CodeWindow label. */
export declare const CODE_REGION: unique symbol;

/** Store for code blocks outside a CodeWindow. It always holds `undefined`. */
export declare const NO_REGION_LABEL: Readable<string | undefined>;
