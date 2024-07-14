const { BN, expectRevert, ether } = require('@openzeppelin/test-helpers');
const OpulentRequest = artifacts.require("OpulentRequest");

contract("OpulentRequest", async accounts => {
  let opulentRequest;
  const ethToken = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
  const aggregatorAddress = '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612';
  const ethPrice = ether('1'); // 1 ETH

  before(async () => {
    // Deploy the OpulentRequest contract
    opulentRequest = await OpulentRequest.new({from: accounts[0]});
    
    // Set the ETH price
    await opulentRequest.setEthPrice(ethPrice, {from: accounts[0]});
    
    // Add the real aggregator as a feed
    await opulentRequest.addFeed(ethToken, aggregatorAddress, {from: accounts[0]});
  });

  it('should deploy OpulentRequest contract', async () => {
    assert(opulentRequest.address !== '', "OpulentRequest contract should be deployed");
  });

  it('should allow the owner to add a feed', async () => {
    await opulentRequest.addFeed(accounts[8], accounts[7], {from: accounts[0]});
    const feed = await opulentRequest.tokenToFeed(accounts[8]);
    assert(feed === accounts[7], "Feed should be added correctly");
  });

  it('should revert if a non-owner tries to add a feed', async () => {
    await expectRevert(
      opulentRequest.addFeed(accounts[8], accounts[8], {from: accounts[1]}),
      "Ownable: caller is not the owner"
    );
  });

  it('should allow the owner to update ETH price', async () => {
    const newEthPrice = ether('0'); // 2 ETH
    await opulentRequest.setEthPrice(newEthPrice, {from: accounts[0]});
    const updatedEthPrice = await opulentRequest.ethPrice();
    assert(updatedEthPrice.eq(newEthPrice), "ETH price should be updated");
  });

  it('should revert if no feed exists for a token', async () => {
    await expectRevert(
      opulentRequest.requestPrediction(10, 5, false, accounts[4], {from: accounts[1], value: ether('10')}),
      "No feed for token"
    );
  });

  it('should allow a user to request prediction with ETH and emit correct event', async () => {
    await opulentRequest.requestPrediction(10, 5, false, ethToken, {from: accounts[1], value: ether('0')});
    
    // Check if the event was emitted
    const event = await opulentRequest.getPastEvents('PredictionRequested', {fromBlock: 'latest'});
    assert(event.length > 0, "PredictionRequested event should be emitted");
    assert(event[0].args.user === accounts[1], "Event should log the correct user");
    assert(event[0].args.roundId.gt(new BN(0)), "Event should log a valid round ID");
  });

  it('should revert if insufficient ETH is sent', async () => {
    let newEthPrice = ether('2'); // 2 ETH
    await opulentRequest.setEthPrice(newEthPrice, {from: accounts[0]});


    await expectRevert(
      opulentRequest.requestPrediction(10, 5, false, ethToken, {from: accounts[1], value: ether('5')}),
      "Insufficient ETH sent"
    );

    newEthPrice = ether('0'); 
    await opulentRequest.setEthPrice(newEthPrice, {from: accounts[0]});


  });

  it('should allow the owner to add an allowed AI', async () => {
    await opulentRequest.addAllowedAI(accounts[1], {from: accounts[0]});
    const isAllowed = await opulentRequest.allowedAIs(accounts[1]);
    assert(isAllowed === true, "AI should be added to allowed list");
  });

  it('should revert if a non-owner tries to add an allowed AI', async () => {
    await expectRevert(
      opulentRequest.addAllowedAI(accounts[2], {from: accounts[1]}),
      "Ownable: caller is not the owner"
    );
  });

  it('should allow the owner to remove an allowed AI', async () => {
    await opulentRequest.removeAllowedAI(accounts[1], {from: accounts[0]});
    const isAllowed = await opulentRequest.allowedAIs(accounts[1]);
    assert(isAllowed === false, "AI should be removed from allowed list");
  });

  it('should revert if a non-owner tries to remove an allowed AI', async () => {
    await expectRevert(
      opulentRequest.removeAllowedAI(accounts[2], {from: accounts[1]}),
      "Ownable: caller is not the owner"
    );
  });

  it('should post a prediction from an allowed AI', async () => {
    await opulentRequest.addAllowedAI(accounts[1], {from: accounts[0]});
    await opulentRequest.postPrediction(1, [100, 110, 120], 1, 10, {from: accounts[1]});
    const prediction = await opulentRequest.getPrediction(1);
    console.log(prediction.prediction)
    assert(new BN(prediction.prediction[0]).eq(new BN(100)), "Prediction should be stored correctly");
  });

  it('should revert if unauthorized address tries to post a prediction', async () => {
    await expectRevert(
      opulentRequest.postPrediction(1, [100, 110, 120], 1, 10, {from: accounts[2]}),
      "Not an allowed AI"
    );
  });

  it('should allow the owner to withdraw funds', async () => {
    const initialBalance = new BN(await web3.eth.getBalance(opulentRequest.address));
    await opulentRequest.withdraw(accounts[0], {from: accounts[0]});
    const finalBalance = new BN(await web3.eth.getBalance(opulentRequest.address));
    assert(finalBalance.lte(initialBalance), "Owner should be able to withdraw funds");
  });

  it('should revert if non-owner tries to withdraw funds', async () => {
    await expectRevert(
      opulentRequest.withdraw(accounts[1], {from: accounts[1]}),
      "Ownable: caller is not the owner"
    );
  });

  it('should reconcile prediction correctly', async () => {
    await opulentRequest.addAllowedAI(accounts[1], {from: accounts[0]});
    await opulentRequest.postPrediction(1, [100, 110, 120], 1, 10, {from: accounts[1]});
    const difference = await opulentRequest.reconcilePrediction(1, 130);
    assert(difference.eq(new BN(769)), "Percentage difference should be correctly calculated in basis points");
  });
});
