export type InkPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const inkPreviewSnippets: InkPreviewSnippet[] = [
  {
    title: "A basic knot with choices",
    description: "knots, choice markers, diverts, and logic lines",
    code: `=== knot_greeting ===
Hello, traveler!
* [Ask about the weather]
    -> weather
* [Say goodbye] -> END

= weather
~ temp x = 5
{x > 3: It's warm today. | It's a bit chilly.}
-> knot_greeting
`,
  },
  {
    title: "Variables and tags",
    description: "VAR declarations, tags, and simple interpolation",
    code: `VAR player_name = "Alex"
VAR has_key = false

# location: forest

Hello, {player_name}!
{has_key: You unlock the door. | The door is locked.}
`,
  },
  {
    title: "Gathers and sequences",
    description: "gather markers and a cycling sequence",
    code: `* [Look around]
    You see trees all around.
* [Listen]
    You hear birds singing.
- You decide to continue.

The bird sings: {&a cheerful tune|a sad melody|a strange call}.
-> END
`,
  },
];
