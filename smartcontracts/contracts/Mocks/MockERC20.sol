// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-0.8/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    /**
     * @dev Mints `amount` tokens to `account`.
     * Can only be called by the current owner.
     */
    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
