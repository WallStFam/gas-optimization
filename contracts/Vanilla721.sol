//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Vanilla721 is ERC721 {
    constructor() ERC721("Token", "TKN"){
    }

    function mint(uint tokenId) external {
        _mint(msg.sender, tokenId);
    }
}
