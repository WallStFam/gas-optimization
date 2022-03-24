//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract Enumerable721 is ERC721Enumerable {
    uint tokenId = 1;

    constructor() ERC721("Token", "TKN"){
    }

    function mint() external payable {
        require(msg.value >= 0.1 ether, "Not enough ether");
        _mint(msg.sender, tokenId);
        tokenId++;
    }
}
