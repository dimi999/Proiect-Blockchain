//require('@nomiclabs/hardhat-waffle');

/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers")
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config()
module.exports = {
  networks: {
    hardhat: {
      gas: "auto",
      mining: {
        interval: 2000 //ms
      },
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/9a5a23759f5e4e76ada3a165099a792d",
      accounts: [process.env.PRIVATE_KEY, 'e12498ff573a8104f5b221c0dd8d278e6e0d25e8cdc178343981f2f24664e46c', '2cff09fba040b85c0ddee97dbe9443aea1c8c58d9b78246adff14a7ac7e538b8']
    }
  },
  etherscan: {
    apiKey: process.env.SEPOLIA_KEY
  },
  defaultNetwork: "sepolia",
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000
          }
        }
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000
          }
        }
      }
    ]
  }
};
