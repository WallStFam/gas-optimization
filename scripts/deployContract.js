async function deployContract(contractName, constructorArgs = []) {
    const [deployer] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory(contractName);
    const contract = await Contract.deploy(...constructorArgs);

    await contract.deployed();

    console.log(`-> ${contractName} contract deployed to: ${contract.address}`);

    return contract;
}

module.exports = { deployContract };
