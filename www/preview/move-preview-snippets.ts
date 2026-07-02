export type MovePreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const movePreviewSnippets: MovePreviewSnippet[] = [
  {
    title: "Coin module",
    description: "modules, abilities, and resources",
    code: `module 0x1::Coin {
    struct Coin has key, store {
        value: u64,
    }

    public fun mint(value: u64): Coin {
        Coin { value }
    }

    public fun value(coin: &Coin): u64 {
        coin.value
    }
}`,
  },
  {
    title: "Entry function",
    description: "signer, address literals, and acquires",
    code: `module addr::Bank {
    use std::signer;

    public entry fun deposit(account: &signer, amount: u64) acquires Coin {
        let addr = signer::address_of(account);
        assert!(amount > 0, 1);
    }
}`,
  },
  {
    title: "Test-only functions",
    description: "#[test], #[test_only], and #[expected_failure]",
    code: `module addr::Bank {
    #[test_only]
    use std::unit_test;

    #[test]
    fun test_deposit() {
        assert!(1 + 1 == 2, 0);
    }

    #[test]
    #[expected_failure]
    fun test_withdraw_too_much() {
        abort 1
    }
}`,
  },
];
