//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AdminArray721 is ERC721 {
    address[] admins;
    uint currTokenId = 1;

    constructor() ERC721("Token", "TKN"){
        addAdmin(msg.sender);
    }

    function mintUser() external payable {
        require(msg.value > 0.1 ether, "You must send at least 0.1 ether");
        _mint(msg.sender, currTokenId++);
    }

    function mintAdmin() external onlyAdmin {
        _mint(msg.sender, currTokenId++);
    }

    function addAdmin(address _admin) public onlyAdmin {
        admins.push(_admin);
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Only admin allowed");
        _;
    }

    function isAdmin(address _admin) public view returns (bool) {
        for(uint i=0; i<admins.length; i++){
            if(admins[i] == _admin){
                return true;
            }   
        }
        return false;
    }
}
