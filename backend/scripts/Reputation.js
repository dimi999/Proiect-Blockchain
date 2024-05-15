const Reputation = require('../artifacts/contracts/Reputation.sol/ReputationToken.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const reputation_address = '0x27Af01B8cb11568B8d66Ac39cDf35feE7e4E4E79';
const reputation_contract = get_reputation_contract();

function get_reputation_contract () {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(reputation_address, Reputation.abi, signer2);

  return contract;
}

module.exports = { reputation_contract };