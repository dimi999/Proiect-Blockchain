// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserProfile {
    struct User {
        address userAddress;
        string status;
        uint256 balance;
    }

    mapping(address => User) public users;

    event UserCreated(address indexed userAddress, string name, string email);
    event UserUpdated(address indexed userAddress, string name, string email);

    function createUser(string calldata name, string calldata email) external returns (User memory){
        require(bytes(users[msg.sender].status).length == 0, "User already exists");
        users[msg.sender] = User({
            userAddress: msg.sender,
            status: "Acount Created",
            balance: 0
        });
        emit UserCreated(msg.sender, name, email);
        return users[msg.sender];
    }

    function updateUser(string calldata name, string calldata email) external {
        require(bytes(users[msg.sender].name).length != 0, "User does not exist");
        users[msg.sender].name = name;
        users[msg.sender].email = email;
        emit UserUpdated(msg.sender, name, email);
    }

    function getUser(address userAddress) external view returns (User memory) {
        require(bytes(users[userAddress].name).length != 0, "User does not exist");
        return users[userAddress];
    }

    function transferTokens(address userAddress, uint256 amount) external {
        require(bytes(users[userAddress].name).length != 0, "User does not exist");
        users[userAddress].balance += amount;
    }
}