const { deployContract } = require("./deployContract");

// Reports gas used for setting variables from zero to non-zero and vice versa
async function setVariables() {
    const setVariables = await deployContract("SetVariables");

    await setVariables.setToZero();

    let tx = await (await setVariables.setTo1()).wait();
    console.log(`\tSet from 0 to 1 -> Gas used: ${tx.gasUsed}`);

    tx = await (await setVariables.setTo2()).wait();
    console.log(`\tSet from 1 to 2 -> Gas used: ${tx.gasUsed}`);

    tx = await (await setVariables.setToZero()).wait();
    console.log(`\tSet from 2 to 0 -> Gas used: ${tx.gasUsed}`);
}

module.exports = { setVariables };
