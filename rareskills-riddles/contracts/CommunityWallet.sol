// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

contract CommunityWallet {
    address public governance;

    constructor(address _governance) payable {
        governance = _governance;
    }

    function exec(address target, bytes calldata data, uint256 value) external {
        require(msg.sender == governance, "Caller is not governance contract");
        (bool res, ) = target.call{value: value}(data);
        require(res, "call failed");
    }

    fallback() external payable {}
}
