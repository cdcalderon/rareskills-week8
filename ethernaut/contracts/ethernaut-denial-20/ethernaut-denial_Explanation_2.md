## Denial Contract and Vulnerability

```solidity
function withdraw() public {
    uint amountToSend = address(this).balance / 100;
    partner.call{value: amountToSend}("");
    payable(owner).transfer(amountToSend);
    timeLastWithdrawn = block.timestamp;
    withdrawPartnerBalances[partner] += amountToSend;
}
```

The `withdraw()` function transfers 1% of the contract's balance to the `partner` and the `owner`. The `call` function used to send funds to the `partner` does not check whether this operation is successful or not. If this `call` fails, it will stop execution and the `owner` will not receive their funds, leading to a potential denial of service.

`DenialAttacker` contract takes advantage of this vulnerability. Here's the crucial part of it:

```solidity
fallback() external payable {
    assert(false);
}
```

The `fallback` function reverts any transaction, ensuring that the `call` from the `Denial` contract always fails.
