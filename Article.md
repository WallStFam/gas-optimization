# Gas Optimization

We've all been there. A new collection drops and you go and try to mint just to find that the gas fees are much more expensive than the NFT itself. Jeez!

This is clearly not a good user experience. So, when creating the smart contract for your NFT collection, one of your main objectives is to make gas fees for minting as cheap as possible.

In this article we'll go through different ways to accomplish this:

<ol>
    <li>Do you really need ERC721Enumerable?</li> 
    <li>Use mappings instead of arrays</li>
    <li>ERC721A standard</li>
    <li>Start with Token Id 1</li>
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
| Vanilla721    | 73.539   |
| Enumerable721 | 145.323  |

ERC721Enumerable is 2 times as costly as vanilla ERC721.

The difference in gas used is even more pronounced if you look into mints that come after the first one:

|               | Gas used(after first mint) |
| ------------- | -------------------------- |
| Vanilla721    | 56.439                     |
| Enumerable721 | 150.923                    |

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

Sometimes it's possible to replace the functionality of an array with a mapping. The advantage of mappings is that you can access any value without having to traverse other items like you normally do with an array.

For example, it's very common among NFT collections to use whitelists and users who are added to the whitelist have priority minting and access to a lower price than the public sale.

Inside the smart contract you could have an array of addresses for the whitelisted users:

```
address[] whitelistedUsers;

function mintPublicSale() external payable {
    require(msg.value >= 0.2 ether, "Not enough ether");
    _mint(msg.sender, currTokenId++);
}

function mintWhitelist() external payable {
    require(isWhitelisted(msg.sender), "You are not whitelisted");
    require(msg.value >= 0.1 ether, "Not enough ether");
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
```

And although this code works, it has a big problem: calling mintWhitelist() gets more expensive as more users are added to whitelistedUsers array.

Everytime you have a loop in solidity, make sure the loop is bounded. This means that the loop has a known amount of maximum iterations, and also that the amount of iterations is low. This is most important when this loop is inside a function that users will call.

If your loop is unbounded, then try a different approach. Moving things off-chain or using different code structures should be possible.

For this example of the whitelist, the code can be rewritten using a mapping:

```
mapping(address => bool) whitelistedUsers;

function mintPublicSale() external payable {
    require(msg.value >= 0.2 ether, "Not enough ether");
    _mint(msg.sender, currTokenId++);
}

function mintWhitelist() external payable {
    require(isWhitelisted(msg.sender), "You are not whitelisted");
    require(msg.value >= 0.1 ether, "Not enough ether");
    _mint(msg.sender, currTokenId++);
}

function addToWhitelist(address _user) external onlyOwner {
    whitelistedUsers[_user] = true;
}

function isWhitelisted(address _user) public view returns (bool) {
    return whitelistedUsers[_user];
}
```

Using a mapping for whitelistedUsers allows the smart contract to check if a user is whitelisted in only one instructions instead of using a loop.

This makes the code much cheaper to execute and it doesn't get more expensive when more users added to the whitelist(the cost is constant for any amount of whitelisted users).

This is the average cost of calling mintWhitelist() for different amount of users:

|               | WhitelistMapping(Avg) | WhitelistArray(Avg) |
| ------------- | --------------------- | ------------------- |
| MintWhitelist | 58.598                | 434.427             |

These values were calculated using a whitelist of 350 users and the users that minted where in different positions in the whitelist.

The values that you'd get for using WhitelistArray will vary depending on where inside the whitelist array is the msg.sender.
If it's at the beginning the call to mintWhitelist will be much cheaper than if it is at the very end.

The value for WhitelistMapping is always the same, independent of the amount of users. The average value for WhitelistMapping coincides with the min and max values.

For WhitelistArray the min and max values in this example ranged from 60.884(for a user at the beginning of the whitelist) to 990.516(for a user at the end of the list).

Full source code for the smart contracts can be found here:

-   https://github.com/WallStFam/gas-optimization/blob/master/contracts/WhitelistArray721.sol
-   https://github.com/WallStFam/gas-optimization/blob/master/contracts/WhitelistMapping721.sol

And this is the script that was used to calculate gas costs with each method:

-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/mintWhitelisted.js

</br>

## 3. ERC721A standard

