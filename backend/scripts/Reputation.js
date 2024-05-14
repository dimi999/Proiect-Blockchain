const Reputation = require('../artifacts/contracts/Reputation.sol/ReputationToken.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const reputation_address = '0x5f31CE2ebD968F55509b8c187Ec7376afcf427AE';
const reputation_contract = get_reputation_contract();

function get_reputation_contract () {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(reputation_address, Reputation.abi, signer2);

  return contract;
}

module.exports = { reputation_contract };