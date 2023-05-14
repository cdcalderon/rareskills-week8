// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./Governance.sol";
import "./CommunityWallet.sol";

contract OligarchyNFT is ERC721 {
    constructor(address attacker) ERC721("Oligarch", "OG") {
        _mint(attacker, 1);
    }

    function _beforeTokenTransfer(
        address from,
        address,
        uint256,
        uint256
    ) internal virtual {
        require(from == address(0), "Cannot transfer nft"); // oligarch cannot transfer the NFT
    }
}
