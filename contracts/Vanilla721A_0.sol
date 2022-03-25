// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./standards/ERC721A.sol";

contract Vanilla721A_0 is ERC721A {
    constructor() ERC721A("Token", "TKN"){
    }

    function mint(uint quantity) external payable{
        require(msg.value >= quantity * 0.1 ether, "Not enough ether");
        super._mint(msg.sender, quantity, '', true);
    }

    function _startTokenId() internal pure override returns (uint256) {
        return 0;
    }
}
