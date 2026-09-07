export type YarnspinnerPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const yarnspinnerPreviewSnippets: YarnspinnerPreviewSnippet[] = [
  {
    title: "A basic node with choices",
    description: "header, node delimiters, options, and commands",
    code: `title: Start
tags:
---
Guard: Halt! Who goes there? #line:abc123
-> Explain yourself
    <<jump Explain>>
-> Attack
    <<set $fought to true>>
    <<if visited("Fight")>>
        You've fought before.
    <<endif>>
===

title: Explain
---
Traveler: I mean no harm, {$player_name}.
[wave]Just passing through.[/wave]
===
`,
  },
  {
    title: "Variables and declarations",
    description: "<<declare>>, function calls, and inline expressions",
    code: `title: Setup
---
<<declare $gold = 0 as number>>
<<declare $has_met_wizard = false as bool>>

You have {$gold} gold pieces.
<<if $gold > 10>>
    That's quite a lot!
<<endif>>

Random roll: {dice(6)}
===
`,
  },
  {
    title: "Markup and hashtags",
    description: "character lines, markup tags, and line hashtags",
    code: `title: Market
---
Merchant: [wave]Welcome, friend![/wave] #line:m001
Merchant: [nomarkup]Prices are non-negotiable.[/nomarkup] #lastline
-> Buy an apple
    <<call give_item("apple")>>
===
`,
  },
];
