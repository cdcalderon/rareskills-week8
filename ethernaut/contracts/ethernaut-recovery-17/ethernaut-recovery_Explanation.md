# Ethernaut Level 17 - Recovery: Explanation and Solution

## Objectives

In this level, the **objective** is to find a contract address that was lost and recover the Ether stored within it. The contract was created by a contract factory, but the creator lost track of the contract address. Your task is to find this address and then call the `destroy()` function on it to withdraw the Ether.

## Solution

There are **two ways** to solve this problem:

### Method 1: Calculate the Lost Contract Address

According to the Ethereum Yellow Paper, the address of a new account (contract) is the rightmost 160 bits of the Keccak hash of the RLP encoding of the sender (creator) and nonce. Here, nonce is the number of contracts created by the factory contract. RLP is Ethereum's primary data serialization method.

In this case, assuming that the lost contract is the first contract created by the factory, so nonce is 1. Then you can calculate the lost address with the mentioned line of Solidity code.

```solidity
address payable lostContract = address(
    uint160(uint256(keccak256(abi.encodePacked(bytes1(0xd6), bytes1(0x94), address(level), bytes1(0x01)))))
);
```

## Code Breakdown

The line of code used to predict or calculate the address of a contract that was or will be deployed on the Ethereum network has several parts to it:

- `abi.encodePacked(bytes1(0xd6), bytes1(0x94), address(level), bytes1(0x01))`: This is doing RLP (Recursive Length Prefix) encoding on a few pieces of data. RLP is the main data encoding method used in Ethereum to encode data in transactions and blocks. It's encoding a list which consists of the RLP prefix for 20-byte addresses (0xd6, 0x94), the address of the contract creating the new contract, and the nonce (1 in this case).

- `keccak256()`: This is a hashing function widely used in Ethereum. It's used to give a unique hash value to the RLP encoded data.

- `uint256()`: This converts the bytes32 hash to a uint256. It's necessary because the address type is a 160-bit length number, and without converting it first to uint256, you wouldn't be able to cast it to uint160 in the next step.

- `uint160()`: This is truncating the hash from 256 bits down to 160 bits. Ethereum addresses are 160 bits in length.

- `address()`: This is casting the 160-bit number to an address.

- `address payable lostContract =`: Finally, it's assigning the calculated address to a variable of type `address payable`. The `payable` keyword allows this address to receive Ether.

### Method 2: Use Etherscan

Searching contract creation transactions: By entering the address of the factory contract in Etherscan, we can find the contract creation transactions and thus the address of the lost contract.

## The Exploit

Once we have the lost contract address, we can call the `destroy()` function to withdraw the Ether.

## Takeaways

- Contract addresses are deterministic, and sensitive business logic should be validated accordingly.
- Ether can be sent to a non-existent contract, so validations around the contract's balance should be enforced.
