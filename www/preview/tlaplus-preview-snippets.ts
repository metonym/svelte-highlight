export type TlaplusPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const tlaplusPreviewSnippets: TlaplusPreviewSnippet[] = [
  {
    title: "A counter's spec and invariant",
    description: "MODULE banner, VARIABLE, and a THEOREM about the spec",
    code: `---- MODULE Counter ----
EXTENDS Naturals

VARIABLE count

TypeOK == count \\in Nat

Init == count = 0

(* the next-state relation
   (* count only ever goes up *) *)
Next == count' = count + 1

Spec == Init /\\ [][Next]_count

THEOREM Spec => [](TypeOK)
====`,
  },
  {
    title: "Two-phase commit",
    description: "CONSTANT, a state machine over a set of resource managers",
    code: `---- MODULE TwoPhaseCommit ----
EXTENDS Naturals, FiniteSets

CONSTANT RM

VARIABLE rmState

Init == rmState = [rm \\in RM |-> "working"]

canCommit == \\A rm \\in RM : rmState[rm] \\in {"prepared", "committed"}

Prepare(rm) ==
  /\\ rmState[rm] = "working"
  /\\ rmState' = [rmState EXCEPT ![rm] = "prepared"]

Commit(rm) ==
  /\\ canCommit
  /\\ rmState' = [rmState EXCEPT ![rm] = "committed"]

Abort(rm) ==
  /\\ rmState[rm] # "committed"
  /\\ rmState' = [rmState EXCEPT ![rm] = "aborted"]
====`,
  },
  {
    title: "Mutual exclusion with unicode operators",
    description: "∀, ∈, and → in a safety property",
    code: `---- MODULE MutexSafety ----
EXTENDS Naturals

CONSTANT Procs

VARIABLE pc

MutualExclusion ==
  ∀ p1, p2 ∈ Procs :
    (p1 # p2) → ¬(pc[p1] = "critical" ∧ pc[p2] = "critical")

THEOREM Spec => [](MutualExclusion)
====`,
  },
];
