## Context

This case involves a smart contract named DexTwo, which is a simple decentralized exchange that allows two types of tokens to be swapped.

```solidity
contract DexTwo is Ownable {
    address public token1;
    address public token2;
    // ...
}
```

## The Vulnerability

The key vulnerability lies in the `swap` function of the `DexTwo` contract. In this function, there is no validation to ensure that the 'from' and 'to' tokens are the ones set by the owner.

```solidity
function swap(address from, address to, uint amount) public {
    // ...
    IERC20(from).transferFrom(msg.sender, address(this), amount);
    IERC20(to).approve(address(this), swapAmount);
    IERC20(to).transferFrom(address(this), msg.sender, swapAmount);
}
```

This missing validation allows a malicious user to swap any ERC20 token, even one they created and fully control, with the tokens set by the DexTwo contract owner.
