export type BpftracePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const bpftracePreviewSnippets: BpftracePreviewSnippet[] = [
  {
    title: "Tracing syscall latency",
    description: "a kprobe/kretprobe pair, a predicate, and a map",
    code: `// trace slow syscalls
#include <linux/sched.h>

BEGIN
{
    printf("Tracing syscalls...\\n");
}

kprobe:vfs_read
/pid == 1234/
{
    @start[tid] = nsecs;
}

kretprobe:vfs_read
{
    $dur = nsecs - @start[tid];
    printf("read took %d ns, arg0=%d\\n", $dur, arg0);
}
`,
  },
  {
    title: "Histogram of syscall counts",
    description: "the hist function and built-in variables",
    code: `tracepoint:raw_syscalls:sys_enter
{
    @syscalls[comm] = count();
}

END
{
    print(@syscalls);
}`,
  },
  {
    title: "Interval reporting",
    description: "the interval probe and positional parameters",
    code: `interval:s:$1
{
    printf("pid %d, cpu %d\\n", pid, cpu);
}`,
  },
];
