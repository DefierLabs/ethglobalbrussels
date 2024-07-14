// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "./OpulentRequest.sol";

interface IWrappedNative {
    function deposit() external payable;
}

contract OpulentReceiver is Ownable {
    OpulentRequest public opulentRequest;
    IUniswapV2Router02 public uniswapRouter;
    address public usdc;
    address public weth;
    address public aggregator;
    bool public longPosition; // true for long, false for short

    event PositionChanged(bool longPosition);

    constructor(address _opulentRequest, address _uniswapRouter, address _usdc, address _weth, address _aggregator) {
        opulentRequest = OpulentRequest(payable(_opulentRequest));
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        usdc = _usdc;
        weth = _weth;
        aggregator = _aggregator;
    }

    function updatePosition(uint256 requestId) external onlyOwner {
        // Get the latest value from the Chainlink aggregator
        IChainlinkAggregator agg = IChainlinkAggregator(aggregator);
        (, int256 actualValue,,,) = agg.latestRoundData();

        // Get the final predicted value from the OpulentRequest contract
        OpulentRequest.PredictionResponse memory response = opulentRequest.getPrediction(requestId);
        int256 predictedValue = int256(uint256(response.prediction[response.prediction.length - 1]));

        if (actualValue > predictedValue && !longPosition) {
            // Change from short to long
            _swap(usdc, weth, IERC20(usdc).balanceOf(address(this)));
            longPosition = true;
            emit PositionChanged(longPosition);
        } else if (actualValue < predictedValue && longPosition) {
            // Change from long to short
            _swap(weth, usdc, IERC20(weth).balanceOf(address(this)));
            longPosition = false;
            emit PositionChanged(longPosition);
        }
    }

    function _swap(address fromToken, address toToken, uint256 amount) internal {
        if(amount > 0){
            IERC20(fromToken).approve(address(uniswapRouter), amount);
            address[] memory path = new address[](2);
            path[0] = fromToken;
            path[1] = toToken;

            uniswapRouter.swapExactTokensForTokens(
                amount,
                0, // Accept any amount of output token
                path,
                address(this),
                block.timestamp + 60
            );
        }

    }

    function setOpulentRequest(address _opulentRequest) external onlyOwner {
        opulentRequest = OpulentRequest(payable(_opulentRequest));
    }

    function setUniswapRouter(address _uniswapRouter) external onlyOwner {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
    }

    function setUSDC(address _usdc) external onlyOwner {
        usdc = _usdc;
    }

    function setWETH(address _weth) external onlyOwner {
        weth = _weth;
    }

    function setAggregator(address _aggregator) external onlyOwner {
        aggregator = _aggregator;
    }

    receive() external payable {}

    function fund() external payable onlyOwner {
        IWrappedNative(weth).deposit{value: msg.value}();
    }

    function withdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(msg.sender, amount);
    }
}
