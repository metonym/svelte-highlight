import { RANGES, rangePatch } from "@www/diff-data.ts";

export function getStaticPaths() {
  return RANGES.map((_, index) => ({ params: { index: String(index) } }));
}

export function GET({ params }: { params: { index: string } }) {
  const range = RANGES[Number(params.index)] ?? "";
  return new Response(JSON.stringify({ range, patch: rangePatch(range) }), {
    headers: { "content-type": "application/json" },
  });
}
