const { deployContract } = require("./deployContract");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

function getMerkleTreeFromWhitelist(whitelist) {
    const leafNodes = whitelist.map((addr) => keccak256(addr));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    return merkleTree;
}

function getHexProof(whitelist, address) {
    const merkleTree = getMerkleTreeFromWhitelist(whitelist);
    const hash = keccak256(address.toLowerCase());
    const proof = merkleTree.getHexProof(hash);
    return proof;
}

// Reports gas used for different types of minting
// This code is meant to be run several times and changing the optimizer runs variable each time
async function testOptimizer() {
    console.log("");
    await mintVanilla721();
    await mintEnumerable721();
    await mintVanilla721A();
    await mintWhitelistMerkle721();
}

async function mintVanilla721() {
    const value = ethers.utils.parseEther("0.1");
    const contract = await deployContract("Vanilla721");

    let tx = await contract.deployed();
    console.log("\tDeploy -> Gas Used: " + (await tx.deployTransaction.wait()).gasUsed.toNumber());

    async function reportGasUsed(amount) {
        let gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await contract.mint({ value: value })).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        console.log(`\tMint ${amount} -> Gas used: ${gasUsed}`);
    }

    await reportGasUsed(1);
    await reportGasUsed(1);
    await reportGasUsed(10);
    await reportGasUsed(100);
    console.log("");
}

async function mintVanilla721A() {
    const contract = await deployContract("Vanilla721A");

    let tx = await contract.deployed();
    console.log("\tDeploy -> Gas Used: " + (await tx.deployTransaction.wait()).gasUsed.toNumber());

    async function reportGasUsed(amount) {
        const value = ethers.utils.parseEther("0.1").mul(amount);
        tx = await (await contract.mint(amount, { value: value })).wait();
        const gasUsed = tx.gasUsed.toNumber();
        console.log(`\tMint ${amount} -> Gas used: ${gasUsed}`);
    }

    await reportGasUsed(1);
    await reportGasUsed(1);
    await reportGasUsed(10);
    await reportGasUsed(100);
    console.log("");
}

async function mintEnumerable721() {
    const value = ethers.utils.parseEther("0.1");
    const contract = await deployContract("Enumerable721");

    let tx = await contract.deployed();
    console.log("\tDeploy -> Gas Used: " + (await tx.deployTransaction.wait()).gasUsed.toNumber());

    async function reportGasUsed(amount) {
        let gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await contract.mint({ value: value })).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        console.log(`\tMint ${amount} -> Gas used: ${gasUsed}`);
    }

    await reportGasUsed(1);
    await reportGasUsed(1);
    await reportGasUsed(10);
    await reportGasUsed(100);
    console.log("");
}

async function mintWhitelistMerkle721() {
    const value = { value: ethers.utils.parseEther("0.1") };
    const contract = await deployContract("WhitelistMerkle721");
    const signers = await ethers.getSigners();

    let tx = await contract.deployed();
    console.log("\tDeploy -> Gas Used: " + (await tx.deployTransaction.wait()).gasUsed.toNumber());

    const whitelist = signers.map((signer) => signer.address);
    // add 1000 more addresses to whitelist
    for (let i = 0; i < 1000; i++) {
        const newAddress = ethers.Wallet.createRandom().address;
        whitelist.push(newAddress);
    }

    // Whitelist users
    const merkleTree = getMerkleTreeFromWhitelist(whitelist);
    const merkleRoot = merkleTree.getRoot();
    await contract.setWhitelist(merkleRoot);

    let merkleProof = getHexProof(whitelist, signers[0].address);

    async function reportGasUsed(amount) {
        let gasUsed = 0;
        for (let i = 0; i < amount; i++) {
            tx = await (await contract.connect(signers[0]).mintWhitelist(merkleProof, value)).wait();
            gasUsed += tx.gasUsed.toNumber();
        }
        console.log(`\tMint ${amount} -> Gas used: ${gasUsed}`);
    }

    await reportGasUsed(1);
    await reportGasUsed(1);
    await reportGasUsed(10);
    await reportGasUsed(100);
}

module.exports = { testOptimizer };
