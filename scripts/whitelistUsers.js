const { deployContract } = require("./deployContract");

function randomAddress() {
    return ethers.Wallet.createRandom().address;
}

// Reports gas used for whitelisting users and whitelist minting using array and mapping
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

    //await reportGasUsedForWhitelisting(10);
    //await reportGasUsedForWhitelisting(100);
    //await reportGasUsedForWhitelisting(500);

    const signer = (await ethers.getSigners())[0];
    whitelistArray.addToWhitelist(signer.address);
    whitelistMapping.addToWhitelist(signer.address);

    async function reportGasUsedForMinting(amount) {
        console.log(`Whitelist Mint ${amount}:`);
        let gasUsed = 0;
        const stats = { min: Number.MAX_SAFE_INTEGER, max: 0, sum: 0 };
        for (let i = 0; i < amount; i++) {
            let tx = await (await whitelistArray.mintWhitelist()).wait();
            gasUsed += tx.gasUsed.toNumber();
            stats.min = Math.min(stats.min, tx.gasUsed.toNumber());
            stats.max = Math.max(stats.max, tx.gasUsed.toNumber());
            stats.sum += tx.gasUsed.toNumber();
        }
        console.log(`\tArray -> total:${gasUsed}, min: ${stats.min}, max:${stats.max}, avg${stats.sum / amount}`);

        gasUsed = 0;
        const stats2 = { min: Number.MAX_SAFE_INTEGER, max: 0, sum: 0 };
        for (let i = 0; i < amount; i++) {
            let tx = await (await whitelistMapping.mintWhitelist()).wait();
            gasUsed += tx.gasUsed.toNumber();
            stats2.min = Math.min(stats2.min, tx.gasUsed.toNumber());
            stats2.max = Math.max(stats2.max, tx.gasUsed.toNumber());
            stats2.sum += tx.gasUsed.toNumber();
        }
        console.log(`\tMapping -> total:${gasUsed}, min: ${stats2.min}, max:${stats2.max}, avg${stats2.sum / amount}`);
    }

    await reportGasUsedForMinting(10);
    await reportGasUsedForMinting(100);
    await reportGasUsedForMinting(500);
}

module.exports = { whitelistUsers };
