// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MintPhases721 is ERC721 {
    uint tokenId = 1;

    constructor() ERC721("Token", "TKN"){
    }

    function mint() external payable {
        require(msg.value >= 0.1 ether, "Not enough ether");
        _mint(msg.sender, tokenId);
        tokenId++;
    }

    // This function is used just as an example to compare the cost of using an 'if statement' vs multiple functions
    function mintPhases(uint a) external payable {
        require(msg.value >= 0.1 ether, "Not enough ether");
        if(a == 1){
            _mint(msg.sender, tokenId);
            tokenId++;
        } else if(a == 2){
            _mint(msg.sender, 1000 + tokenId);
            tokenId++;
        }
    }
}
