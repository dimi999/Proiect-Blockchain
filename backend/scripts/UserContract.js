const UserProfile = require('../artifacts/contracts/UserProfile.sol/UserProfile.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const users_address = '0x4344B34d4C380Af1d5cb2930578739a5834A9150';
const user_contract = get_user_contract(users_address);
const test_address = '0x9e723B062A96248b4389B034a043F2FAc8Ca049c';
const user_test_contract = get_user_contract(test_address);

function get_user_contract (contract_address) {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(contract_address, UserProfile.abi, signer2);
  return contract;
}

module.exports = { user_contract, user_test_contract };