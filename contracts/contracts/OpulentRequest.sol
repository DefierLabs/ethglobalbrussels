// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IChainlinkAggregator {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract OpulentRequest is Ownable {

    event PredictionRequested(uint256 indexed requestId, address indexed user, uint256 timeSteps, uint256 observationPeriod, 
    bool postToAnotherChain, address token, uint80 roundId, uint256 firstObservation, uint256 lastObservation);

    event PredictionPosted(uint256 indexed requestId, address indexed user, uint256 prediction);
    event FeedAdded(address token, address feed);
    event Withdrawal(address indexed to, uint256 amount);

    struct PredictionResponse {
        address token;
        address requester;
        uint80[] prediction;
        uint80 firstObservation;
        uint80 lastObservation;
    }

    uint256 public ethPrice;
    uint256 public requestCount;

    mapping(address => address) public tokenToFeed;
    mapping(uint256 => PredictionResponse) public predictions;
    mapping(address => bool) public allowedAIs;

    modifier onlyAllowedAI() {
        require(allowedAIs[msg.sender], "Not an allowed AI");
        _;
    }

    constructor() {}

    function setEthPrice(uint256 _ethPrice) public onlyOwner {
        ethPrice = _ethPrice;
    }

    function addFeed(address token, address feed) public onlyOwner {
        tokenToFeed[token] = feed;
        emit FeedAdded(token, feed);
    }

    function addAllowedAI(address ai) public onlyOwner {
        allowedAIs[ai] = true;
    }

    function removeAllowedAI(address ai) public onlyOwner {
        allowedAIs[ai] = false;
    }

    function requestPrediction(uint256 timeSteps, uint256 observationPeriod, bool postToAnotherChain, address token) public payable {
        require(tokenToFeed[token] != address(0), "No feed for token");
        uint256 minCost = ethPrice * timeSteps;
        require(msg.value >= minCost, "Insufficient ETH sent");

        requestCount++;
        uint256 requestId = requestCount;

        // Get the latest round ID from Chainlink Aggregator
        IChainlinkAggregator aggregator = IChainlinkAggregator(tokenToFeed[token]);
        (uint80 roundId,, uint256 startedAt,,) = aggregator.latestRoundData();

        uint256 firstObservation = startedAt;
        uint256 lastObservation = block.timestamp;

        emit PredictionRequested(requestId, msg.sender, timeSteps, observationPeriod, postToAnotherChain, token, roundId, firstObservation, lastObservation);
    }

    function postPrediction(uint256 requestId, uint80[] memory prediction, uint80 firstObservation, uint80 lastObservation) public onlyAllowedAI {
        PredictionResponse storage response = predictions[requestId];
        response.token = predictions[requestId].token;
        response.requester = predictions[requestId].requester;
        response.prediction = prediction;
        response.firstObservation = firstObservation;
        response.lastObservation = lastObservation;

        emit PredictionPosted(requestId, predictions[requestId].requester, prediction[0]);
    }

    function getPrediction(uint256 requestId) public view returns (PredictionResponse memory) {
        return predictions[requestId];
    }

    function withdraw(address to) public onlyOwner {
        uint amount = address(this).balance;
        payable(to).transfer(amount);
        emit Withdrawal(to, amount);
    }

    function reconcilePrediction(uint256 requestId) public view returns (int256) {
        PredictionResponse memory response = predictions[requestId];
        IChainlinkAggregator aggregator = IChainlinkAggregator(tokenToFeed[response.token]);
        (, int256 actualValue,,,) = aggregator.latestRoundData();
        uint80 predictedValue = response.prediction[response.prediction.length - 1];
        int256 intPredictedValue = int256(uint256(predictedValue));
        int256 difference = actualValue - intPredictedValue;
        return (difference * 10000) / actualValue; // percentage difference in basis points (1/100th of a percent)
    }


    receive() external payable {}
}
