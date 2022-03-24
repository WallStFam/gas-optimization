const { deployContract } = require("./deployContract");

function randomInt(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

// get a copy of the array without the element
function withoutElement(arr, el) {
    return arr.filter((e) => e !== el);
}

// Reports gas used for transferring tokens using Vanilla721 and Vanilla721A
async function vs721A_transfer() {
    const vanilla721 = await deployContract("Vanilla721");
    const vanilla721A = await deployContract("Vanilla721A");

    const signers = await ethers.getSigners();
    const value = ethers.utils.parseEther("0.1");
    const tokenIds = [];
    signers.forEach((signer) => (tokenIds[signer.address] = []));

    async function mintSome(signer) {
        const quantity = randomInt(1, 10);
        for (let j = 0; j < quantity; j++) {
            await (await vanilla721.connect(signer).mint({ value: value })).wait();
            tokenIds[signer.address] = [...tokenIds[signer.address], tokenId];
            tokenId++;
        }
        await (await vanilla721A.connect(signer).mint(quantity, { value: value.mul(quantity) })).wait();
    }

    let tokenId = 1;
    // Will initialize signers with some tokens
    for (let i = 0; i < signers.length; i++) {
        const signer = signers[i];
        await mintSome(signer);
    }

    const stats721 = { min: Number.MAX_SAFE_INTEGER, max: 0, sum: 0, count: 0 };
    const stats721A = { min: Number.MAX_SAFE_INTEGER, max: 0, sum: 0, count: 0 };
    const transferCount = 100;
    // Will make multiple mints and transfers to simulate users interacting with the contracts
    for (let i = 0; i < transferCount; i++) {
        const signer = signers[randomInt(0, signers.length - 1)];
        const otherSigners = withoutElement(signers, signer);
        const recipient = otherSigners[randomInt(0, otherSigners.length - 1)];
        const tokenId = tokenIds[signer.address][randomInt(0, tokenIds[signer.address].length - 1)];
        if (tokenIds[signer.address].length == 0) {
            continue;
        }

        const transfer = await (await vanilla721.connect(signer).transferFrom(signer.address, recipient.address, tokenId)).wait();
        stats721.min = Math.min(stats721.min, transfer.gasUsed.toNumber());
        stats721.max = Math.max(stats721.max, transfer.gasUsed.toNumber());
        stats721.sum += transfer.gasUsed.toNumber();

        const transferA = await (
            await vanilla721A.connect(signer).transferFrom(signer.address, recipient.address, tokenId)
        ).wait();
        stats721A.min = Math.min(stats721A.min, transferA.gasUsed.toNumber());
        stats721A.max = Math.max(stats721A.max, transferA.gasUsed.toNumber());
        stats721A.sum += transferA.gasUsed.toNumber();

        tokenIds[signer.address] = withoutElement(tokenIds[signer.address], tokenId);
        tokenIds[recipient.address] = [...tokenIds[recipient.address], tokenId];

        if (Math.random() < 0.3) {
            await mintSome(signer);
        }
    }

    console.log("Vanilla721 gas usage");
    console.log(`\tmin: ${stats721.min}`);
    console.log(`\tmax: ${stats721.max}`);
    console.log(`\tavg: ${stats721.sum / transferCount}`);

    console.log("Vanilla721A gas usage");
    console.log(`\tmin: ${stats721A.min}`);
    console.log(`\tmax: ${stats721A.max}`);
    console.log(`\tavg: ${stats721A.sum / transferCount}`);
}

module.exports = { vs721A_transfer };
