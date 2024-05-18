const Reputation = require('../artifacts/contracts/Reputation.sol/ReputationToken.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const reputation_address = '0x6f56ef00e3d5C26c45519d235FE590B7D527c743';
const reputation_contract = get_reputation_contract(reputation_address);
const test_address = '0x5AD65aE8f6616aAb02b6B61BE195d0422DAb0335';
const reputation_test_contract = get_reputation_contract(test_address);

function get_reputation_contract (address) {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(address, Reputation.abi, signer2);

  return contract;
}

module.exports = { reputation_contract, reputation_test_contract };