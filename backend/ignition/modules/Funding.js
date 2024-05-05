const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("FundingModule", (m) => {

  const funding = m.contract("Funding");

  return { funding };
});