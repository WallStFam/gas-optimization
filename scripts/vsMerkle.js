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

// Reports gas used for minting using mapping vs Merkle tree
async function vsMerkle() {
    const mapping721 = await deployContract("WhitelistMapping721");
    const merkle721 = await deployContract("WhitelistMerkle721");

    const value = { value: ethers.utils.parseEther("0.1") };

    const signers = await ethers.getSigners();
    const whitelist = signers.map((signer) => signer.address);

    // add 1000 more addresses to whitelist
    for (let i = 0; i < 1000; i++) {
        const newAddress = ethers.Wallet.createRandom().address;
        whitelist.push(newAddress);
    }

    // Whitelist users for merkle721
    const merkleTree = getMerkleTreeFromWhitelist(whitelist);
    const merkleRoot = merkleTree.getRoot();
    await merkle721.setWhitelist(merkleRoot);

    // Whitelist users for mapping721
    for (let i = 0; i < whitelist.length && i < 50; i++) {
        await mapping721.addToWhitelist(whitelist[i]);
    }

    console.log("First mint:");
    let merkleProof = getHexProof(whitelist, signers[1].address);
    let tx = await (await merkle721.connect(signers[1]).mintWhitelist(merkleProof, value)).wait();
    console.log(`\tMerkle721 mint -> Gas used: ${tx.gasUsed}`);

    tx = await (await mapping721.connect(signers[1]).mintWhitelist(value)).wait();
    console.log(`\tMapping721 mint -> Gas used: ${tx.gasUsed}`);

    console.log("Second mint:");
    merkleProof = getHexProof(whitelist, signers[1].address);
    tx = await (await merkle721.connect(signers[1]).mintWhitelist(merkleProof, value)).wait();
    console.log(`\tMerkle721 mint -> Gas used: ${tx.gasUsed}`);

    tx = await (await mapping721.connect(signers[1]).mintWhitelist(value)).wait();
    console.log(`\tMapping721 mint -> Gas used: ${tx.gasUsed}`);
}

module.exports = { vsMerkle };
