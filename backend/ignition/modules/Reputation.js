const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("ReputationToken", (m) => {

  const reputation = m.contract("ReputationToken");

  return { reputation };
});