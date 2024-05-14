const { expect } = require("chai");
const { ethers } = require("hardhat");

// Import artifacts
const { reputation_contract } = require('../scripts/Reputation')

describe("ReputationToken", (accounts) => {
  let reputationTokenInstance;
  let admin, user1, user2;
  const mintAmount = 100;

  beforeAll(async () => {
    [admin, user1, user2] = await ethers.getSigners();
    reputationTokenInstance = reputation_contract;
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

//   it("should allow users to burn their own tokens", async () => {
//     await reputationTokenInstance.burn(burnAmount, { from: admin });
//     const balance = await reputationTokenInstance.balanceOf(admin);
//     expect(balance.toNumber()).to.equal(initialSupply - burnAmount);
//   });

//   it("should emit TokensBurned event when tokens are burned", async () => {
//     const tx = await reputationTokenInstance.burn(burnAmount, { from: admin });
//     expect(tx.logs[0].event).to.equal("TokensBurned");
//     expect(tx.logs[0].args.from).to.equal(admin);
//     expect(tx.logs[0].args.amount.toNumber()).to.equal(burnAmount);
//   });

  it("should allow the admin to change the admin address", async () => {
    const newAdmin = user1;
    await reputationTokenInstance.changeAdmin(newAdmin);
    const updatedAdmin = await reputationTokenInstance.admin();
    expect(updatedAdmin).to.eq(newAdmin);
  });

//   it("should emit AdminChanged event when admin address is changed", async () => {
//     const newAdmin = user1;
//     const tx = await reputationTokenInstance.changeAdmin(newAdmin, { from: admin });
//     expect(tx.logs[0].event).to.equal("AdminChanged");
//     expect(tx.logs[0].args.oldAdmin).to.equal(admin);
//     expect(tx.logs[0].args.newAdmin).to.equal(newAdmin);
//   });

//   it("should revert if non-admin tries to mint tokens", async () => {
//     await expect(reputationTokenInstance.mint(user1, mintAmount, { from: user2 })).to.be.rejectedWith("Only admin can call this function");
//   });

//   it("should revert if non-admin tries to change admin address", async () => {
//     const newAdmin = user1;
//     await expect(reputationTokenInstance.changeAdmin(newAdmin, { from: user2 })).to.be.rejectedWith("Only admin can call this function");
//   });
});