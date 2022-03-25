const { deployContract } = require("./deployContract");

// Reports gas used for packing variables in different ways
async function variablePacking() {
    const packing_1 = await deployContract("VariablePacking_1");
    const packing_2 = await deployContract("VariablePacking_2");
    const packing_3 = await deployContract("VariablePacking_3");

    let tx = await (await packing_1.foo()).wait();
    console.log(`\tVariablePacking_1 foo -> Gas used: ${tx.gasUsed}`);

    tx = await (await packing_2.foo()).wait();
    console.log(`\tVariablePacking_2 foo -> Gas used: ${tx.gasUsed}`);

    tx = await (await packing_1.foo2()).wait();
    console.log(`\tVariablePacking_1 foo2 -> Gas used: ${tx.gasUsed}`);

    tx = await (await packing_2.foo2()).wait();
    console.log(`\tVariablePacking_2 foo2 -> Gas used: ${tx.gasUsed}`);

    tx = await (await packing_3.foo()).wait();
    console.log(`\tVariablePacking_3 foo3 -> Gas used: ${tx.gasUsed}`);
}

module.exports = { variablePacking };
