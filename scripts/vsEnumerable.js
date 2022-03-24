const { deployContract } = require("./deployContract");

async function vsEnumerable() {
    const vanilla721 = await deployContract("Vanilla721");
    const enumerable721 = await deployContract("Enumerable721");

    async function reportGasUsed(amount) {
        const value = { value: ethers.utils.parseEther("0.1") };

        console.log("Mint " + amount + ":");
        let gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await vanilla721.mint(value)).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        avg = amount > 1 ? ", Avg: " + gasUsed / amount : "";
        console.log(`\tVanilla721 -> Gas used: ${gasUsed}${avg}`);

        gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await enumerable721.mint(value)).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        avg = amount > 1 ? ", Avg: " + gasUsed / amount : "";
        console.log(`\tEnumerable721 -> Gas used: ${gasUsed}${avg}`);
    }

    // First mint:
    await reportGasUsed(1);

    // Second mint:
    await reportGasUsed(1);

    // Batch mint 3
    await reportGasUsed(3);
}

module.exports = { vsEnumerable };
