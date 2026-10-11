import { commitFiles, listCommits } from "@www/diff-data.ts";

export function getStaticPaths() {
  return listCommits().map((commit) => ({ params: { sha: commit.sha } }));
}

export function GET({ params }: { params: { sha: string } }) {
  return new Response(JSON.stringify(commitFiles(params.sha)), {
    headers: { "content-type": "application/json" },
  });
}
