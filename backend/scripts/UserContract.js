const UserProfile = require('../artifacts/contracts/UserProfile.sol/UserProfile.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const users_address = '0x2654Ef0E4169210F6AD0392d2312206a23f0bc6a';
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