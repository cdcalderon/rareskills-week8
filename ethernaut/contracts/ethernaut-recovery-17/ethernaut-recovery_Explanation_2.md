The `Recovery` contract is a factory contract that generates `SimpleToken` contracts.

```solidity
pragma solidity ^0.8.0;

contract Recovery {
    //generate tokens
    function generateToken(string memory _name, uint256 _initialSupply) public {
        new SimpleToken(_name, msg.sender, _initialSupply);
    }
}
```

The Ethereum Yellow Paper dictates how a contract's address is determined. In short, it's the rightmost 160 bits of the Keccak hash of the RLP encoding of the creator's address and nonce.

Given that the lost contract was the first one created by the factory, the nonce is 1. We can calculate the lost contract's address like so:

```solidity
address payable lostContract = address(
    uint160(uint256(keccak256(abi.encodePacked(bytes1(0xd6), bytes1(0x94), address(level), bytes1(0x01)))))
);
```

This line of code calculates the address using RLP encoding, keccak256 hashing, and several type conversions.

Regardless of the method used to find the lost contract's address, the final step is to call the `destroy()` function on that contract to withdraw the Ether.
