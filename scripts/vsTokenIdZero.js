const { deployContract } = require("./deployContract");

// Reports gas used for the first mint using Vanilla721A_0 and Vanilla721A
async function vsTokenIdZero() {
    const vanilla721A_0 = await deployContract("Vanilla721A_0"); // token id starts at 0
    const vanilla721A_1 = await deployContract("Vanilla721A"); // token id starts at 1

    const value = { value: ethers.utils.parseEther("0.1") };

    console.log("First mint:");
    let tx = await (await vanilla721A_0.mint(1, value)).wait();
    console.log(`\tVanilla721A_0 mint -> Gas used: ${tx.gasUsed}`);

    tx = await (await vanilla721A_1.mint(1, value)).wait();
    console.log(`\tVanilla721A_1 mint -> Gas used: ${tx.gasUsed}`);
}

module.exports = { vsTokenIdZero };
