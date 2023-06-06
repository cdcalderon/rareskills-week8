# Oligarchy Governance Vulnerability

Proposals can be created, and voters can cast their votes on these proposals. If a proposal receives enough votes, it can be executed.

However, the flaw lies in the way mappings inside structs are cleared when using the `delete` keyword. When a Viceroy is deposed, the `delete` keyword is used to clear their struct, but it fails to clear the mapping inside the struct. This means that even after a Viceroy is deposed, the votes of their approved voters still count.

Here's how an attacker can exploit this vulnerability:

1. The attacker creates a malicious Viceroy contract and predicts its address before it's actually deployed.
   The ViceroyAttacker contract is based on the concept of `deterministic address generation` using the `CREATE2` opcode.

The `CREATE2` opcode allows contract deployment to a specific address determined by the contract bytecode, a salt value, and the address of the deploying contract. By manipulating these parameters, it is possible to predict the address where the contract will be deployed.

```solidity
// Address Prediction
bytes memory bytecode = type(ViceroyAttacker).creationCode;
bytecode = abi.encodePacked(
    bytecode,
    abi.encode(_governance, player, _communityWallet)
);
bytes32 hash = keccak256(
    abi.encodePacked(
        bytes1(0xff),
        address(this),
        uint(123),
        keccak256(bytecode)
    )
);
address deployedAddr = address(uint160(uint(hash)));
```

2. Using an Oligarch account, the attacker appoints the Viceroy, giving them the power to approve voters.

3. The attacker approves multiple voters through the Viceroy contract. These voters will be used to cast votes on proposals.

4. The attacker then proceeds to create a proposal.

```solidity
// Creating a Malicious Proposal
bytes memory data = abi.encodeWithSignature(
    "exec(address,bytes,uint256)", // will transfer balance to player
    _player, // player address
    "0x", // not needed to transfer balance
    value
);
Governance(_governance).createProposal(_player, data);
```

5. The voters, approved by the Viceroy, cast their votes in favor of the attacker's proposal.

6. Now, here's the crucial part: even if the Viceroy is deposed, the votes from their approved voters still count due to the flaw in the contract's implementation. This is because the `delete` keyword fails to clear the mapping inside the struct.

```solidity
function deposeViceroy(address viceroy, uint256 id) external {
    require(oligargyNFT.ownerOf(id) == msg.sender, "Not an oligarch");
    require(viceroys[viceroy].appointedBy == id, "Only the appointer can depose");

    idUsed[id] = false;
    delete viceroys[viceroy]; // The flaw: Mappings inside the struct are not cleared
}
```

7. The attacker repeats steps 3-6, adding more approved voters and votes to increase the chances of the proposal being executed.

8. Eventually, when the proposal receives enough votes, it is executed, and the attacker successfully transfers all funds from the CommunityWallet to their own account.

## Takeaways

It is crucial for developers to understand the potential implications of using certain keywords, such as `delete`, and to ensure that data structures are cleared correctly.
