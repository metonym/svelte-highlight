export type VersePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const versePreviewSnippets: VersePreviewSnippet[] = [
  {
    title: "Counter device",
    description: "a class definition, specifiers, and a loop",
    code: `<# a simple counter class #>
counter_device := class(creative_device):
    Count : int = 0

    OnBegin<override>()<suspends> : void =
        loop:
            Count += 1

    GetCount<public>()<decides><transacts> : int =
        Count`,
  },
  {
    title: "Editable properties",
    description: "the @editable attribute",
    code: `@editable
Var Health : int = 100

@editable
Var Name : string = "Player"`,
  },
  {
    title: "Failable expressions",
    description: "the ? failable suffix and optional access",
    code: `FindPlayer(Name : string)<decides> : player =
    for (P : GetPlayspace().GetPlayers(), P.GetName[] = Name):
        P`,
  },
];
