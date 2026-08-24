export type EarthfilePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const earthfilePreviewSnippets: EarthfilePreviewSnippet[] = [
  {
    title: "Build target",
    description: "VERSION, FROM, COPY/RUN, and SAVE ARTIFACT",
    code: `VERSION 0.8
FROM golang:1.22
WORKDIR /app
build:
    COPY src .
    RUN go build -o bin
    SAVE ARTIFACT bin`,
  },
  {
    title: "Control flow",
    description: "FOR/IF with END, unique to Earthly",
    code: `deps:
    FOR pkg IN foo bar
        RUN echo $pkg
    END
    IF [ -f go.mod ]
        RUN go mod download
    END`,
  },
  {
    title: "Multi-target image",
    description: "BUILD another target and SAVE IMAGE",
    code: `VERSION 0.8
FROM alpine:3.19
image:
    BUILD +build
    COPY +build/bin /usr/bin/app
    SAVE IMAGE myapp:latest`,
  },
];
