const { expect } = require("chai");
const { ethers } = require("hardhat");

// Import artifacts
const { reputation_test_contract } = require('../scripts/Reputation')

describe("ReputationToken", (accounts) => {
  let reputationTokenInstance;
  let admin, user1, user2;
  const mintAmount = 100;

  beforeAll(async () => {
    [admin, user1, user2] = await ethers.getSigners();
    reputationTokenInstance = reputation_test_contract;
  });

  it("should have the correct name and symbol", async () => {
    const name = await reputationTokenInstance.name();
    const symbol = await reputationTokenInstance.symbol();
    expect(name).to.eq("Reputation Token");
    expect(symbol).to.eq("REP");
  });

  it("should allow the admin to mint new tokens", async () => {
    const balance1 = await reputationTokenInstance.balanceOf(user1);
    const tx = await reputationTokenInstance.mint(user1, mintAmount);
    await tx.wait();
    const balance2 = await reputationTokenInstance.balanceOf(user1);
    expect(balance2 - balance1).to.eq(mintAmount);
  }, 20000);

  it("should emit TokensMinted event when new tokens are minted", async () => {
    const tx = await reputationTokenInstance.mint(user1, mintAmount);
    const result = await tx.wait();
    const logs = result.logs;
    let count = 0;
    for (x of logs) {
      if(x.fragment.name == 'TokensMinted')
        count += 1;
    }
    expect(count).to.eq(1);
  }, 30000);

  it("should allow the admin to change the admin address", async () => {
    const newAdmin = user1;
    const tx = await reputationTokenInstance.changeAdmin(newAdmin);
    await tx.wait();
    const updatedAdmin = await reputationTokenInstance.admin();
    expect(updatedAdmin).to.eq(await newAdmin.getAddress());
  }, 20000);

});