const { getAllOwners_ownerOf } = require("./scripts/getAllOwners/getAllOwners_ownerOf");
const { getAllOwners_transfer_event } = require("./scripts/getAllOwners/getAllOwners_Transfer_event");
const { mintWhitelisted } = require("./scripts/mintWhitelisted");
const { setVariables } = require("./scripts/setVariables");
const { testOptimizer } = require("./scripts/testOptimizer");
const { unchecked } = require("./scripts/unchecked");
const { variablePacking } = require("./scripts/variablePacking");
const { vs721A } = require("./scripts/vs721A");
const { vs721A_transfer } = require("./scripts/vs721A_transfer");
const { vsEnumerable } = require("./scripts/vsEnumerable");
const { vsMerkle } = require("./scripts/vsMerkle");
const { vsMintPhases } = require("./scripts/vsMintPhases");
const { vsTokenIdZero } = require("./scripts/vsTokenIdZero");
const { whitelistUsers } = require("./scripts/whitelistUsers");

require("@nomiclabs/hardhat-waffle");

module.exports = {
    solidity: {
        version: "0.8.4",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
};

task("vsEnumerable", "Deploys and mints Vanilla721 and Enumerable721 and reports gas usage of both").setAction(vsEnumerable);

task("vs721A", "Deploys and mints Vanilla721 and Vanilla721A and reports gas usage of both").setAction(vs721A);

task("vs721A_transfer", "Deploys, mints and transfer Vanilla721 and Vanilla721A tokens and reports gas usage of both").setAction(
    vs721A_transfer
);

task("vsTokenIdZero", "Deploys and mints Vanilla721A_0 and Vanilla721A and reports gas usage of both").setAction(vsTokenIdZero);

task("vsMerkle", "Deploys and mints WhitelistMapping721 and WhitelistMerkle721 and reports gas usage of both").setAction(
    vsMerkle
);

task("getAllOwners_ownerOf", "Gets all the owners of all the tokens in a contract calling ownerOf for each tokenId").setAction(
    getAllOwners_ownerOf
);

task(
    "getAllOwners_transfer_event",
    "Gets all the owners of all the tokens in a contract by processing the Transfer events"
).setAction(getAllOwners_transfer_event);

task(
    "whitelistUsers",
    "Deploys and whitelists users for WhitelistArray721 and WhitelistMapping721 and reports gas usage of both"
).setAction(whitelistUsers);

task(
    "mintWhitelisted",
    "Deploys WhitelistArray721 and WhitelistMapping721, mints tokens and reports gas usage of both"
).setAction(mintWhitelisted);

task("variablePacking", "Deploys different VariablePacking_N contracts and reports gas usage for different functions").setAction(
    variablePacking
);

task("unchecked", "Deploys Unchecked contract and reports gas usage").setAction(unchecked);

task(
    "setVariables",
    "Deploys SetVariables contract and reports gas usage for setting variables from zero to non-zero and vice versa"
).setAction(setVariables);

task("testOptimizer", "Executes mint functions from different contracts and reports gas usage").setAction(testOptimizer);

task("vsMintPhases", "Deploys MintPhases721 and reports gas usage").setAction(vsMintPhases);
