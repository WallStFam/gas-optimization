const { deployContract } = require("./deployContract");

function randomAddress() {
    return ethers.Wallet.createRandom().address;
}

async function addRandomAddressesToWhitelist(whitelist, amount) {
    for (let i = 0; i < amount; i++) {
        await whitelist.addToWhitelist(randomAddress());
    }
}

// Reports gas used for whitelist mint using array and mapping
async function mintWhitelisted() {
    const whitelistArray = await deployContract("WhitelistArray721");
    const whitelistMapping = await deployContract("WhitelistMapping721");

    // Add 3 signers in different places of the whitelist in order to simulate a more real scenario
    // (For whitelistArray, the signers added near the end of the whitelist will pay more for minting because the mint function
    // will check if the user is whitelisted by iterating through the array)
    const signers = await ethers.getSigners();
    await whitelistArray.addToWhitelist(signers[0].address);
    await addRandomAddressesToWhitelist(whitelistArray, 100);
    await whitelistArray.addToWhitelist(signers[1].address);
    await addRandomAddressesToWhitelist(whitelistArray, 250);
    await whitelistArray.addToWhitelist(signers[2].address);

    await whitelistMapping.addToWhitelist(signers[0].address);
    await addRandomAddressesToWhitelist(whitelistMapping, 100);
    await whitelistMapping.addToWhitelist(signers[1].address);
    await addRandomAddressesToWhitelist(whitelistMapping, 250);
    await whitelistMapping.addToWhitelist(signers[2].address);

    const value = { value: ethers.utils.parseEther("0.1") };

    async function reportGasUsedForMinting(amount) {
        console.log(`Whitelist Mint ${amount}:`);
        const repeats = 10;
        const stats = { min: Number.MAX_SAFE_INTEGER, max: 0, sum: 0 };
        for (let j = 0; j < repeats; j++) {
            for (let i = 0; i < amount; i++) {
                const randomSigner = signers[Math.floor(Math.random() * 3)];
                let tx = await (await whitelistArray.connect(randomSigner).mintWhitelist(value)).wait();
                stats.min = Math.min(stats.min, tx.gasUsed.toNumber());
                stats.max = Math.max(stats.max, tx.gasUsed.toNumber());
                stats.sum += tx.gasUsed.toNumber();
            }
        }
        console.log(`\tArray -> min: ${stats.min}, max:${stats.max}, avg:${stats.sum / (amount * repeats)}`);

        const stats2 = { min: Number.MAX_SAFE_INTEGER, max: 0, sum: 0 };
        for (let j = 0; j < repeats; j++) {
            for (let i = 0; i < amount; i++) {
                const randomSigner = signers[Math.floor(Math.random() * 3)]; // for mapping, it shouldn't matter which signer we use
                let tx = await (await whitelistMapping.connect(randomSigner).mintWhitelist(value)).wait();
                stats2.min = Math.min(stats2.min, tx.gasUsed.toNumber());
                stats2.max = Math.max(stats2.max, tx.gasUsed.toNumber());
                stats2.sum += tx.gasUsed.toNumber();
            }
        }
        console.log(`\tMapping -> min: ${stats2.min}, max:${stats2.max}, avg:${stats2.sum / (amount * repeats)}`);
    }

    await reportGasUsedForMinting(1);
    await reportGasUsedForMinting(2);
    await reportGasUsedForMinting(5);
    await reportGasUsedForMinting(10);
    //await reportGasUsedForMinting(100);
}

module.exports = { mintWhitelisted };
