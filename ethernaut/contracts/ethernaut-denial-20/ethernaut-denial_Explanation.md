# Denial Challenge - Ethernaut CTF

## Challenge

The main objective is to prevent the contract owner from withdrawing funds from the smart contract, effectively causing a Denial of Service (DoS) attack, while ensuring the gas limit stays at 1M or less.

## Vulnerability

The contract contains a `withdraw()` function which makes an unchecked low-level `call` to an address set by `setWithdrawPartner()`. This unchecked `call` is the major vulnerability, as it does not check the return value. This `call` forwards all gas or specifies it to another smart contract that we can control. An external call that doesn't check the return value can be exploited to consume all forwarding gas, leading to a transaction revert due to out of gas.

Currently, if the `partner.call{value: amountToSend}("");` operation fails, the execution halts, and the next lines of code, including the owner's transfer, are not run. If you checked the success of the operation, you could implement logic that would handle a failure case in a way that doesn't compromise the functioning of the rest of your contract.

A common way to check the success of a call is to capture the return value of the call operation, which is a boolean. Here is a simple example:

```solidity
(bool success,) = partner.call{value: amountToSend}("");
if (!success) {
    // handle the failure case, e.g., emit an event, revert the transaction, etc.
} else {
    // proceed with the remaining operations, such as transferring to the owner
    payable(owner).transfer(amountToSend);
}
```

## Exploit

The vulnerability can be exploited in two ways:

1. **Infinite Loop Exploit:** This Challange can be solve by creating a contract that has a fallback function which enters an infinite loop, using up all available gas when called. This leads to failure of `partner.call.value(amountToSend)("")` in the `withdraw()` function due to gas shortage, thereby blocking the owner's `transfer` operation.

2. **Revert Exploit:** Alternatively, this challenge can be solved by creating a contract with a fallback function that simply reverts the transaction using the `revert()` function. This causes any call to this contract to fail, hence preventing the `transfer` operation in the `withdraw()` function of the original contract. This approach doesn't consume all gas but directly causes the transaction to fail.

## Key Takeaways

This challenge underlines the risks associated with unchecked low-level calls in smart contracts. It is crucial to always handle the return values of external calls to avoid unexpected behaviors. Also, be wary of reentrancy attacks and gas limit issues when making calls to unknown addresses.
