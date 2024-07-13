import hre, { ethers, network } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import { deployVault, VaultDeployed } from "../../scripts/deployContracts";
import { Vault, MockERC20, BaseStrategy } from "../../types/generated"; // Adjust import paths accordingly

describe("Vault", function () {
    let deployer: Signer;
    let user: Signer;
    let vault: Vault;
    let underlyingToken: MockERC20;
    let strategy: BaseStrategy;
    let approvalDelay: number;

    before(async () => {
        await network.provider.request({
            method: "hardhat_reset",
            params: [
                {
                    forking: {
                        jsonRpcUrl: process.env.NODE_URL,
                        blockNumber: 20298554,
                    },
                },
            ],
        });

        const accounts = await ethers.getSigners();
        deployer = accounts[0];
        user = accounts[1];

        // Set parameters for the vault deployment
        approvalDelay = 86400; // 1 day
        const tokenName = "Vault Token";
        const tokenSymbol = "vMTK";

        // Deploy the vault, underlying token, and base strategy
        const deployed: VaultDeployed = await deployVault(
            hre,
            deployer,
            tokenName,
            tokenSymbol,
            approvalDelay
        );

        vault = deployed.vault;
        underlyingToken = deployed.underlyingToken;
        strategy = deployed.strategy;

         // Transfer tokens from deployer to user
         const transferAmount = ethers.utils.parseEther("1000");
         await underlyingToken.connect(deployer).transfer(await user.getAddress(), transferAmount);
    });

    describe("Deployment", function () {
        it("Should set the correct underlying token", async function () {
            expect(await vault.want()).to.equal(underlyingToken.address);
        });

        it("Should set the correct strategy", async function () {
            expect(await vault.strategy()).to.equal(strategy.address);
        });

        it("Should set the correct approval delay", async function () {
            expect(await vault.approvalDelay()).to.equal(approvalDelay);
        });
    });

    describe("Deposits", function () {
        it("Should allow deposits", async function () {
            const depositAmount = ethers.utils.parseEther("100");
            await underlyingToken.connect(deployer).approve(vault.address, depositAmount);
            await vault.connect(deployer).deposit(depositAmount);

            expect(await vault.balanceOf(await deployer.getAddress())).to.equal(depositAmount);
            expect(await vault.balance()).to.equal(depositAmount);
        });

        it("Should mint correct amount of vault tokens on deposit", async function () {
            const depositAmount = ethers.utils.parseEther("50");
            await underlyingToken.connect(user).approve(vault.address, depositAmount);
            await vault.connect(user).deposit(depositAmount);

            expect(await vault.balanceOf(await user.getAddress())).to.equal(depositAmount);
        });

        it("Should update balances correctly on multiple deposits", async function () {
            const depositAmount = ethers.utils.parseEther("25");
            await underlyingToken.connect(user).approve(vault.address, depositAmount);
            await vault.connect(user).deposit(depositAmount);

            expect(await vault.balanceOf(await user.getAddress())).to.equal(ethers.utils.parseEther("75"));
        });
    });

    describe("Withdrawals", function () {
        it("Should allow withdrawals", async function () {
            const withdrawAmount = ethers.utils.parseEther("50");
            await vault.connect(user).withdraw(withdrawAmount);

            expect(await underlyingToken.balanceOf(await user.getAddress())).to.equal(withdrawAmount);
        });

        it("Should burn correct amount of vault tokens on withdrawal", async function () {
            const withdrawAmount = ethers.utils.parseEther("25");
            await vault.connect(user).withdraw(withdrawAmount);

            expect(await vault.balanceOf(await user.getAddress())).to.equal(ethers.utils.parseEther("25"));
        });
    });

    describe("Strategy Management", function () {
        it("Should propose a new strategy", async function () {
            const newStrategy = await (await ethers.getContractFactory("BaseStrategy")).deploy(
                underlyingToken.address,
                ethers.constants.AddressZero,
                await deployer.getAddress(),
                ethers.constants.AddressZero,
                ethers.constants.AddressZero,
                ethers.constants.AddressZero
            );
            await vault.connect(deployer).proposeStrat(newStrategy.address);

            expect((await vault.stratCandidate()).implementation).to.equal(newStrategy.address);
        });

        it("Should upgrade to the new strategy after approval delay", async function () {
            const newStrategy = await (await ethers.getContractFactory("BaseStrategy")).deploy(
                underlyingToken.address,
                ethers.constants.AddressZero,
                await deployer.getAddress(),
                ethers.constants.AddressZero,
                ethers.constants.AddressZero,
                ethers.constants.AddressZero
            );
            await vault.connect(deployer).proposeStrat(newStrategy.address);

            // Simulate time passing
            await network.provider.send("evm_increaseTime", [approvalDelay + 1]);
            await network.provider.send("evm_mine");

            await vault.connect(deployer).upgradeStrat();

            expect(await vault.strategy()).to.equal(newStrategy.address);
        });
    });
});