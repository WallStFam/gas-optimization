const { deployContract } = require("./deployContract");

async function vsMintPhases() {
    const contract1 = await deployContract("MintPhases721");
    const contract2 = await deployContract("MintPhases721");

    async function reportGasUsed(amount) {
        const value = { value: ethers.utils.parseEther("0.1") };

        console.log("Mint " + amount + ":");
        let gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await contract1.mint(value)).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        avg = amount > 1 ? ", Avg: " + gasUsed / amount : "";
        console.log(`\tNormal mint -> Gas used: ${gasUsed}${avg}`);

        gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await contract2.mintPhases(1, value)).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        avg = amount > 1 ? ", Avg: " + gasUsed / amount : "";
        console.log(`\tPhases mint -> Gas used: ${gasUsed}${avg}`);
    }

    // First mint:
    await reportGasUsed(1);

    // Second mint:
    await reportGasUsed(1);

    // Batch mint 3
    await reportGasUsed(3);
}

module.exports = { vsMintPhases };
