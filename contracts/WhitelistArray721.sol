//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WhitelistArray721 is ERC721, Ownable {
    uint currTokenId = 1;
    address[] whitelistedUsers;

    constructor() ERC721("Token", "TKN"){
    }

    function mintPublicSale() external payable {
        require(msg.value >= 0.5 ether, "You must send at least 0.5 ether");
        _mint(msg.sender, currTokenId++);
    }

    function mintWhitelist() external payable {
        require(isWhitelisted(msg.sender), "You are not whitelisted");
        require(msg.value >= 0.2 ether, "You must send at least 0.2 ether");
        _mint(msg.sender, currTokenId++);
    }

    function addToWhitelist(address user) external onlyOwner {
        require(!isWhitelisted(user), "User is already whitelisted");
        whitelistedUsers.push(user);
    }

    function isWhitelisted(address _user) public view returns (bool) {
        for(uint i=0; i<whitelistedUsers.length; i++){
            if(whitelistedUsers[i] == _user){
                return true;
            }   
        }
        return false;
    }
}
