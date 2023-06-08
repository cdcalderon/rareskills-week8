## Denial Contract and Vulnerability

```solidity
function withdraw() public {
    uint amountToSend = address(this).balance / 100;

    // This line is important to the exploit. The call() is used to send funds to the partner
    // and does not check for success or failure of this operation. If this call fails (which
    // can be forced by a malicious contract set as the partner), then execution stops, and the
    // remaining code (including the owner's fund transfer) is not executed.
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
