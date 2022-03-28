# Gas Optimization

We've all been there. A new collection drops and you go and try to mint, just to find that the gas fees are much more expensive than the NFT itself. Jeez!

This is clearly not a good user experience. So, when creating the smart contract for your NFT collection, one of your main objectives should be to make minting gas fees as cheap as possible.

In this article we'll go through different ways to accomplish this:

<ol>
    <li>Do you really need ERC721Enumerable?</li> 
    <li>Use mappings instead of arrays</li>
    <li>ERC721A standard</li>
    <li>Start with Token Id 1</li>
    <li>Merkle Tree for whitelists</li>
    <li>Packing your variables</li>
    <li>Using unchecked</li>
    <li>Why is first mint more expensive and is there anything you can do about it?</li>
</ol>

All the code mentioned in this article can be found in: https://github.com/WallStFam/gas-optimization

Feel free to use the code in your own project. At Wall St Fam we believe blockchain is the future and thus we want to help where we can in making blockchain development more accesible to anyone.

After going through these topics, we'll finish the article, looking at smart contracts from popular NFT collections and see what they did right and what could be improved.

</br>

## 1. Do you really need ERC721Enumerable?

When coding a mint function, you need to make sure that the function uses the minimum code necessary.

Sometimes it's tempting to add more functionality to a contract in case one needs it in the future or to make off-chain queries easier. The problem is that any extra functionality you add will increase gas costs.

One of the most commom cases of expensive mint functions is having your contract inherit from ERC721Enumerable. The problem with this extension is that it adds a lot of overhead to any transfer(be it the the contract transferring to the user when the user mints, or any transfer from one user to another).

ERC721Enumerable uses 4 mappings and an array to keep track of the token ids each user has. And, writing to those structures in each transfer costs a lot of gas.

Here is a comparison of the gas costs to mint one token from two smart contracts. One inherits from ERC721Enumerable and the other doesn't:

|               | Gas used |
| ------------- | -------- |
| Vanilla721    | 73.539   |
| Enumerable721 | 145.323  |

ERC721Enumerable is 2 times as costly as vanilla ERC721!

The difference in gas used is even more pronounced if you look into mints that come after the first one:

|               | Gas used(after first mint) |
| ------------- | -------------------------- |
| Vanilla721    | 56.439                     |
| Enumerable721 | 150.923                    |

ERC721Enumerable is almost 3 times as costly as vanilla ERC721 after the first mint!

(_Note: In Solidity it's more expensive to set variables from zero to non-zero than from non-zero to non-zero. That's why first mints in ERC721 are more costly because the balance of a user changes from 0 to 1. But what is interesting to notice is that although first mints in ERC721 are more costly, first mints in ERC721Enumerable are less expensive. If you are interested and want to know why that happens, check line 98 of https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol The first mint is more expensive because \_addTokenToOwnerEnumeration(address, uint256) sets the value in the mapping to zero in the first mint and setting a value from zero to zero has no cost_)

So before adding ERC721Enumerable, ask yourself: "Do I really need this functionality inside my contract?"

If you are only going to query the token ids for each user from outside the contract, then there are ways to do it without using ERC721Enumerable.

Here are two ways to do it:

<ul>
    <li>Call ownerOf(uint tokenId) for each token. </li>
    <li>Query the Transfer events from ERC721 and process them to get the owners of each token</li>
</ul>

You can find scripts for both methods in our github repository:

-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/getAllOwners/getAllOwners_ownerOf.js
-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/getAllOwners/getAllOwners_transfer_event.js

These scripts query the blockchain to get the owner of each token of an ERC721 contract.

We used Wall Street Dads contract as an example in those scripts, but you are free to use the code with any other contract. You just need to replace the abi and contract address.

</br>

## 2. Use mappings instead of arrays

Sometimes it's possible to replace the functionality of an array with a mapping. The advantage of mappings is that you can access any value without having to iterate like you normally do with an array.

For example, it's very common among NFT collections to use whitelists. Users who are added to a whitelist have priority minting and usually access to a lower price than the public sale.

You can do a whitelist using an array as follows:

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

And although this code works, it has a big problem: calling mintWhitelist() gets more expensive as more users are added to whitelistedUsers array. That's because the larger the array the more you have to iterate to find if a user was added or not.

