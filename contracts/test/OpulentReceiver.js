const { BN, expectRevert, ether } = require('@openzeppelin/test-helpers');
const OpulentRequest = artifacts.require("OpulentRequest");
const IndicatorContract = artifacts.require("OpulentReceiver");
const IUniswapV2Router02 = artifacts.require("IUniswapV2Router02");
const IERC20 = artifacts.require("IERC20");

contract("IndicatorContract", async accounts => {
  let opulentRequest;
  let indicatorContract;
  const uniswapRouterAddress = '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'; // Replace with actual Uniswap router address
  const usdcAddress = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'; // Replace with actual USDC address
  const wethAddress = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1'; // Replace with actual WETH address
  const aggregatorAddress = '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612'; // Chainlink ETH/USD aggregator
  const ethPrice = ether('0'); // 1 ETH

  before(async () => {
    // Deploy the OpulentRequest contract
    opulentRequest = await OpulentRequest.new({from: accounts[0]});

    // Set the ETH price
    await opulentRequest.setEthPrice(ethPrice, {from: accounts[0]});
    
    // Add the real aggregator as a feed
    await opulentRequest.addFeed(wethAddress, aggregatorAddress, {from: accounts[0]});

    // Deploy the IndicatorContract contract
    indicatorContract = await IndicatorContract.new(
      opulentRequest.address,
      uniswapRouterAddress,
      usdcAddress,
      wethAddress,
      aggregatorAddress,
      {from: accounts[0]}
    );

    // Add allowed AI for posting predictions
    await opulentRequest.addAllowedAI(accounts[1], {from: accounts[0]});
  });

  it('should allow the owner to fund the contract', async () => {
    await indicatorContract.fund({from: accounts[0], value: ether('10')});
    const wethBalance = await(await IERC20.at(wethAddress)).balanceOf(indicatorContract.address);
    assert(new BN(wethBalance).eq(ether('10')), "WETH balance should be 10 ETH");
  });

  it('should revert if non-owner tries to fund the contract', async () => {
    await expectRevert(
      indicatorContract.fund({from: accounts[1], value: ether('1')}),
      "Ownable: caller is not the owner"
    );
  });

  it('should deploy IndicatorContract contract', async () => {
    assert(indicatorContract.address !== '', "IndicatorContract contract should be deployed");
  });

  it('should request prediction and emit correct event', async () => {
    await opulentRequest.requestPrediction(10, 5, false, wethAddress, {from: accounts[1], value: ether('0')});
    
    // Check if the event was emitted
    const event = await opulentRequest.getPastEvents('PredictionRequested', {fromBlock: 'latest'});
    assert(event.length > 0, "PredictionRequested event should be emitted");
    assert(event[0].args.user === accounts[1], "Event should log the correct user");
    assert(event[0].args.roundId.gt(new BN(0)), "Event should log a valid round ID");
  });

  it('should post a prediction from an allowed AI', async () => {
    await opulentRequest.postPrediction(1, [100000000000, 110000000000, 120000000000], 1, 10, {from: accounts[1]});
    const prediction = await opulentRequest.getPrediction(1);
    assert(new BN(prediction.prediction[0]).eq(new BN(100000000000)), "Prediction should be stored correctly");
  });

  it('should update position from long to short and swap to USDC', async () => {
    // Assuming the latest round data from the aggregator returns a value less than 120 to trigger the swap
    await indicatorContract.updatePosition(1, {from: accounts[0]});

    // Check if the position changed to short
    const longPosition = await indicatorContract.longPosition();
    assert(longPosition, "Position should be long");

    // Check if the USDC balance increased (since it swapped WETH to USDC)
    const usdcBalance = await(await IERC20.at(wethAddress)).balanceOf(indicatorContract.address);
    assert(usdcBalance.gt(new BN(0)), "USDC balance should increase after swap");
  });

  it('should update position from long to short and swap to WETH', async () => {
    await opulentRequest.requestPrediction(10, 5, false, wethAddress, {from: accounts[1], value: ether('10')});
    await opulentRequest.postPrediction(2, [0, 0, 0], 1, 10, {from: accounts[1]});

    // Assuming the latest round data from the aggregator returns a value greater than 120 to trigger the swap
    await indicatorContract.updatePosition(2, {from: accounts[0]});

    // Check if the position changed to long
    const longPosition = await indicatorContract.longPosition();
    assert(!longPosition, "Position should be short");

    // Check if the USDC balance increased (since it swapped WETH to USDC)
    const usdcBalance = await(await IERC20.at(usdcAddress)).balanceOf(indicatorContract.address);
    assert(usdcBalance.gt(new BN(0)), "USDC balance should increase after swap");
  });

  it('should revert if non-owner tries to call updatePosition', async () => {
    await expectRevert(
      indicatorContract.updatePosition(1, {from: accounts[2]}),
      "Ownable: caller is not the owner"
    );
  });
});
