export type WdlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const wdlPreviewSnippets: WdlPreviewSnippet[] = [
  {
    title: "A GATK/Broad style task",
    description:
      "a command heredoc with ~{} interpolation, typed inputs, and a runtime block",
    code: `task BwaMem {
    input {
        File reads_fastq
        File reference_fasta
        Int threads = 4
    }

    command <<<
        bwa mem -t ~{threads} ~{reference_fasta} ~{reads_fastq} \\
            | samtools sort -o aligned.sorted.bam
    >>>

    output {
        File sorted_bam = "aligned.sorted.bam"
    }

    runtime {
        docker: "broadinstitute/gatk:4.5.0.0"
        memory: "8 GB"
        cpu: threads
    }
}
`,
  },
  {
    title: "A workflow with scatter",
    description:
      "fanning a task out over an array of inputs and collecting outputs",
    code: `workflow AlignSamples {
    input {
        Array[File] fastq_files
        File reference_fasta
    }

    scatter (fastq in fastq_files) {
        call BwaMem {
            input:
                reads_fastq = fastq,
                reference_fasta = reference_fasta
        }
    }

    output {
        Array[File] sorted_bams = BwaMem.sorted_bam
    }
}
`,
  },
  {
    title: "A conditional call",
    description:
      "an if block guarding an optional call, plus an if/then/else expression",
    code: `workflow MaybeDownsample {
    input {
        File bam
        Boolean should_downsample
    }

    if (should_downsample) {
        call Downsample { input: bam = bam }
    }

    File final_bam = if should_downsample then Downsample.out_bam else bam

    output {
        File result = final_bam
    }
}
`,
  },
];
