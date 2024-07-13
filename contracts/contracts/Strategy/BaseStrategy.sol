// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import '../interfaces/IStrategyComplete.sol';


contract BaseStrategy is Ownable, ReentrancyGuard, IStrategyComplete {
    using SafeERC20 for IERC20;

    address public override vault;
    IERC20 public override want;
    address public override keeper;
    address public override unirouter;
    address public override beefyFeeRecipient;
    address public override strategist;
    bool public override paused;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Retired();
    event Paused();
    event Unpaused();

    constructor(
        address _want,
        address _keeper,
        address _unirouter,
        address _beefyFeeRecipient,
        address _strategist
    ) {
        want = IERC20(_want);
        keeper = _keeper;
        unirouter = _unirouter;
        beefyFeeRecipient = _beefyFeeRecipient;
        strategist = _strategist;
    }

    modifier onlyVault() {
        require(msg.sender == vault, "!vault");
        _;
    }

    modifier onlyKeeper() {
        require(msg.sender == keeper, "!keeper");
        _;
    }

    function setKeeper(address _keeper) external override onlyOwner {
        keeper = _keeper;
    }

    function setBeefyFeeRecipient(address _beefyFeeRecipient) external override onlyOwner {
        beefyFeeRecipient = _beefyFeeRecipient;
    }

    function setStrategist(address _strategist) external override onlyOwner {
        strategist = _strategist;
    }

    function setVault(address _vault) external onlyOwner {
        require(vault == address(0), 'Vault Already Set');
        vault = _vault;
    }

    function beforeDeposit() external override onlyVault {}

    function deposit() external override onlyVault nonReentrant {
        uint256 wantBalance = want.balanceOf(address(this));
        emit Deposit(wantBalance);
    }

    function withdraw(uint256 amount) external override onlyVault nonReentrant {
        uint256 wantBalance = want.balanceOf(address(this));
        if (amount > wantBalance) {
            amount = wantBalance;
        }
        want.safeTransfer(vault, amount);
        emit Withdraw(amount);
    }

    function balanceOf() external view override returns (uint256) {
        return want.balanceOf(address(this));
    }

    function balanceOfWant() external view override returns (uint256) {
        return want.balanceOf(address(this));
    }

    function balanceOfPool() external view override returns (uint256) {
        return 0; // Since this is a base strategy, no pool balance is handled here
    }

    function harvest() external override onlyKeeper {}

    function retireStrat() external override onlyVault nonReentrant {
        uint256 wantBalance = want.balanceOf(address(this));
        want.safeTransfer(vault, wantBalance);
        emit Retired();
    }

    function panic() external override onlyKeeper {
        pause();
        uint256 wantBalance = want.balanceOf(address(this));
        want.safeTransfer(vault, wantBalance);
    }

    function pause() public override onlyKeeper {
        paused = true;
        emit Paused();
    }

    function unpause() external override onlyKeeper {
        paused = false;
        emit Unpaused();
    }

    // function paused() external view override returns (bool) {
    //     return paused;
    // }

    // function owner() public view override returns (address) {
    //     return owner();
    // }
}
