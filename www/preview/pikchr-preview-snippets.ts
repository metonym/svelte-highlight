export type PikchrPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const pikchrPreviewSnippets: PikchrPreviewSnippet[] = [
  {
    title: "Start and stop",
    description: "fitted boxes connected by an arrow",
    code: `# procedure entry
box "Start" fit
arrow
box "Stop" "(done)" fit`,
  },
  {
    title: "Decision",
    description: "a diamond with yes and no branches",
    code: `box "Receive" fit
arrow
diamond "valid?" fit
arrow right "yes" " "
box "Save" fit
arrow left "no" from last diamond.w
box "Reject" fit`,
  },
  {
    title: "Two formatters",
    description: "labeled arrows and a same-width box",
    code: `arrow right 200% "Markdown" "Source"
box rad 10px "Markdown" "Formatter" "(markdown.c)" fit
arrow right 200% "HTML+SVG" "Output"
arrow <-> down 70%
box same "SVG" "Formatter" "(svg.c)" fit`,
  },
];
