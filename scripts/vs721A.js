const { deployContract } = require("./deployContract");

// Reports gas used for minting tokens using Vanilla721 and Vanilla721A
async function vs721A() {
    const vanilla721 = await deployContract("Vanilla721");
    const vanilla721A = await deployContract("Vanilla721A");

    async function reportGasUsed(amount) {
        const value = ethers.utils.parseEther("0.1");

        console.log("Mint " + amount + ":");
        let gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await vanilla721.mint({ value: value })).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        console.log(`\tVanilla721 -> Gas used: ${gasUsed}`);

        tx = await (await vanilla721A.mint(amount, { value: value.mul(amount) })).wait();
        console.log(`\tVanilla721A -> Gas used: ${tx.gasUsed}`);
    }

    // First mint:
    await reportGasUsed(1);

    // Second mint:
    await reportGasUsed(1);

    // Mint 2:
    await reportGasUsed(2);

    // Mint 5:
    await reportGasUsed(5);

    // Batch mint 10
    await reportGasUsed(10);

    // Batch mint 100
    await reportGasUsed(100);
}

module.exports = { vs721A };
