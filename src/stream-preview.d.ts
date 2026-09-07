import type { Registry, Snapshot, StreamSession } from "./engine.d.ts";

export interface PreviewCache {
  fedCode: string;
  committedPos: number;
  snapshot: Snapshot;
  openScopes: string[];
  pendingHtml: string;
}

export function computeStagedTailPreview(params: {
  registry: Registry;
  language: string;
  session: StreamSession;
  fedCode: string;
  openScopes: string[];
  pendingHtml: string;
  cache: PreviewCache | undefined;
}): { previewLines: string[]; cache: PreviewCache | undefined };
