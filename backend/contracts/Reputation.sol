// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ReputationToken is ERC20 {
    // The address that deployed this contract
    address public admin;

    // Events
    event AdminChanged(address indexed oldAdmin, address indexed newAdmin);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    // Constructor
    constructor() ERC20("Reputation Token", "REP") {
        admin = msg.sender;
    }

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    // Function to mint new tokens
    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }

    // Function to burn tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount);
    }

    // Function to change the admin address
    function changeAdmin(address newAdmin) external onlyAdmin {
        emit AdminChanged(admin, newAdmin);
        admin = newAdmin;
    }
}