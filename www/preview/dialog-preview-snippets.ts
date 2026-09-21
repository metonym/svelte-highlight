export type DialogPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const dialogPreviewSnippets: DialogPreviewSnippet[] = [
  {
    title: "A room declaration",
    description: "an object, its name, description, and an exit",
    code: `#foyer

(room *)
(name *)	foyer of the Opera House

(look *)
	You are standing in a spacious hall, splendidly decorated
	in red and gold, with glittering chandeliers overhead.

(from * go #west to #cloakroom)`,
  },
  {
    title: "Branching with if/then/else",
    description: "the (if)...(then)...(else)...(endif) control-flow form",
    code: `(program entry point)
	(if) (bound #cloak) (then)
		You are wearing a black velvet cloak.
	(else)
		You feel a chill without a cloak.
	(endif)`,
  },
  {
    title: "A negated toggle and a state change",
    description: "the ~() negation prefix and the (now) predicate",
    code: `@($Obj is open)	~($Obj is closed)

(instead of #take #cloak)
	(now) ~(#cloak is closed)
	The cloak settles comfortably over your shoulders.`,
  },
];
