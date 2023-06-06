// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contract that allows a partner to withdraw a portion of the contract's funds
contract Denial {
    address public partner; // Address of the partner that can withdraw funds
    address public constant owner = address(0xA9E); // Constant address of the owner
    uint timeLastWithdrawn; // Timestamp of the last withdrawal
    mapping(address => uint) withdrawPartnerBalances; // Mapping to track how much each partner has withdrawn

    // Sets the address of the withdrawal partner
    function setWithdrawPartner(address _partner) public {
        partner = _partner;
    }

    // Withdraw function to split 1% of the contract's balance between the partner and owner
    function withdraw() public {
        uint amountToSend = address(this).balance / 100; // Calculate 1% of the contract's balance
        // Unchecked call to partner's address. If this fails for any reason (e.g., the partner contract reverts
        // the transaction or runs out of gas), the owner will not be able to withdraw funds.
        partner.call{value: amountToSend}("");
        // Transfer 1% of the contract's balance to the owner
        payable(owner).transfer(amountToSend);
        // Update the timestamp of the last withdrawal
        timeLastWithdrawn = block.timestamp;
        // Update the partner's withdrawn balance
        withdrawPartnerBalances[partner] += amountToSend;
    }

    // Fallback function that allows the contract to receive funds
    receive() external payable {}

    // Function to get the contract's current balance
    function contractBalance() public view returns (uint) {
        return address(this).balance;
    }
}
