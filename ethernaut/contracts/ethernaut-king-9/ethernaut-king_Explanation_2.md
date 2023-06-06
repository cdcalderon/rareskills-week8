## The King Contract

The King contract is a simple Ethereum smart contract where an account can become the 'king' if it sends more Ether than the current 'prize'. The prize money is sent to the previous king. Here is the contract's key function.

```solidity
receive() external payable {
        require(msg.value >= prize || msg.sender == owner);

        // Transfers the value sent to the current king. If the king is a contract,
        // this would call the contract's `receive` or `fallback` function
        payable(king).transfer(msg.value);

        king = msg.sender;
        prize = msg.value;
    }

```

the critical part is `payable(king).transfer(msg.value);` because it causes an external call to another contract, which can cause unexpected behavior if the `receive` or `fallback` function of the called contract is set to revert transactions or consume more gas than the transfer function provides.
