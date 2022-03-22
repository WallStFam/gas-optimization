# Gas Optimization

We've all been there. A new collection drops and you go and try to mint just to find that the gas fees are much more expensive than the NFT itself. Jeez!

This is clearly not a good user experience. So, when creating the smart contract for your NFT collection, one of your main objectives is to make gas fees for minting as cheap as possible.

In this article we'll go through different ways to accomplish this:

<ol>
    <li>Do you really need ERC721Enumerable?</li> 
    <li>Use mappings instead of arrays</li>
    <li>ERC721A standard</li>
    <li>Merkle Tree for whitelists</li>
    <li>Packing your variables</li>
    <li>Using unchecked</li>
    <li>Optimizer</li>
    <li>Why is first mint more expensive and is there anything you can do about it?</li>
</ol>

All the code mentioned in this article can be found in: https://github.com/WallStFam/gas-optimization

Feel free to use it in your own project. At Wall St Fam we believe blockchain is our future and thus we want to help where we can in making blockchain development more accesible to anyone.

After explaining all these topics, we'll go show you how you can test how much gas your smart contract functions use.

We'll finish this article, picking smart contracts from popular NFT collections to see what they did right and what could be improved.

</br>

## 1. Do you really need ERC721Enumerable?

When coding a mint function, you need to make sure that the function uses the minimum code necessary.

Sometimes it's tempting to add more functionality to a contract just in case one needs it in the future or add it to make off-chain queries easier. The problem is that any extra functionality you add will increase the gas costs.

One of the most commom cases of expensive mint functions is having your contract inherit from ERC721Enumerable. The problem with this extension is that it adds a lot of overhead to any transfer(be it the transfer done from the contract to the user when the user mints, or any transfer from one user to another user).

ERC721Enumerable uses 4 mappings and an array to keep track of the token ids each user has. And, of course, writing to those structures in each transfer costs a lot of gas.

Here is a comparison of the gas costs to mint one token from two smart contracts. One inherits from ERC721Enumerable and the other doesn't:

|               | Gas used |
| ------------- | -------- |
| Vanilla721    | 69294    |
| Enumerable721 | 141122   |

ERC721Enumerable is 2 times as costly as vanilla ERC721.

The difference in gas used is even more pronounced if you look into mints that come after the first one:

|               | Gas used(after first mint) |
| ------------- | -------------------------- |
| Vanilla721    | 52194                      |
| Enumerable721 | 146722                     |

ERC721Enumerable is almost 3 times as costly as vanilla ERC721 after the first mint!

(_Note: In Solidity it's more expensive to set variables from zero to non-zero than from non-zero to non-zero. That's why first mints in ERC721 are more costly because the balance of a user changes from 0 to 1. But what is interesting to notice is that although first mints in ERC721 are more costly, first mints in ERC721Enumerable are less expensive. If you are interested and want to know why that happens, check line 98 of https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol The first mint is more expensive because \_addTokenToOwnerEnumeration(address, uint256) sets the value in the mapping to zero the first time and setting a zero value to zero has no cost_)

So before adding ERC721Enumerable, you need to ask yourself: "Do I really need this functionality inside my contract?"

If you are only going to query the token ids for each user from outside the contract, then there are ways to do it without using ERC721Enumerable.

Here, we introduce two ways to do it using ethers.js:

<ul>
    <li>Call ownerOf(uint tokenId) for each token. </li>
    <li>Query the Transfer events from ERC721 and process them to get the owners of each token</li>
</ul>

You can find scripts for both methods in our github repository:

-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/getAllOwners/getAllOwners_ownerOf.js
-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/getAllOwners/getAllOwners_transfer_event.js

These are scripts that will query the blockchain and get the owner of each token of an ERC721 contract.

We used Wall Street Dads contract as an example in those scripts, but you are free to use the code with any other contract. You just need to replace the abi and contract address.

</br>

## 2. Use mappings instead of arrays

Sometimes it's possible to replace the functionality of an array with a mapping. The advantage of mappings is that you can access any value without having to traverse other items like with an array.

For example, let's say you want to add administrator accounts to your contract. These administrators are able to execute some functions that normal users can't.
You could have an array of administrators and a function to add new administrators:

```
address[] admins;

function addAdmin(address _admin) external {
    adminis.push(_admin);
}
```

A function modifier can check if an address is an administrator, and we can use that modifier in different functions that only administrators can call:

```
function isAdmin(address _admin) public view returns (bool) {
    for(uint i=0; i<admins.length; i++) {
        if(admins[i] == _admin) {
            return true;
        }
    }
    return false;
}
```

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
