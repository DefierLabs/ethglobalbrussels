import { Signer } from "ethers";
import hre, { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployContract } from "../tasks/utils";
import { BeefyVaultV6__factory, BeefyVaultV6, MockERC20__factory, MockERC20, MockStrategy__factory, MockStrategy } from "../types/generated"; // Adjust import paths accordingly

interface VaultDeployed {
    vault: BeefyVaultV6;
    underlyingToken: MockERC20;
    strategy: MockStrategy;
}

async function deployVault(
    hre: HardhatRuntimeEnvironment,
    signer: Signer,
    tokenName: string,
    tokenSymbol: string,
    approvalDelay: number,
    debug = false,
    waitForBlocks = 0,
): Promise<VaultDeployed> {
    const deployer = signer;

    // Deploy the underlying token
    const underlyingToken = await deployContract<MockERC20>(
        hre,
        new MockERC20__factory(deployer),
        "MockERC20",
        [tokenName, tokenSymbol, ethers.utils.parseEther("10000")], // Adjust initial supply if necessary
        {},
        debug,
        waitForBlocks,
    );

    // Deploy the strategy contract
    const strategy = await deployContract<MockStrategy>(
        hre,
        new MockStrategy__factory(deployer),
        "MockStrategy",
        [underlyingToken.address, ethers.constants.AddressZero], // Passing zero address for vault initially
        {},
        debug,
        waitForBlocks,
    );

    // Deploy the vault contract
    const vault = await deployContract<BeefyVaultV6>(
        hre,
        new BeefyVaultV6__factory(deployer),
        "BeefyVaultV6",
        [strategy.address, tokenName, tokenSymbol, approvalDelay],
        {},
        debug,
        waitForBlocks,
    );

    // Update the strategy to use the deployed vault
    await strategy.transferOwnership(vault.address); // Transfer strategy ownership to vault
    await strategy.setVault(vault.address); // Assuming setVault is implemented

    return { vault, underlyingToken, strategy };
}

export { deployVault, VaultDeployed };
