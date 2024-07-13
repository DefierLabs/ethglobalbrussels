const { BN, expectRevert, send, ether } = require('@openzeppelin/test-helpers');
const Vault = artifacts.require("Vault");
const MockERC20 = artifacts.require("MockERC20");
const BaseStrategy = artifacts.require("BaseStrategy");

contract("Vault", accounts => {
    let deployer = accounts[0];
    let user = accounts[1];
    let vault;
    let underlyingToken;
    let strategy;
    const approvalDelay = new BN(86400); // 1 day

    before(async () => {
        // Deploy MockERC20 token
        underlyingToken = await MockERC20.new("Mock Token", "MTK", ether("1000000000"), { from: deployer });
        
        // Deploy BaseStrategy
        strategy = await BaseStrategy.new(
            underlyingToken.address,
            deployer, // keeper
            accounts[0], // unirouter
            accounts[0], // beefyFeeRecipient
            accounts[0], // strategist
            { from: deployer }
        );

        // Deploy Vault
        vault = await Vault.new(
            strategy.address,
            "Vault Token",
            "vMTK",
            approvalDelay,
            { from: deployer }
        );

        // Set the vault address in the strategy
        await strategy.setVault(vault.address, { from: deployer });

        // Transfer tokens from deployer to user
        await underlyingToken.transfer(user, ether("1000"), { from: deployer });
    });

    describe("Deployment", () => {
        it("should set the correct underlying token", async () => {
            const want = await vault.want();
            assert.equal(want, underlyingToken.address, "Incorrect underlying token address");
        });

        it("should set the correct strategy", async () => {
            const currentStrategy = await vault.strategy();
            assert.equal(currentStrategy, strategy.address, "Incorrect strategy address");
        });

        it("should set the correct approval delay", async () => {
            const delay = await vault.approvalDelay();
            assert(delay.eq(approvalDelay), "Incorrect approval delay");
        });
    });

    describe("Deposits", () => {
        it("should allow deposits", async () => {
            const depositAmount = ether("100");
            await underlyingToken.approve(vault.address, depositAmount, { from: deployer });
            await vault.deposit(depositAmount, { from: deployer });

            const balance = await vault.balanceOf(deployer);
            assert(balance.eq(depositAmount), "Deposit amount does not match");
        });

        it("should mint correct amount of vault tokens on deposit", async () => {
            const depositAmount = ether("50");
            await underlyingToken.approve(vault.address, depositAmount, { from: user });
            await vault.deposit(depositAmount, { from: user });

            const balance = await vault.balanceOf(user);
            assert(balance.eq(depositAmount), "Vault token amount does not match deposit amount");
        });

        it("should update balances correctly on multiple deposits", async () => {
            const depositAmount = ether("25");
            await underlyingToken.approve(vault.address, depositAmount, { from: user });
            await vault.deposit(depositAmount, { from: user });

            const balance = await vault.balanceOf(user);
            assert(balance.eq(ether("75")), "Balance does not match after multiple deposits");
        });
    });

    describe("Withdrawals", () => {
        it("should allow withdrawals", async () => {
            const startUserBalance =  await underlyingToken.balanceOf(user);
            const withdrawAmount = ether("50");
            await vault.withdraw(withdrawAmount, { from: user });

            const userBalance = await underlyingToken.balanceOf(user);
            assert(userBalance.sub(startUserBalance).eq(withdrawAmount), "Withdrawn amount does not match");
        });

        it("should burn correct amount of vault tokens on withdrawal", async () => {
            const startBalance = await vault.balanceOf(user);

            const withdrawAmount = ether("25");
            await vault.withdraw(withdrawAmount, { from: user });

            const balance = await vault.balanceOf(user);
            assert(startBalance.sub(balance).eq(ether("25")), "Vault token amount does not match after withdrawal");
        });
    });

    describe("Strategy Management", () => {
        it("should propose a new strategy", async () => {
            const newStrategy = await BaseStrategy.new(
                underlyingToken.address,
                deployer,
                accounts[0],
                accounts[0],
                accounts[0],
                { from: deployer }
            );
            await newStrategy.setVault(vault.address, { from: deployer });
            await vault.proposeStrat(newStrategy.address, { from: deployer });

            const candidate = await vault.stratCandidate();
            assert.equal(candidate.implementation, newStrategy.address, "New strategy address does not match");
        });

        it("should upgrade to the new strategy after approval delay", async () => {
            const newStrategy = await BaseStrategy.new(
                underlyingToken.address,
                deployer,
                accounts[0],
                accounts[0],
                accounts[0],
                { from: deployer }
            );

            await newStrategy.setVault(vault.address, { from: deployer });
            await vault.proposeStrat(newStrategy.address, { from: deployer });

            // Simulate time passing
            await network.provider.send("evm_increaseTime", [approvalDelay.toNumber() + 1]);
            await network.provider.send("evm_mine");

            await vault.upgradeStrat({ from: deployer });

            const currentStrategy = await vault.strategy();
            assert.equal(currentStrategy, newStrategy.address, "Strategy address does not match after upgrade");
        });
    });
});
