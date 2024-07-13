// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-0.8/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-0.8/access/Ownable.sol";

interface IBeefyVault {
    function want() external view returns (IERC20);
}

contract MockStrategy is Ownable {
    IERC20 public want;
    address public vault;

    constructor(IERC20 _want, address _vault) {
        want = _want;
        vault = _vault;
    }

    function beforeDeposit() external view {
        require(msg.sender == vault, "Not vault");
    }

    function deposit() external {
        require(msg.sender == vault, "Not vault");
        // Mock deposit logic
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == vault, "Not vault");
        want.transfer(vault, _amount);
    }

    function balanceOf() external view returns (uint256) {
        return want.balanceOf(address(this));
    }

    function retireStrat() external {
        require(msg.sender == vault, "Not vault");
        // Mock retire logic
    }

    function setVault(address v) external {
        
    }

    // function vault() external view returns (address) {
    //     return vault;
    // }
}
