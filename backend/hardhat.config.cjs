//require('@nomiclabs/hardhat-waffle');

/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-ethers");
module.exports = {
  networks: {
    hardhat: {
      gas: "auto",
      mining: {
        interval: 2000 //ms
      },
    },
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: ["1ba763e8ba0409b85ded089dac003b5fadc403d304528f9f5d31495d59899eab"]
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
