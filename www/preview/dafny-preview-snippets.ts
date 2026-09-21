export type DafnyPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const dafnyPreviewSnippets: DafnyPreviewSnippet[] = [
  {
    title: "Binary search",
    description:
      "requires/ensures pre- and postconditions on a method, plus a loop invariant",
    code: `method BinarySearch(a: array<int>, key: int) returns (index: int)
  requires forall i, j :: 0 <= i < j < a.Length ==> a[i] <= a[j]
  ensures 0 <= index ==> index < a.Length && a[index] == key
  ensures index < 0 ==> forall i :: 0 <= i < a.Length ==> a[i] != key
{
  var lo, hi := 0, a.Length;
  while lo < hi
    invariant 0 <= lo <= hi <= a.Length
    decreases hi - lo
  {
    var mid := lo + (hi - lo) / 2;
    if a[mid] == key {
      return mid;
    } else if a[mid] < key {
      lo := mid + 1;
    } else {
      hi := mid;
    }
  }
  return -1;
}`,
  },
  {
    title: "A verified linked list datatype",
    description: "datatype, ghost function, and a lemma",
    code: `datatype List<T> = Nil | Cons(head: T, tail: List<T>)

ghost function Length<T>(l: List<T>): nat
{
  match l
  case Nil => 0
  case Cons(_, tail) => 1 + Length(tail)
}

lemma LengthNonNegative<T>(l: List<T>)
  ensures Length(l) >= 0
{}

function Append<T>(l1: List<T>, l2: List<T>): List<T>
  ensures Length(Append(l1, l2)) == Length(l1) + Length(l2)
{
  match l1
  case Nil => l2
  case Cons(x, xs) => Cons(x, Append(xs, l2))
}`,
  },
  {
    title: "A class with an invariant",
    description: "class, constructor, and modifies/reads clauses",
    code: `class Account {
  var balance: int
  ghost var Repr: set<object>

  constructor(initial: int)
    requires initial >= 0
    ensures balance == initial
  {
    balance := initial;
  }

  method Deposit(amount: int)
    requires amount >= 0
    modifies this
    ensures balance == old(balance) + amount
  {
    balance := balance + amount;
  }

  method Withdraw(amount: int) returns (ok: bool)
    requires amount >= 0
    modifies this
    ensures ok ==> balance == old(balance) - amount
    ensures !ok ==> balance == old(balance)
  {
    if amount <= balance {
      balance := balance - amount;
      ok := true;
    } else {
      ok := false;
    }
  }
}`,
  },
];
