# Ethernaut Level 23 - Dex Two Challenge

## Objective:

In this challenge, our task is to drain all tokens from the DexTwo contract, including both token1 and token2.

## The Challenge:

DexTwo is similar to the previous Dex challenge but with a slight modification in the `swap()` function. Initially, we have 10 tokens each of token1 and token2. DexTwo contract also holds 100 tokens each.

The goal is to exploit the vulnerability in the DexTwo contract to drain all the tokens from it.

## Vulnerability:

The `swap()` function in DexTwo lacks a certain condition check which was present in the previous level's Dex contract. In Dex, the `swap()` function had a requirement that checked if the swapping was happening between the two token types defined by the contract.

```javascript
require((from == token1 && to == token2) ||
  (from == token2 && to == token1), "Invalid tokens");
```

This requirement is missing in DexTwo. Hence, it allows us to swap any tokens, even the ones we create. This loophole is what we need to exploit.

## Exploitation Steps:

1. First, create our own ERC20 token named EvilToken (EVL).
2. Mint 400 EvilTokens and allocate them to ourselves.
3. Send 100 EVL tokens to DexTwo. This step ensures that the price ratio is balanced at 1:1 when swapping tokens.
4. Approve the DexTwo contract to spend 300 of our EVL tokens.

Next, initiate the `swap()` operations:

5. Swap 100 EVL with token1, this drains all of token1 from DexTwo.
6. According to the `get_swap_amount()` formula, to get all of the token2 from DexTwo, we need to swap twice the amount of EVL tokens (200) compared to the remaining EVL tokens (100) in DexTwo.

By the end of these operations, DexTwo is left with 0 tokens of both types, while we are left with 110 of each token.

## Key Takeaways:

The key takeaways are the importance of rigorous token validations, the necessity of precise calculations due to Solidity's lack of floating points to prevent exploits, and the careful scrutiny of business-critical logic if user-listed tokens are permitted for swapping to guard against potential contract exploitation.