The team from Azuki NFT(https://www.azuki.com/) published a new standard for ERC721 called ERC721A.

This new standard allows users to mint multiple tokens paying gas close to the cost of minting one.

The Azuki team has shared a good explanation of ERC721A in https://www.erc721a.org/

We'll revisit this new standard and make it easy to understand why it works and also how to apply the solutions they propose to other aspects of your smart contract.

Also it's important to mention that some of the cost saved on minting, is later incurred on transactions. It's up to you to decide where do you prefer your users to save on gas. The good thing is that the gas saved on minting can be much more than the extra gas payed for transactions.

For marketing purposes the Azuki team has compared the gas cost of minting using their standard to minting using ERC721Enumerable.

But to be fair, if we are comparing apples to apples they should have compared ERC721A with ERC721. Of course, comparing ERC721A to vanilla ERC721 doesn't have as big of an impact as comparing to ERC721Enumerable, which as we've seen already in this article, it adds a lot of overhead to minting.

But the good thing is that even comparing to vanilla ERC721, ERC721A makes minting much cheaper if you are minting multiple tokens as you can see in the following chart:

|          | ERC721    | ERC721A | Overhead    |
| -------- | --------- | ------- | ----------- |
| Mint 1   | 56.037    | 56.372  | -335        |
| Mint 2   | 112.074   | 58.336  | 53.738      |
| Mint 5   | 280.185   | 64.228  | 215.957     |
| Mint 10  | 560.370   | 74.048  | 486.322!    |
| Mint 100 | 5.603.700 | 250.808 | 5.352.892!! |

So... How did they achieve this much lower gas cost?

The way they did it is straightforward to understand:

When a user mints multiple tokens, ERC721A updates the balance of the minter only once, and also sets the owner of that batch of tokens as a whole instead of per token.

Setting variables for batches instead of per token, makes minting multiple tokens much cheaper if you want to mint many tokens.

As we mentioned earlier, the problem with ERC721A is that because of this minting optimization, users will incurr in more gas costs when they want to transfer tokens.

The following is chart created by simulating 20 users minting and transferring different amount of tokens a 100 times in random order:

|     | ERC721 | ERC721A |
| --- | ------ | ------- |
| Min | 40531  | 49215   |
| Max | 62431  | 105742  |
| Avg | 45451  | 70441   |

In average transferring tokens with ERC721A is 55% more expensive.

Then, to decide if you are going to use ERC721A, take into account this extra cost for transferring tokens and think if users will be minting big batches of tokens or not.

If you want to check these values yourself or simulate a higher amount of users or transfers, here is the script that was used to calculate the values:

https://github.com/WallStFam/gas-optimization/blob/master/scripts/vs721A_transfer.js

</br>

## 4. Start with Token Id 1

Many contracts start token id at zero(i.e Azuki, BAYC, etc).

And this is ok if you as the creator are going to do the first mint. Because as we mentioned before in the chapter "Do you really need ERC721Enumerable?", in Solidity it's expensive to set variables from zero to non-zero.

It's a nice trick to start the token id at 1, that way you'll make the first mint as much cheaper.

Here's a comparison of the first mint of a ERC721A contract using tokenId initialized at 0 and at 1:

|            | ERC721A(tokenId=0) | ERC721A(tokenId=1) | Overhead |
| ---------- | ------------------ | ------------------ | -------- |
| First mint | 90572              | 73472              | 17100    |

So if one of your users is going to make the first mint, make it cheaper for him by initializing tokenId in 1.

</br>

## 5. Merkle Tree for whitelists

In a previous chapter "Use mappings instead of arrays" we presented examples of contracts that implement whitelisting.

Those examples used either an array or mapping to store the whitelisted addresses. Although using a mapping was cheaper than using an array, it can still be a very expensive solution if you plan to have let's say a 1000 whitelisted users.

Here's how much it cost to whitelist users using an array and a mapping:

|                    | WhitelistArray | WhitelistMapping |
| ------------------ | -------------- | ---------------- |
| AddToWhitelist 10  | 645.651        | 461.260          |
| AddToWhitelist 100 | 20.393.142!!   | 4.612.552!       |
| AddToWhitelist 500 | 486.715.698!!! | 23.062.604!!     |

Using an array is extremely expensive, mainly because each time you add a new user to the whitelist, you need to check if the user hasn't been added yet, making it more and more expensive to check the more users are whitelisted.

Using a mapping is much cheaper than using an array, but can still get really expensive. It's not uncommon to whitelist 500, 1000 or even 2000 or 3000 users. At current gas prices, whitelisting 500 users at 23.062.604 gas, is equal to 5648$!

Given that you probably don't want to spend that much money adding users to your whitelist, the solution and cheapest way to do it is using a Merkle tree.

(Note: we'll explain how a Merkle tree works, but here's a great video you can use to better understand the algorithm, https://www.youtube.com/watch?v=YIc6MNfv5iQ)

A merkle tree is a binary tree that stores hashes. Each leaf in the tree is a hash and the parent nodes are hashes of the children.
In our case we would use it to store the whitelisted addresses, so each leaf of the tree would be the Hash of an address.
A simple tree of 4 addresses would look like this:

                                                H7 = Hash(H5+H6)
                                      /                                     \
                    H5 = Hash(H1 + H2)                                       H6 = Hash(H3 + H4)
                        /       \                                           /           \
    H1 = Hash(address 1)       H2 = Hash(address 2)          H3 = Hash(address 3)        H4 = Hash(address 4)

The advantage of using a Merkle tree is that the only data you need to write into the smart contract is the root of the Merkle tree. In our example that would be H7.

So instead of having to write thousands of addresses into your smart contract, you only need to write one Hash which is only 32 bytes.

This, of course, makes writing a whitelist to the smart contract much cheaper, as it's independent of the size of the whitelist. The cost will be the same if the whitelist is of size 10 or of size 10.000.

But, although it's not all pros, the disadvantages, we think, are not a big deal. There are a couple of disadvantages: using a Merkle tree makes the whitelist mint function more complex which incurs in a higher cost(not much, we'll show further down), and it's also more work to call the whitelist mint function from the client.

It costs more gas to mint using a Merkle Tree because to check if an address is inside the Merkle Tree, you need to provide what's called a Merkle proof.

A Merkle proof is an array of hashes that your smart contract will use to check a user's address is in the Merkle tree. The Merkle proof is generated using the Merkle tree(from the client, i.e Javascript), and it works by continuously hashing from the leaf to the root and making sure that at the end the root stored in the smart contract matches the root calculated using the proof.

If we go back to the example, imagine the smart contract has the root stored(H7), and the user with address 4 calls the whitelist mint function. In order for the smart contract to check that address 4 is whitelisted, it needs the proof for address 4. The frontend will pass that proof, which for this example will be an array with the elements H3 and H5. That's because first it will first calculate H4 = Hash(address 4), then calculate H6 = Hash(H3 + H4) and finally calculate H7 = Hash(H5 + H6). So it only needed H3 and H5 to arrive to the root and verify that the calculated root and the stored root match.

As we showed, you'll save a lot of gas by not having to whitelist every address one by one, because instead you only need to write the Merkle tree root in the smart contract. But as we mentioned this makes the whitelist mint function a bit more complex and so a bit more expensive.

In the following table we compare a whitelist mint function from a contract that uses a mapping for the whitelist and another that uses a Merkle Tree:

|               | WhitelistMapping | WhitelistMerkle |
| ------------- | ---------------- | --------------- |
| MintWhitelist | 58.107           | 67.212          |

The overhead of whitelist minting using a Merkle tree is very small(around 15% more gas). This is because the cost of calculating hashes in Solidity is low.

In order to decide if you should use a Merkle tree in your smart contract, make sure you understand the pros and cons. The gas cost is not much higher, but you will need to setup your frontend so it is able to create an instance of the Merkle tree and use it calculate the proof.

The script used for calculating the gas costs can be found here:

-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/vsMerkle.js

In this script you'll also see how a Merkle tree is created using a list of addresses and how the proof is calculated and passed to the smart contract.

The smart contract WhitelistMerkle721.sol is used in the script and implements the functionality for whitelist minting using Merkle tree:

-   https://github.com/WallStFam/gas-optimization/blob/master/contracts/WhitelistMerkle721.sol

</br>

## 6. Packing your variables

Solidity arranges variables in slots of 32 bytes.

This means that to read a variable in any particular slot, the whole slot needs to be read.

You can use this feature in our advantage. If you have a function that uses variables which are all in one slot, it will be cheaper to read and write to them. You will save on gas costs as the slot needs to be loaded only once.

Let's look at two ways of packing 3 variables:

A)

