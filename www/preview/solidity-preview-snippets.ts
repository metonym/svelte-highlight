export type SolidityPreviewSnippet = {
  title: string;
  description?: string;
  code: string;
};

export const solidityPreviewSnippets: SolidityPreviewSnippet[] = [
  {
    title: "NatSpec comments",
    description: "/// @title, @notice, @param",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title A simple counter
/// @notice Stores a number that anyone can increment
contract Counter {
  uint256 public count;

  /// @param amount the value to add
  function increment(uint256 amount) external {
    count += amount;
    emit Incremented(msg.sender, amount);
  }

  event Incremented(address indexed by, uint256 amount);
}`,
  },
  {
    title: "Mappings and modifiers",
    description: "uint8, bytes32, mapping, modifier, require",
    code: `pragma solidity ^0.8.24;

contract Token {
  mapping(address => uint256) private _balances;
  uint8 public constant decimals = 18;
  bytes32 public immutable salt;
  address payable public owner;

  modifier onlyOwner() {
    require(msg.sender == owner, "not owner");
    _;
  }

  function transfer(address to, uint256 amount)
    public
    returns (bool success)
  {
    require(_balances[msg.sender] >= amount, "insufficient");
    _balances[msg.sender] -= amount;
    _balances[to] += amount;
    return true;
  }
}`,
  },
  {
    title: "Interface and library",
    description: "interface, library, is, ether, assembly",
    code: `pragma solidity ^0.8.24;

interface IERC20 {
  function totalSupply() external view returns (uint256);
}

library Math {
  function max(uint256 a, uint256 b) internal pure returns (uint256) {
    return a >= b ? a : b;
  }
}

contract Vault is IERC20 {
  using Math for uint256;

  uint256 public totalSupply = 1_000 ether;
  uint256 public lockUntil = block.timestamp + 30 days;

  function totalSupply() external view returns (uint256) {
    uint256 free;
    assembly {
      free := sload(0)
    }
    return free;
  }
}`,
  },
];