Normally loops in Solidity are probably not the right solution. It is ok to use arrays in some cases, but make sure that the loop is bounded. This means that the loop has a known amount of maximum iterations, and that the amount of iterations is relatively low. In this example the loop is not bounded and that's the issue.

If your loop is unbounded, you need to try a different approach. Probably moving things off-chain or using different code structures is possible.

Let's rewrite the code using a mapping instead of an array:

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

Using a mapping for whitelistedUsers allows the smart contract to check if a user is whitelisted in just one instruction instead of iterating through a loop.

This makes the code much cheaper to execute and it doesn't get more expensive when more users are added to the whitelist(the cost is constant for any amount of whitelisted users).

This is the average cost of calling mintWhitelist() for different amount of users:

|               | WhitelistMapping(Avg) | WhitelistArray(Avg) |
| ------------- | --------------------- | ------------------- |
| MintWhitelist | 58.598                | 434.427             |

These values were calculated simulating 350 users that were positioned in different places in the whitelist.

The values that you'd get for using WhitelistArray will vary depending on where is the user(msg.sender) in the array.
If it's at the beginning, the call to mintWhitelist() will be much cheaper than if it is at the very end.

The gas cost of calling mintWhitelist() for WhitelistMapping is always the same(min=max=avg), independent of the amount of users.

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

We'll revisit this new standard and make it easy to understand why it works and also show how to apply the solutions they propose to other aspects of your smart contract.

Also it's important to mention that some of the cost saved on minting is later payed for transactions. It's up to you to decide where do you prefer your users to save on gas. Although, a good thing about ERC721A is that the gas saved on minting can be much more than the extra gas users will need to pay for transactions.

For marketing purposes, the Azuki team has compared the gas cost of minting using their standard to minting using ERC721Enumerable.

But to be fair, if we are comparing apples to apples they should have compared ERC721A with ERC721. Of course, comparing ERC721A to vanilla ERC721 doesn't have as big of an impact as comparing to ERC721Enumerable, which as we've seen already in this article, it adds a lot of overhead to minting.

But, fortunately, even comparing to vanilla ERC721, ERC721A makes minting much cheaper if you are minting multiple tokens, as you can see in the following chart:

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
| Avg | 45451  | 70441   |
| Min | 40531  | 49215   |
| Max | 62431  | 105742  |

In average transferring tokens with ERC721A is 55% more expensive.

To decide if you are going to use ERC721A, take into account this extra cost for transferring tokens and think if users will be minting big batches of tokens or not.

If you want to check these values yourself or simulate a higher amount of users or transfers, here is the script that was used to calculate the values:

https://github.com/WallStFam/gas-optimization/blob/master/scripts/vs721A_transfer.js

</br>

## 4. Start with Token Id 1

Many contracts start token id at zero(i.e Azuki, BAYC, etc).

And this is ok if you, as the creator, are going to do the first mint. Because as we mentioned before in the section "Do you really need ERC721Enumerable?", in Solidity it's expensive to set variables from zero to non-zero.

It's a nice trick to start the token id at 1, that way you'll make the first mint much cheaper.

Here's a comparison of the first mint of a ERC721A contract using tokenId initialized at 0 and at 1:

|            | ERC721A(tokenId=0) | ERC721A(tokenId=1) | Overhead |
| ---------- | ------------------ | ------------------ | -------- |
| First mint | 90572              | 73472              | 17100    |

So if one of your users is going to make the first mint, make it cheaper for him by initializing tokenId in 1.

</br>

## 5. Merkle Tree for whitelists

In a previous section "Use mappings instead of arrays" we presented examples of contracts that implement whitelisting.

Those examples used either an array or mapping to store the whitelisted addresses. Although using a mapping was cheaper than using an array, it can still be a very expensive solution if you plan to have, let's say, 1000(or more) whitelisted users.

Here's how much it cost to whitelist users using an array and a mapping:

|                    | WhitelistArray | WhitelistMapping |
| ------------------ | -------------- | ---------------- |
| AddToWhitelist 10  | 645.651        | 461.260          |
| AddToWhitelist 100 | 20.393.142!!   | 4.612.552!       |
| AddToWhitelist 500 | 486.715.698!!! | 23.062.604!!     |

Using an array is extremely expensive, mainly because each time you add a new user to the whitelist, you need to check if the user hasn't been added yet, making it more and more expensive to check when more users are already whitelisted(Note: you can use a different approach for WhitelistArray and not check if a user is already in the whitelist, but that will still be expensive, as it will be at least as expensive as WhitelistMapping).

