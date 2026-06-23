export type VyperPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const vyperPreviewSnippets: VyperPreviewSnippet[] = [
  {
    title: "Token contract",
    description: "decorators, types, and events",
    code: `# @version 0.3.10

balances: public(HashMap[address, uint256])

event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    amount: uint256

@external
def transfer(to: address, amount: uint256) -> bool:
    assert self.balances[msg.sender] >= amount, "insufficient balance"
    self.balances[msg.sender] -= amount
    self.balances[to] += amount
    log Transfer(msg.sender, to, amount)
    return True`,
  },
  {
    title: "View functions",
    description: "constants, immutables, and internal helpers",
    code: `MAX_SUPPLY: constant(uint256) = 1_000_000
owner: immutable(address)

@deploy
def __init__():
    owner = msg.sender

@view
@external
def is_owner(account: address) -> bool:
    return account == owner`,
  },
];
