# Gas Optimization

We've all been there. A new collection drops and you go and try to mint and find that the gas fees are much more expensive than the NFT itself.

When creating the smart contract for your NFT collection, one of your main objectives needs to be to lower the gas fees for your users. The great thing is that there is no drawback to doing this, since you don't get any money from gas fees and your users will be much happier paying for low gas fees to mint your NFT.

In this article we'll go through different ways to accomplish this:

<ul>
    <li>Do you really need ERC721Enumerable?</li> 
    <li>Use mappings instead of arrays</li>
    <li>ERC721A standard</li>
    <li>Merkle Tree for whitelists</li>
    <li>Packing your variables</li>
    <li>Using unchecked</li>
    <li>Optimizer</li>
    <li>Why first mint is more expensive</li>
</ul>

All the code for this article can be found in: https://github.com/WallStFam/gas-optimization

After we'll explain how you can test how much gas your different functions are using and how to test that in different networks.
We'll also revisit smart contracts from popular NFT collections and see what they did right and what could be improved.

## Do you really need ERC721Enumerable?

When coding a mint function, you need to make sure that all the code that's in that function is the minimum code necessary.
Sometimes it's tempting to add more functionality just in case one needs it in the future or add them so queries to the contract become easier. The problem is that any extra functionality you add will increase the gas cost needed to execute the function.
One of the most commom cases of this is make your contract inherit from ERC721Enumerable. The problem with this extension is that it adds a lot of overhead to any transfer(be it the transfer done from the contract to the user when the user mints, or any transfer from one user to another user).
ERC721Enumerable overwrites \_beforeTokenTransfer(address, address, uint) and it uses 4 mappings and an array to keep track of the token ids each user has.
Of course, writing to those structures in each transfer costs a lot of gas.
But what if you need that functionality?

Well, first you need to think if you really need it.

The only reason you would need it is if you will query that information from inside the contract. Since from outside the contract you have ways of finding that information without using ERC721Enumerable.

There are two ways to get the token ids for each user. One is to call ownerOf(uint tokenId) for each token. The other is to query the Transfer events from ERC721 and process them to get the owners of each token.
You can find scripts for both methods in the repo: https://github.com/WallStFam/gas-optimization

Here is a comparison of the gas costs to mint one token from two smart contracts. One inherits from ERC721Enumerable and the other doesn't:

Gas used
Vanilla721
69294
Enumerable721
141122

ERC721Enumerable is 2 times as costly as vanilla ERC721.

The difference in gas used is even more pronounced if you look into mints that come after the first one:

Gas used(after first mint)
Vanilla721
52194
Enumerable721
146722

In Solidity is more expensive to set variables from zero to non-zero than from non-zero to non-zero. That's why first mints in ERC721 are more costly because the balance of a user changes from 0 to 1. But what is interesting to notice is that although first mints in ERC721 are more costly, first mints in ERC721Enumerable are less expensive.
Note: If you are interested why that happens, check line 98 of https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol The first mint is more expensive because \_addTokenToOwnerEnumeration(address, uint256) sets the value in the mapping to zero the first time and setting a zero value to zero has no cost.

## Use mappings instead of arrays

Sometimes it's possible to replace the functionality of an array with a mapping. The advantage of mappings is that you can access any value without having to traverse other items like with an array.

For example, let's say you want to add administrator accounts to your contract. These administrators are able to execute some functions that normal users can't.
You could have an array of administrators and a function to add new administrators:

address[] admins;

    function addAdmin(address _admin) external {
    	adminis.push(_admin);

}

A function modifier can check if an address is an administrator, and we can use that modifier in different functions that only administrators can call:

function isAdmin(address \_admin) public view returns (bool) {
for(uint i=0; i<admins.length; i++) {
if(admins[i] == \_admin) {
return true;
}
}
return false;
}

## ERC721A

Explanation, background, how to use, how much gas is saved, where users are expending more gas

## Merkle Tree

Explanation, example, how much gas is saved, and link to another article with a much deeper explanation

## Packed variables

uint8,16, etc
Show example of how much gas can be saved in the mint function and how changing the variables even if they don't appear in the mint function can add to the gas costs because they are not packed correctly

## Unchecked

Explanation, show example of how much cost can be saved, warning when using it

## Optimizer

How it works, example of how much gas is saved when using it

Why is the first mint more expensive(for each user?)

Explain and show example of gas used(and maybe how can it be improved)

## Testing

How to test how much gas your functions are using in any network
Show hardhat example project

## Popular contracts

Show some examples from popular contracts
What they did right and what could be improved.

## Ideas for other articles:

Multiple reveal
Multiple mint phases
Wrapped NFTs(they unlock a different NFT)
Better updateable NFTs:
https://nftchance.medium.com/mimetic-metadata-how-to-create-a-truly-non-dilutive-nft-collection-in-2022-746a01f886c5

Code

Smart contracts
ERC721 vanilla
ERC721 that inherits from ERC721Enumerable

Scripts
Get the token ids for each user using ownerOf
Get the token ids for each user using events
