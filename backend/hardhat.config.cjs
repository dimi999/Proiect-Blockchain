//require('@nomiclabs/hardhat-waffle');

/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers")
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
      accounts: [process.env.PRIVATE_KEY]
    }
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
