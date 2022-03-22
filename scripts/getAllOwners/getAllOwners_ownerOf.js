const fs = require("fs");
require("dotenv").config();

// This function gets all the owners of all the tokens in a contract by calling ownerOf for each token
// We use the Wall Street Dads contract as an example
// You'll need to enter INFURA_API_KEY in your .env file to run this script(check .env.example)
// Note: token ids are supposed to be in order. Either from 0 to totalSupply-1 or from 1 to totalSupply
async function getAllOwners_ownerOf() {
    const abi = require("./dadsAbi.json");
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY);
    const dads = new ethers.Contract("0x03E99AFD576eaF6b818d58a4eFC59D2D0cbf1678", abi, provider);

    const firstTokenId = await getFirstTokenId(dads);
    const totalSupply = await dads.totalSupply();
    const lastTokenId = firstTokenId == 0 ? totalSupply - 1 : totalSupply;
    const stepAmount = 500;
    const steps = Math.ceil(totalSupply / stepAmount);

    let owners = [];
    for (let j = 0; j < steps; j++) {
        let promises = [];
        for (let i = 0; i < stepAmount; i++) {
            let tokenId = firstTokenId + i + j * stepAmount;
            if (tokenId > lastTokenId) {
                break;
            }
            promises.push(dads.ownerOf(tokenId));
        }
        const results = await Promise.all(promises);
        owners = owners.concat(results);
        console.log("Processed: " + owners.length + "/" + totalSupply);
    }
    let res = "";
    for (let i = 1; i <= owners.length; i++) {
        res += i + " " + owners[i - 1] + "\n";
    }

    fs.writeFileSync("./scripts/getAllOwners/output/ownerOf.txt", res);
}

async function getFirstTokenId(contract) {
    try {
        await contract.ownerOf(0); // if ownerOf(0) throws an error, it means tokenId 0 doesn't exist
        return 0;
    } catch {
        return 1;
    }
}

module.exports = { getAllOwners_ownerOf };
