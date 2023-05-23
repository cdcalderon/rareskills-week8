pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract EvilToken is ERC20 {
    constructor() ERC20("EvilToken", "EVL") {
        _mint(msg.sender, 400);
    }
}
