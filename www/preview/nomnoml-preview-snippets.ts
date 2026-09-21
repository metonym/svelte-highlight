export type NomnomlPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const nomnomlPreviewSnippets: NomnomlPreviewSnippet[] = [
  {
    title: "Request path",
    description: "an actor, a service, and a database",
    code: `#direction: right
#stroke: #33322E

[<actor> Customer] -> [Web]
[Web] -> [API|checkout(); refund()]
[API] -:> [<database> Orders]`,
  },
  {
    title: "Decorator pattern",
    description: "a frame with generalization arrows",
    code: `#direction: down
[<frame> Decorator pattern|
  [<abstract> Component||+ operation()]
  [Decorator|- next: Component|+ operation()]
  [Decorator]<:-[Component]
  [ConcreteDecorator|- state|+ operation()]
  [ConcreteDecorator]<:-[Decorator]
]`,
  },
  {
    title: "Pirate and ship",
    description: "compartments, a range, and implementation",
    code: `[Pirate|eyeCount: Int|raid(); pillage()|
  [beard]--[parrot]
  [beard]-:>[foul mouth]
]

[<abstract> Marauder]<:--[Pirate]
[Pirate]- 0..1 [Ship]`,
  },
];
