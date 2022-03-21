//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract AdminMapping721 is ERC721 {
    mapping(address => bool) admins;
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
        admins[_admin] = true;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Only admin allowed");
        _;
    }
}