It's not uncommon to whitelist 500, 1000 or even 2000 or 3000 users. At current gas prices, whitelisting 500 users at 23.062.604 gas, is equal to 5648$!

Given that you probably don't want to spend that much money adding users to your whitelist, the solution, and cheapest way to do it, is using a Merkle tree.

(Note: we'll now explain how Merkle trees work, but here's also a video that explains it really well, https://www.youtube.com/watch?v=YIc6MNfv5iQ)

A Merkle tree is a binary tree that stores hashes. Each leaf in the tree is a hash and the parent nodes are hashes of the children.
In our case we will use it to store the whitelisted addresses, so each leaf of the tree is the hash of an address.
A simple tree of 4 addresses looks like this:

                                                H7 = Hash(H5+H6)
                                      /                                     \
                    H5 = Hash(H1 + H2)                                       H6 = Hash(H3 + H4)
                        /       \                                           /           \
    H1 = Hash(address 1)       H2 = Hash(address 2)          H3 = Hash(address 3)        H4 = Hash(address 4)

The hash H7 is the root of the Merkle tree. The advantage of using a Merkle tree for whitelisting users is that the only data you need to write into the smart contract is the root of the Merkle tree.

So instead of having to write thousands of addresses into your smart contract, you only need to write one Hash which is only 32 bytes.

This, of course, makes writing a whitelist to the smart contract as cheap as possible, and it's independent of the size of the whitelist(the cost will be the same if the whitelist is of size 10 or of size 10.000).

There are a couple of disadvantages though:

-   Using a Merkle tree makes the whitelist mint function more complex which incurs in a slight higher cost(further down we'll see how much)
-   It's more work to call the whitelist mint function from the client(frontend)

To check if an address is inside the Merkle tree, you need to provide what's called a Merkle proof.

A Merkle proof is an array of hashes that your smart contract will use to check if a user's address is in the Merkle tree or not. It's used to iteratively hash from the leaf to the root and then check that the root stored in the smart contract matches the root calculated using the proof.

If we go back to the example, imagine the smart contract already has the root stored(H7), and the user with address 4 calls the whitelist mint function.

The frontend will calculate the proof and pass it to the mint function. For this example the proof will be an array with the elements H3 and H5. That's because first it will first calculate H4 = Hash(address 4), then calculate H6 = Hash(H3 + H4) and finally calculate H7 = Hash(H5 + H6). So it only needed H3 and H5 to get from the leaf to the root calculating a hash in each step.

In the following table we compare a whitelist mint function from a contract that uses a mapping and another that uses a Merkle tree:

|               | WhitelistMapping | WhitelistMerkle |
| ------------- | ---------------- | --------------- |
| MintWhitelist | 58.107           | 67.212          |

Luckily the overhead of whitelist minting using a Merkle tree is very small(around 15% more gas). This is because the cost of calculating hashes in Solidity is low.

In order to decide if you should use a Merkle tree in your smart contract, make sure you understand the pros and cons. The gas cost is not much higher, but you will need to setup your frontend so it is able to create an instance of the Merkle tree and use it to calculate the proof.

Here's the script that was used for calculating the gas costs(you'll also see how a Merkle tree can be created using a list of addresses and how the proof is calculated and passed to the smart contract):

-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/vsMerkle.js

We used the following smart contract(WhitelistMerkle721.sol) in the script which implements the functionality for whitelist minting using Merkle tree:

-   https://github.com/WallStFam/gas-optimization/blob/master/contracts/WhitelistMerkle721.sol

</br>

## 6. Packing your variables

Solidity arranges variables in slots of 32 bytes.

Some variables like uint256 occupy a whole slot, but others like uint8, uint16, bool, etc, occupy just a portion of a slot. This means that to read a uint8, for example, you'd need to read the other variables thay are in the same slot, if any.

You can use this feature to optimize gas costs: if you have a function that uses variables which are all in the same slot, it will be cheaper to read and write to them as you need to load the slot only once.

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

Since variables are packed in the order they are input in the smart contract, in the case of A) the 3 variables are using 3 slots, because var2 uses a complete slot, making the others use one slot each.

In B) the 3 variables are using 2 slots, as var2 and var3 can be packed together.

