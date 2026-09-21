export type HarlowePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const harlowePreviewSnippets: HarlowePreviewSnippet[] = [
  {
    title: "Setting a stat and branching on it",
    description: "the (set:) and (if:) macros with a story variable",
    code: `(set: $health to 100)

(if: $health <= 0)[
    You collapse, defeated.
](else:)[
    You're still standing, though bruised.
]`,
  },
  {
    title: "A link to another passage",
    description: "a passage link alongside a (link:) macro hook",
    code: `[[Go north->North Room]]

(link: "Search the room")[
    You find a rusty key under the floorboards.
    (set: $hasKey to true)
]`,
  },
  {
    title: "An inventory check",
    description: "the (a:) array macro and a (if:) membership check",
    code: `(set: $inventory to (a: "sword", "shield"))

(if: $inventory contains "sword")[
    You feel ready for a fight.
](else:)[
    You should probably find a weapon.
]`,
  },
];
