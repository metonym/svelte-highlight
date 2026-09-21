export type FstarPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const fstarPreviewSnippets: FstarPreviewSnippet[] = [
  {
    title: "A verified factorial",
    description: "let rec, a val signature, and a Lemma with requires/ensures",
    code: `(* factorial and a proof that it's always at least 1 *)
let rec factorial (n:nat) : nat =
  if n = 0 then 1 else n * factorial (n - 1)

val factorial_pos : n:nat -> Lemma (requires True) (ensures (factorial n >= 1))
let rec factorial_pos n =
  if n = 0 then () else factorial_pos (n - 1)`,
  },
  {
    title: "A noeq record with an effectful field",
    description: "noeq type, the Tot effect, and inline_for_extraction",
    code: `noeq type stream (a:Type) = {
  head: a;
  tail: unit -> Tot (stream a);
}

inline_for_extraction
let rec nth (#a:Type) (s:stream a) (n:nat) : Tot a =
  if n = 0 then s.head else nth (s.tail ()) (n - 1)`,
  },
  {
    title: "A ghost lemma about list length",
    description: "ghost, GTot, and unfold in a small proof",
    code: `unfold let rec length (#a:Type) (l:list a) : GTot nat =
  match l with
  | [] -> 0
  | _ :: tl -> 1 + length tl

val append_length : #a:Type -> l1:list a -> l2:list a ->
  Lemma (ensures (length (l1 @ l2) = length l1 + length l2))
let rec append_length l1 l2 =
  match l1 with
  | [] -> ()
  | _ :: tl -> append_length tl l2`,
  },
];