```
uint8 var1 = 1;
uint256 var2 = 1;
uint8 var3 = 1;
```

B)

```
uint256 var1 = 1;
uint8 var2 = 1;
uint8 var3 = 1;
```

Since variables are packed in the order they are input in the smart contract, in the case A) the 3 variables are using 3 slots, because var2 uses a complete slot, making the others use one slot each.

In B) the 3 variables are using 2 slots, as var2 and var3 can be packed together.

When you pack your variables this way you save in gas costs for both deploying the contract and calling functions.

Let's look at gas costs of calling this simple function for A) and B):

```
function foo() public {
    var1 = 2;
    var2 = 3;
    var3 = 4;
}
```

|     | Gas cost(A) | Gas cost(B) |
| --- | ----------- | ----------- |
| foo | 36356       | 31606       |

As you can see the gas cost of calling foo() increased by almost 5000 gas units!

Now think of all the places different variables are called inside a smart contract. All those calls to unpacked or incorrectly packed variables will add up.

And even if packed correctly, you can check how you use different packed variables. If a function will be called many times, make sure that you can fit all the variables the function uses in as little slots as possible.

## 7. Using unchecked

Explanation, show example of how much cost can be saved, warning when using it

## 8. Optimizer

How it works, example of how much gas is saved when using it

## 9. Why is first mint more expensive and is there anything you can do about it?

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

```

```
