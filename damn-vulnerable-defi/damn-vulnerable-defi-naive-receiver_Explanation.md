# Exploiting the "Naive receiver" (Level 2) of Damn Vulnerable DeFi (DVDF) Challenge

The exploit in the "Naive receiver" (Level 2) of the Damn Vulnerable DeFi (DVDF) challenge revolves around the `flashLoan` function in the `NaiveReceiverLenderPool` contract. Let's analyze the exploit and its solution:

## Vulnerability

The vulnerability lies in the lack of validation in the `flashLoan` function. The function does not check if the borrower address provided is the actual caller (`msg.sender`). This allows an attacker to enter any user's address as the borrower and request a flash loan on their behalf.

## Exploit

To drain all the ETH from the user's contract, the attacker can call the `flashLoan` function multiple times, charging a fee of 1 ETH each time. By calling `flashLoan(FlashLoanReceiver_address, 0)` ten times, the attacker can drain the entire balance of the user's contract.

## Efficiency and Single Transaction Solution

To achieve the objective in a single transaction involves using a loop to call `flashLoan` ten times with a borrow amount of 0 or any amount, which charges a fee of 1 ETH in each call, effectively draining the flash loan receiver in a single transaction.

Here's an example of the improved solution in code:

```solidity
for (uint i = 0; i < 10; i++) {
    NaiveReceiverLenderPool.flashLoan(FlashLoanReceiver_address, 0);
}
```

# Key Takeaways

- Input validation and access control are critical when implementing functions that involve tokens or Ether.
- Validating the borrower's address is essential to prevent unauthorized flash loans.
- The exploit could have been prevented by including a validation check, such as `require(borrower == msg.sender)`, inside the `flashLoan` function.
