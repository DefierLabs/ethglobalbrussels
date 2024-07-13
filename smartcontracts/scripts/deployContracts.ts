import { Signer } from "ethers";
import hre, { ethers, network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { deployContract } from "../tasks/utils";
import { Vault__factory, Vault, MockERC20__factory, MockERC20, BaseStrategy__factory, BaseStrategy } from "../types/generated"; // Adjust import paths accordingly


interface VaultDeployed {
    vault: Vault;
    underlyingToken: MockERC20;
    strategy: BaseStrategy;
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
    const strategy = await deployContract<BaseStrategy>(
        hre,
        new BaseStrategy__factory(deployer),
        "BaseStrategy",
        [underlyingToken.address, ethers.constants.AddressZero, deployer.address, ethers.constants.AddressZero, ethers.constants.AddressZero, ethers.constants.AddressZero], // Passing zero address for unirouter, beefyFeeRecipient, and strategist initially
        {},
        debug,
        waitForBlocks,
    );

    // Deploy the vault contract
    const vault = await deployContract<Vault>(
        hre,
        new Vault__factory(deployer),
        "Vault",
        [strategy.address, tokenName, tokenSymbol, approvalDelay],
        {},
        debug,
        waitForBlocks,
    );

    return { vault, underlyingToken, strategy };

    await strategy.setVault(vault.address);
}

export { deployVault, VaultDeployed };