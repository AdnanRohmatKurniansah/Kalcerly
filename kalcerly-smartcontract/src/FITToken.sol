// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error ExceedsMaxSupply();

contract FITToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 1_000_000 ether;

    event TokensMinted(address indexed to, uint256 amount);

    constructor(address admin) ERC20("FIT Token", "FIT") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Mints FIT tokens to the specified address.
    /// @param to Recipient address.
    /// @param amount Amount to mint (in base units).
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply();
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
