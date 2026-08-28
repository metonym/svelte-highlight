export type FennelPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const fennelPreviewSnippets: FennelPreviewSnippet[] = [
  {
    title: "A function and a loop",
    description: "fn, local, each, and Lua built-ins",
    code: `;; sum two numbers
(fn add [a b]
  (+ a b))

(local greeting :hello)
(each [i v (ipairs [1 2 3])]
  (print i v))

(print (add 1 2) greeting "done")`,
  },
  {
    title: "Tables and iteration",
    description: "a table literal, keyword keys, and icollect",
    code: `(local person {:name "Ada" :age 30})

(icollect [_ v (pairs person)]
  (tostring v))

(print person.name)`,
  },
  {
    title: "Conditionals and match",
    description: "when, match, and accumulate",
    code: `(fn classify [n]
  (match n
    0 :zero
    _ (if (> n 0) :positive :negative)))

(accumulate [total 0
             _ n (ipairs [1 2 3])]
  (+ total n))`,
  },
];
