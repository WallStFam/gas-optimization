# Gas Optimization

We've all been there. A new collection drops and you go and try to mint just to find that the gas fees are much more expensive than the NFT itself. Jeez!

This is clearly not a good user experience. So, when creating the smart contract for your NFT collection, one of your main objectives is to make gas fees for minting as cheap as possible.

We created a Medium article where we take a deep dive into gas costs and strategies you can use to lower them:

TODO -> Link to Medium article

This repository is a Hardhat project(hardhat.org) that includes all the smart contracts and scripts used in the article.

Feel free to use it in your own project. At Wall St Fam we believe blockchain is our future and thus we want to help where we can in making blockchain development more accesible to anyone.

## How to use?

Clone the repository, go into the project directory and install all dependencies:

```js
npm i
```

Depending on which scripts you run, you may need to input your .env variables(the format is in .env.example)

Run any hardhat task listed in hardhat.config.js.

For example:

```js
npx hardhat getAllOwners_ownerOf

npx hardhat getAllOwners_transfer_event

npx hardhat vsEnumerable

```
