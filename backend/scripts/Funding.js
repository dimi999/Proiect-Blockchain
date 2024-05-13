const Funding = require('../artifacts/contracts/Funding.sol/Funding.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const funding_address = '0xF3a650D95413d91e9F49DA25Fae1EB0Dd80a5531';
const funding_contract = get_funding_contract();

function get_funding_contract () {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(funding_address, Funding.abi, signer2);
  return contract;
}

module.exports = { funding_contract };