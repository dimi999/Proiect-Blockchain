const UserProfile = require('../artifacts/contracts/UserProfile.sol/UserProfile.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const users_address = '0x33f4dA505F1274055F4A137C870949CB3C995Ac9';
const user_contract = get_user_contract();

function get_user_contract () {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(users_address, UserProfile.abi, signer2);
  contract.addListener('UserCreated', (eventArgs) => {
      console.log(eventArgs);
  });
  contract.addListener('UserUpdated', (eventArgs) => {
    console.log(eventArgs);
});
  return contract;
}

module.exports = { user_contract };