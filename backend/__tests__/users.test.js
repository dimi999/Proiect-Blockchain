const { expect } = require("chai");
const { user_contract } = require('../scripts/UserContract');

//const { ethers } = require("hardhat");
//const { expect } = require("chai");

describe("UserActions", () => {

    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

    beforeAll(async () => {
        await wait(1000);
        //console.log(user_contract);
    });

  it("should revert getting inexistent user", async () => {
    await expect(user_contract.getUser("0x5FDE00870Cd1988802EDc26D8C5c415dAc593DE7")).to.be.revertedWith("User does not exist");
  });

  it("should revert updating inexistent user", async () => {
    await expect(user_contract.updateUser("0x5FDE00870Cd1988802EDc26D8C5c415dAc593DE7", "ceva@email.com", "ceva")).to.be.revertedWith("User does not exist");
  });

  it("should update user personal data and emit event", async () => {
    const tx = await user_contract.updateUser("0x97969a099f209098bd970F4E15ed1A783a488B27", "ceva@email.com", "ceva");
    await tx.wait();
    const user = await user_contract.getUser("0x97969a099f209098bd970F4E15ed1A783a488B27");
    expect(user[2]).to.eq('ceva@email.com');
  }, 20000);
});

describe("UserEvents", () => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));



  beforeAll(async () => {
    await wait(1000);
    //console.log(user_contract);
  });

  it("should emit event when updating user", async() => {
    const tx = await user_contract.updateUser("0xbb2eA6034eE427EB40c053A95Ad9D2d3a7098281", "ceva@email.com", "ceva");
    const result = await tx.wait();
    const logs = result.logs;
    let count = 0;
    for (x of logs) {
      if(x.fragment.name == 'UserUpdated')
        count += 1;
    }
    expect(count).to.eq(1);

  }, 20000);

});
