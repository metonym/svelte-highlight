export type DtracePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const dtracePreviewSnippets: DtracePreviewSnippet[] = [
  {
    title: "Tracing read latency",
    description: "a shebang, a pragma, probe descriptions, and an aggregation",
    code: `#!/usr/sbin/dtrace -s
/* trace slow reads */
#pragma D option quiet

syscall::read:entry
{
    self->start = timestamp;
}

syscall::read:return
/self->start/
{
    @counts[execname] = count();
    printf("%s took %d ns\\n", execname, timestamp - self->start);
    self->start = 0;
}
`,
  },
  {
    title: "Process-scoped probes",
    description: "the pid$target provider and positional arguments",
    code: `pid$target:::entry
{
    printf("entered %s\\n", probefunc);
}

pid$target:::return
{
    printf("returned from %s\\n", probefunc);
}`,
  },
  {
    title: "Aggregation functions",
    description: "quantize and sum aggregations",
    code: `syscall:::entry
{
    @dist[probefunc] = quantize(timestamp);
    @total = sum(1);
}`,
  },
];
