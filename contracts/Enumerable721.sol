//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Enumerable721 is ERC721Enumerable {
    constructor() ERC721("Token", "TKN"){
    }

    function mint(uint tokenId) external {
        _mint(msg.sender, tokenId);
    }
}
