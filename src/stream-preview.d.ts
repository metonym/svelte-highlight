import type { Registry, StreamSession } from "./engine.d.ts";

export function computeStagedTailPreview(params: {
  registry: Registry;
  language: string;
  session: StreamSession;
  fedCode: string;
  openScopes: string[];
  pendingHtml: string;
  cache: undefined;
}): { previewLines: string[]; cache: undefined };
