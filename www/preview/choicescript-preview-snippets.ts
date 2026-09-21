export type ChoicescriptPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const choicescriptPreviewSnippets: ChoicescriptPreviewSnippet[] = [
  {
    title: "Startup stats",
    description: "*create variables and a *stat_chart, as seen in startup.txt",
    code: `*create leadership 40
*create honesty 50

*stat_chart
    percent leadership Leadership
    percent honesty Honesty`,
  },
  {
    title: "A branching choice",
    description: "*label, *choice, #options, and *goto",
    code: `*label crossroads

You reach a fork in the road.

*choice
    #Go left.
        *goto left_path
    #Go right.
        *goto right_path`,
  },
  {
    title: "Conditional narration",
    description: "*if/*elseif/*else with *set and variable interpolation",
    code: `*if (leadership > 50)
    *set honesty +10
    The crowd cheers your decisive leadership.
*elseif (leadership > 20)
    The crowd offers polite applause.
*else
    The crowd murmurs uncertainly.

Your honesty is now \${honesty}.`,
  },
];
