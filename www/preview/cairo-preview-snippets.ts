export type CairoPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const cairoPreviewSnippets: CairoPreviewSnippet[] = [
  {
    title: "Starknet contract",
    description: "attributes, traits, and storage",
    code: `#[starknet::contract]
mod Counter {
    #[storage]
    struct Storage {
        count: u128,
    }

    #[external(v0)]
    fn increment(ref self: ContractState, amount: u128) {
        let current = self.count.read();
        self.count.write(current + amount);
    }
}`,
  },
  {
    title: "Generic function",
    description: "felt252, integer types, and pattern matching",
    code: `fn fib(n: felt252) -> felt252 {
    match n {
        0 => 0,
        1 => 1,
        _ => fib(n - 1) + fib(n - 2),
    }
}`,
  },
  {
    title: "Macros and syscalls",
    description: "panic!/assert!/array!, and Starknet syscalls",
    code: `fn withdraw(ref self: ContractState, amount: u128) {
    let caller = get_caller_address();
    let contract = get_contract_address();
    let now = get_block_timestamp();

    assert!(amount > 0, "amount must be positive");

    let mut history: Array<felt252> = array![];
    if caller == contract {
        panic!("cannot withdraw to self");
    }
    history.append(now.into());
}`,
  },
];
