const { deployContract } = require("./deployContract");

async function vsEnumerable() {
    const vanilla721 = await deployContract("Vanilla721");
    const enumerable721 = await deployContract("Enumerable721");

    const [user] = await ethers.getSigners();

    let tx = await (await vanilla721.mint(user.address, 1)).wait();
    console.log("Vanilla721 mint -> Gas used: " + tx.gasUsed);

    tx = await (await enumerable721.mint(user.address, 1)).wait();
    console.log("Enumerable721 mint -> Gas used: " + tx.gasUsed);

    // Second mint:

    tx = await (await vanilla721.mint(user.address, 2)).wait();
    console.log("Vanilla721 mint -> Gas used: " + tx.gasUsed);

    tx = await (await enumerable721.mint(user.address, 2)).wait();
    console.log("Enumerable721 mint -> Gas used: " + tx.gasUsed);

    for (let i = 0; i < 3; i++) {
        tx = await (await vanilla721.mint(user.address, 3 + i)).wait();
        console.log("Vanilla721 mint -> Gas used: " + tx.gasUsed);
        tx = await (await enumerable721.mint(user.address, 3 + i)).wait();
        console.log("Enumerable721 mint -> Gas used: " + tx.gasUsed);
    }
}

module.exports = { vsEnumerable };
