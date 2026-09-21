export type NextflowPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const nextflowPreviewSnippets: NextflowPreviewSnippet[] = [
  {
    title: "An nf-core style process",
    description:
      "FASTQC with tag/label/publishDir/container directives and two emitted outputs",
    code: `process FASTQC {
    tag "$meta.id"
    label 'process_medium'
    publishDir "\${params.outdir}/fastqc", mode: 'copy'
    container 'quay.io/biocontainers/fastqc:0.12.1--hdfd78af_0'

    input:
    tuple val(meta), path(reads)

    output:
    tuple val(meta), path("*.html"), emit: html
    tuple val(meta), path("*.zip"),  emit: zip

    script:
    """
    fastqc --quiet --threads $task.cpus $reads
    """
}
`,
  },
  {
    title: "A channel pipeline",
    description: "reading a samplesheet and mapping rows into a tuple channel",
    code: `workflow {
    ch_samplesheet = Channel
        .fromPath(params.input)
        .splitCsv(header: true)
        .map { row -> tuple(row.sample_id, file(row.fastq)) }

    ch_samplesheet.view { sample_id, fastq -> "queued \${sample_id}: \${fastq}" }
}
`,
  },
  {
    title: "A DSL2 sub-workflow",
    description:
      "include-ing modules and wiring their emitted channels together",
    code: `include { FASTQC } from './modules/fastqc'
include { MULTIQC } from './modules/multiqc'

workflow QC {
    take:
    reads

    main:
    FASTQC(reads)
    MULTIQC(FASTQC.out.zip.collect())

    emit:
    html = FASTQC.out.html
}
`,
  },
];
