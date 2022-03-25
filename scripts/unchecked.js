const { deployContract } = require("./deployContract");

// Reports gas used for minting tokens using Vanilla721 and Vanilla721A
async function unchecked() {
    const unchecked = await deployContract("Unchecked");

    tx = await (await unchecked.unchecked_()).wait();
    console.log(`\tUnchecked -> Gas used: ${tx.gasUsed}`);

    tx = await (await unchecked.checked()).wait();
    console.log(`\tChecked -> Gas used: ${tx.gasUsed}`);
}

module.exports = { unchecked };
