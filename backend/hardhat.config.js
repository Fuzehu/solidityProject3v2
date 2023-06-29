require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PK = process.env.PK || "";
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN = process.env.ETHERSCAN || "";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    sepolia: {
      url: RPC_URL,
      accounts: [`0x${PK}`],
      chainId: 11155111
    }
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 40000
  }
};