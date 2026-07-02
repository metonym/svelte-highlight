export type TypstPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const typstPreviewSnippets: TypstPreviewSnippet[] = [
  {
    title: "Document with headings and markup",
    description: "headings, #let bindings, emphasis, and math mode",
    code: `= Introduction

#let title = "Typst Guide"
#let version = 0.1

This document introduces *Typst*, a modern markup-based typesetting
system. It combines the simplicity of _Markdown_ with the power of
LaTeX.

== Motivation

Typst compiles documents incrementally and reports errors clearly.
See @intro for background, or check the \`typst compile\` command.

$ sum_(i=1)^n i = (n(n+1)) / 2 $

More info at <intro>.`,
  },
  {
    title: "Templates and show rules",
    description: "#import, #show rules, and a #let function",
    code: `#import "template.typ": conf

#show: conf.with(
  title: "Report",
  authors: ("Ada Lovelace",),
)

#set text(size: 11pt, font: "New Computer Modern")
#set heading(numbering: "1.1")

#show heading: it => {
  set text(fill: blue)
  it
}

= Results

#let summary(value) = {
  if value > 50% [
    Above average.
  ] else [
    Below average.
  ]
}

#summary(75%)`,
  },
];
