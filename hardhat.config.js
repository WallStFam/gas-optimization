const { getAllOwners_ownerOf } = require("./scripts/getAllOwners/getAllOwners_ownerOf");
const { vsEnumerable } = require("./scripts/vsEnumerable");

require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: "0.8.4",
};

task("vsEnumerable", "Deploys and mints Vanilla721 and Enumerable721 and reports gas usage of both").setAction(vsEnumerable);

task("getAllOwners_ownerOf", "Gets all the owners of all the tokens in a contract").setAction(getAllOwners_ownerOf);
