const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("UserProfileModule", (m) => {

  const userProfile = m.contract("UserProfile");

  return { userProfile };
});