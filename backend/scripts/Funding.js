const Funding = require('../artifacts/contracts/Funding.sol/Funding.json');
const {ethers} = require('hardhat');
require('dotenv').config()

const test_address = '0x9DcBE00Afb4526A5ea180b399F1Ac57E30478f8E';
const funding_address = '0xB4Cd004f01AC5A428f169F956192415722A9fb3C';
const funding_contract = get_funding_contract(funding_address);
const funding_test_contract = get_funding_contract(test_address);

function get_funding_contract (contract_address) {
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
  let signer2 = signer.connect(ethers.provider);
  let contract = new ethers.Contract(contract_address, Funding.abi, signer2);

  return contract;
}

module.exports = { funding_contract, funding_test_contract };