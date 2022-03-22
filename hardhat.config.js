const { getAllOwners_ownerOf } = require("./scripts/getAllOwners/getAllOwners_ownerOf");
const { getAllOwners_transfer_event } = require("./scripts/getAllOwners/getAllOwners_Transfer_event");
const { vsEnumerable } = require("./scripts/vsEnumerable");

require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: "0.8.4",
};

task("vsEnumerable", "Deploys and mints Vanilla721 and Enumerable721 and reports gas usage of both").setAction(vsEnumerable);

task("getAllOwners_ownerOf", "Gets all the owners of all the tokens in a contract calling ownerOf for each tokenId").setAction(
    getAllOwners_ownerOf
);

task(
    "getAllOwners_transfer_event",
    "Gets all the owners of all the tokens in a contract by processing the Transfer events"
).setAction(getAllOwners_transfer_event);
