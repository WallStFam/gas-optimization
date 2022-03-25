const { deployContract } = require("./deployContract");

function randomAddress() {
    return ethers.Wallet.createRandom().address;
}

// Reports gas used for whitelisting users array and mapping
async function whitelistUsers() {
    const whitelistArray = await deployContract("WhitelistArray721");
    const whitelistMapping = await deployContract("WhitelistMapping721");

    async function reportGasUsedForWhitelisting(amount) {
        console.log(`Add ${amount} to Whitelist:`);
        let gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            let tx = await (await whitelistArray.addToWhitelist(randomAddress())).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        console.log(`\tArray: ${gasUsed}`);

        gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            let tx = await (await whitelistMapping.addToWhitelist(randomAddress())).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        console.log(`\tMapping: ${gasUsed}`);
    }

    await reportGasUsedForWhitelisting(10);
    await reportGasUsedForWhitelisting(100);
    //await reportGasUsedForWhitelisting(500); // this one takes a long time
}

module.exports = { whitelistUsers };
