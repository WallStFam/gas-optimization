const fs = require("fs");
require("dotenv").config();

// This function gets all the owners of all the tokens in a contract
// We use the Wall Street Dads contract as an example
// You'll need to enter INFURA_API_KEY in your .env file
async function getAllOwners_ownerOf() {
    const abi = require("./dadsAbi.json");
    const provider = new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/" + process.env.INFURA_API_KEY);
    const dads = new ethers.Contract("0x03E99AFD576eaF6b818d58a4eFC59D2D0cbf1678", abi, provider);

    const totalSupply = await dads.totalSupply();
    const stepAmount = 500;
    const steps = Math.ceil(totalSupply / stepAmount);

    let owners = [];
    for (let j = 0; j < steps; j++) {
        let promises = [];
        for (let i = 1; i <= stepAmount; i++) {
            let tokenId = i + j * stepAmount;
            if (tokenId > totalSupply) {
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

    fs.writeFileSync("./scripts/getAllOwners/ownerOf.txt", res);
}

module.exports = { getAllOwners_ownerOf };
