// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IChainlinkAggregator {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract OpulentSilver is ERC20, ReentrancyGuard {
    IChainlinkAggregator internal silverPriceFeed;
    IChainlinkAggregator internal ethUsdPriceFeed;

    uint256 public constant COLLATERALIZATION_RATIO = 150; // 150% collateralization
    uint256 public constant PRICE_FEED_DECIMALS = 8;
    uint256 public constant FEE_PERCENTAGE = 10; // 10% fee for transactions

    mapping(address => uint256) public collateralBalances;

    constructor() ERC20("Opulent Silver", "opXAG") {
        silverPriceFeed = IChainlinkAggregator(0xC56765f04B248394CF1619D20dB8082Edbfa75b1);
        ethUsdPriceFeed = IChainlinkAggregator(0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612);
    }

    function mintSilver() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH to mint");
        
        uint256 silverAmount = calculateSilverForEth(msg.value);
        uint256 maxSilverAmount = (silverAmount * 100) / COLLATERALIZATION_RATIO;

        _mint(msg.sender, maxSilverAmount);
        collateralBalances[msg.sender] += msg.value;
    }

    function burnSilver(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 ethAmount = calculateEthForSilver(amount);

        require(ethAmount <= collateralBalances[msg.sender], "Insufficient collateral");

        _burn(msg.sender, amount);
        collateralBalances[msg.sender] -= ethAmount;
        payable(msg.sender).transfer(ethAmount);
    }

    function buyEthWithSilver(uint256 silverAmount) external nonReentrant {
        require(silverAmount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= silverAmount, "Insufficient balance");

        uint256 ethAmount = calculateEthForSilver(silverAmount);
        uint256 fee = (ethAmount * FEE_PERCENTAGE) / 100;
        uint256 netEthAmount = ethAmount - fee;

        require(netEthAmount <= address(this).balance, "Insufficient ETH in pool");

        _burn(msg.sender, silverAmount);
        payable(msg.sender).transfer(netEthAmount);
    }

    function buySilverWithEth() external payable nonReentrant {
        require(msg.value > 0, "Must send ETH to buy silver");

        uint256 silverAmount = calculateSilverForEth(msg.value);
        uint256 fee = (silverAmount * FEE_PERCENTAGE) / 100;
        uint256 netSilverAmount = silverAmount - fee;

        require(balanceOf(address(this)) >= netSilverAmount, "Insufficient silver in pool");

        _transfer(address(this), msg.sender, netSilverAmount);
    }

    function getPrices() public view returns (uint256, uint256) {
        (, int256 ethUsdPrice,,,) = ethUsdPriceFeed.latestRoundData();
        (, int256 silverUsdPrice,,,) = silverPriceFeed.latestRoundData();
        
        return (uint256(ethUsdPrice), uint256(silverUsdPrice));
    }

    function getCollateralBalance(address user) public view returns (uint256) {
        return collateralBalances[user];
    }

    function getCollateralizationRatio(address user) public view returns (uint256) {
        if (balanceOf(user) == 0) return 0;
        
        (uint256 ethUsdPrice, uint256 silverUsdPrice) = getPrices();
        
        uint256 collateralValueInUsd = (collateralBalances[user] * ethUsdPrice) / 1e18;
        uint256 silverValueInUsd = (balanceOf(user) * silverUsdPrice) / 1e18;
        
        return (collateralValueInUsd * 100) / silverValueInUsd;
    }

    // Helper view functions
    function calculateSilverForEth(uint256 ethAmount) public view returns (uint256) {
        (uint256 ethUsdPrice, uint256 silverUsdPrice) = getPrices();
        
        uint256 ethValueInUsd = (ethAmount * ethUsdPrice) / 1e18;
        uint256 silverAmount = (ethValueInUsd * 1e18) / silverUsdPrice;
        
        return silverAmount;
    }

    function calculateEthForSilver(uint256 silverAmount) public view returns (uint256) {
        (uint256 ethUsdPrice, uint256 silverUsdPrice) = getPrices();

        uint256 silverValueInUsd = (silverAmount * silverUsdPrice) / 1e18;
        uint256 ethAmount = (silverValueInUsd * 1e18) / ethUsdPrice;
        
        return ethAmount;
    }

    function getExpectedSilverForEth(uint256 ethAmount) external view returns (uint256) {
        uint256 silverAmount = calculateSilverForEth(ethAmount);
        uint256 fee = (silverAmount * FEE_PERCENTAGE) / 100;
        return silverAmount - fee;
    }

    function getExpectedEthForSilver(uint256 silverAmount) external view returns (uint256) {
        uint256 ethAmount = calculateEthForSilver(silverAmount);
        uint256 fee = (ethAmount * FEE_PERCENTAGE) / 100;
        return ethAmount - fee;
    }
}