When you pack your variables this way you save in gas costs for both deploying the contract and calling functions that use them.

Let's take a look at gas costs of calling the following function:

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

As you can see the gas cost of calling foo() increased by almost 5000 gas units just because of how the variables are packed!

Now think of all the different places variables are called and assigned to inside a smart contract. All those calls to unpacked or incorrectly packed variables will add up.

Another thing to notice is that choosing which variables you pack together matter, because you rather pack variables together if they need to be loaded also at the same time. If a function will be called many times, make sure that you can fit all the variables the function uses in as little slots as possible.

## 7. Using unchecked

Arithmetic operations can be wrapped in unchecked blocks, that way the compiler won't include additional op codes to check for underflow/overflow. This can make your code more cost efficient.

Let's look at an example:

```
uint a = 1;
uint b = 2;
uint c = 10;

function unchecked_() public {
    unchecked {
        a = a *5;
        c += a;
        b += c + a * 2;
    }
}

function checked() public {
    a = a *5;
    c += a;
    b += c + a * 2;
}
```

Both checked and unchecked\_ functions do the same arithmetic operations, but they use different amount of gas:

|               | Gas cost |
| ------------- | -------- |
| unchecked\_() | 36588    |
| checked()     | 37578    |

The savings are not huge but if you have many different arithmetic operations or for example a for loop where you modify the value of the iterator, then you can save some gas for your users with an unchecked block.

## 8. Why is first mint more expensive and is there anything you can do about it?

In the first section "Do you really need ERC721Enumerable?" we compared the gas cost for the first mint and for the ones that come after.

First mints are normally more expensive because there are variables that change from zero to non-zero which in Solidity is very expensive.

Given a variables this is the cost of setting it from 'zero to non-zero', from 'non-zero to non-zero' and 'from non-zero to zero':

|                           | Gas cost |
| ------------------------- | -------- |
| From zero to non-zero     | 43.300   |
| From non-zero to non-zero | 26.222   |
| From non-zero to zero     | 21.444   |

Setting a variable from zero to non-zero it's almost twice as expensive than setting a variable from non-zero to non-zero. So, the takeaway is that you should be mindful of that and if it's possible to initialize a variable as non-zero instead of zero, then you could save some gas for your users.

You can check the smart contract and script used to calculate the gas costs at:

-   https://github.com/WallStFam/gas-optimization/blob/master/contracts/SetVariables.sol
-   https://github.com/WallStFam/gas-optimization/blob/master/scripts/setVariables.js

## Testing

One of the best ways to move the blockchain technology forward is to create a better user experience for end users.

Lowering gas costs is a great way to make a better UX.

Whenever you are creating your own smart contract, make sure you test the cost of your functions, mainly the ones that your users will call(i.e mint function). Try to apply some or all of the techniques explained in this article to lower gas fees. You'll be helping not only your project but the whole ecosystem too.

(Note: the repository we shared at the beginning of the article has smart contracts and scripts related to each section. If you've never calculated gas costs for your functions and would like to know how to do it, please take a look at those examples).

## Popular contracts

To end this article. We thought it would be a good idea to check the smart contracts of popular NFT collections.

We chose BAYC, Doodles and Cool Cats.

Let's look at how much mint functions cost for each contract:

|           | Mint 1  | Mint 5  |
| --------- | ------- | ------- |
| BAYC      | 173.576 | 636.912 |
| Doodles   | 152.599 | 610.131 |
| Cool Cats | 149.778 | 608.730 |

It was a bit surprising to see that all 3 contracts had a very similar minting cost and that the cost is high.

With the techniques explained in this article you can target a cost for minting 1 token to be around 60.000 gas and for minting 5 of around 70.000 gas(if you use ERC721A to take advantage of multiple token mint).

The reason why those 3 contracts have such an expensive mint function is because they all use ERC721Enumerable, which as we saw in "Do you really need ERC721Enumerable?" can be avoided most of the time.

For minting 5 tokens, the cost is really high(since it can potentially be almost 10 times less) and they would have made their users a big favor if they implemented ERC721A or a similar solution.

## Ideas for other articles:

Multiple reveal
Multiple mint phases
Wrapped NFTs(they unlock a different NFT)
Better updateable NFTs:
https://nftchance.medium.com/mimetic-metadata-how-to-create-a-truly-non-dilutive-nft-collection-in-2022-746a01f886c5
