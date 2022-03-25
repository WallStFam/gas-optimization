// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract WhitelistMerkle721 is ERC721, Ownable {
    uint currTokenId = 1;
    bytes32 merkleRoot;

    constructor() ERC721("Token", "TKN"){
    }

    function mintPublicSale() external payable {
        require(msg.value >= 0.2 ether, "Not enough ether");
        _mint(msg.sender, currTokenId++);
    }

    function mintWhitelist(bytes32[] calldata _merkleProof) external payable {
        require(isWhitelisted(msg.sender, _merkleProof), "You are not whitelisted");
        require(msg.value >= 0.1 ether, "Not enough ether");
        _mint(msg.sender, currTokenId++);
    }

    function setWhitelist(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function isWhitelisted(address _user, bytes32[] calldata _merkleProof)
        public
        view
        returns (bool)
    {
        bytes32 leaf = keccak256(abi.encodePacked(_user));
        return MerkleProof.verify(_merkleProof, merkleRoot, leaf);
    }
}
