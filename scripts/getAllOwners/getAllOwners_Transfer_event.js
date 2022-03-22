const fs = require("fs");
require("dotenv").config();

// This function gets all the owners of all the tokens in a contract by processing the Transfer events
// We use the Wall Street Dads contract as an example
// You'll need to enter INFURA_API_KEY in your .env file to run this script(check .env.example)
async function getAllOwners_transfer_event() {
    const abi = require("./dadsAbi.json");
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY);
    const dads = new ethers.Contract("0x03E99AFD576eaF6b818d58a4eFC59D2D0cbf1678", abi, provider);
    const transferEvents = await dads.queryFilter("Transfer", 0, "latest");
    let tokens = [];
    let owners = [];
    for (let i = 0; i < transferEvents.length; i++) {
        const event = transferEvents[i];
        const tokenId = event.args.tokenId.toNumber();
        if (!tokens.includes(tokenId)) {
            tokens.push(tokenId);
        }
        owners[tokenId] = event.args.to;
    }

    // Order tokens by id
    tokens.sort((a, b) => a - b);

    // Write the results to a file
    let res = "";
    for (let i = 0; i < tokens.length; i++) {
        res += tokens[i] + " " + owners[tokens[i]] + "\n";
    }
    fs.writeFileSync("./scripts/getAllOwners/output/transfer_event.txt", res);
}

module.exports = { getAllOwners_transfer_event };
