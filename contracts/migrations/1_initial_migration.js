const OpulentSilver = artifacts.require("OpulentSilver");

module.exports = async function(deployer) {
  await deployer.deploy(OpulentSilver);
  const deployedContract = await OpulentSilver.deployed();
  console.log(`OpulentSilver deployed at address: ${deployedContract.address}`);
};
