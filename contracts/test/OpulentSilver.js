const { BN, ether, expectRevert, send } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const OpulentSilver = artifacts.require("./OpulentSilver.sol");

contract("OpulentSilver", accounts => {

  let opulentSilver;
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  beforeEach(async () => {
    opulentSilver = await OpulentSilver.new({ from: owner });
  });

  it('should deploy successfully', async () => {
    expect(opulentSilver.address).to.not.be.empty;
  });

  it('should have correct name and symbol', async () => {
    const name = await opulentSilver.name();
    const symbol = await opulentSilver.symbol();
    expect(name).to.equal("Opulent Silver");
    expect(symbol).to.equal("opXAG");
  });

  it('should allow minting silver tokens', async () => {
    const mintAmount = ether('1');  // 1 ETH
    await opulentSilver.mintSilver({ from: user1, value: mintAmount });
    const balance = await opulentSilver.balanceOf(user1);
    expect(balance).to.be.bignumber.gt(new BN('0'));
  });

  it('should revert when minting with 0 ETH', async () => {
    await expectRevert(
      opulentSilver.mintSilver({ from: user1, value: 0 }),
      "Must send ETH to mint"
    );
  });

  it('should allow burning silver tokens', async () => {
    const mintAmount = ether('1');  // 1 ETH
    await opulentSilver.mintSilver({ from: user1, value: mintAmount });
    const initialBalance = await opulentSilver.balanceOf(user1);
    
    await opulentSilver.burnSilver(initialBalance, { from: user1 });
    const finalBalance = await opulentSilver.balanceOf(user1);
    expect(finalBalance).to.be.bignumber.equal(new BN('0'));
  });

  it('should revert when burning more tokens than owned', async () => {
    const mintAmount = ether('1');  // 1 ETH
    await opulentSilver.mintSilver({ from: user1, value: mintAmount });
    const balance = await opulentSilver.balanceOf(user1);
    
    await expectRevert(
      opulentSilver.burnSilver(balance.add(new BN('1')), { from: user1 }),
      "Insufficient balance"
    );
  });

  it('should allow buying ETH with silver tokens and deduct fee', async () => {
    const mintAmount = ether('1');  // 1 ETH
    await opulentSilver.mintSilver({ from: user1, value: mintAmount });
    const balance = await opulentSilver.balanceOf(user1);
    
    const initialEthBalance = await web3.eth.getBalance(user1);
    await opulentSilver.buyEthWithSilver(balance, { from: user1 });
    const finalEthBalance = await web3.eth.getBalance(user1);
    
    expect(finalEthBalance).to.be.bignumber.gt(initialEthBalance); // account for gas fees in real testing
  });

  it('should revert buying ETH with zero silver amount', async () => {
    await expectRevert(
      opulentSilver.buyEthWithSilver(0, { from: user1 }),
      "Amount must be greater than 0"
    );
  });

  it('should revert buying ETH with more tokens than balance', async () => {
    await expectRevert(
      opulentSilver.buyEthWithSilver(ether('1'), { from: user1 }),
      "Insufficient balance"
    );
  });

  it('should allow buying silver with ETH and deduct fee', async () => {
    const mintAmount = ether('1');  // 1 ETH
    await opulentSilver.mintSilver({ from: user1, value: mintAmount });

    // Transfer some tokens to the contract for the buySilverWithEth function
    const silverBalance = await opulentSilver.balanceOf(user1);
    await opulentSilver.transfer(opulentSilver.address, silverBalance, { from: user1 });

    const buyValue = ether('0.01'); // 0.01 ETH
    const initialSilverBalance = await opulentSilver.balanceOf(user2);

    await opulentSilver.buySilverWithEth({ from: user2, value: buyValue });

    const finalSilverBalance = await opulentSilver.balanceOf(user2);
    const fee = silverBalance.mul(new BN(10)).div(new BN(100));
    const netSilverAmount = silverBalance.sub(fee);

    expect(finalSilverBalance).to.be.bignumber.gt(initialSilverBalance);
  });

  it('should revert buying OpulentSilver tokens with zero ETH', async () => {
    await expectRevert(
      opulentSilver.buySilverWithEth({ from: user1, value: 0 }),
      "Must send ETH to buy silver"
    );
  });

  it('should return correct collateralization ratio', async () => {
    const mintAmount = ether('1');  // 1 ETH
    await opulentSilver.mintSilver({ from: user1, value: mintAmount });
    const ratio = await opulentSilver.getCollateralizationRatio(user1);
    expect(ratio).to.be.bignumber.gte(new BN('150'));
  });
});
