const Funding = require('../artifacts/contracts/Funding.sol/Funding.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const funding_address = '0x7189ce02622c20EdDb6579D32B558F537293C0Cd'; // proxy address
const funding_contract = get_funding_contract();

function get_funding_contract () {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(funding_address, Funding.abi, signer2);

  return contract;
}

module.exports = { funding_contract };