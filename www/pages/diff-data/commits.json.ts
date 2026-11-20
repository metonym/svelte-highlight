import { listCommits } from "@www/diff-data.ts";

export function GET() {
  return new Response(JSON.stringify(listCommits()), {
    headers: { "content-type": "application/json" },
  });
}
