require("dotenv/config");
require("@nomicfoundation/hardhat-toolbox");

const spicyPrivateKey = process.env.SPICY_PRIVATE_KEY || "";

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          viaIR: true,
        },
      },
    ],
  },
  networks: {
    spicy: {
      url: "https://spicy-rpc.chiliz.com/",
      accounts: spicyPrivateKey ? [spicyPrivateKey] : [],
      chainId: 88882,
      gas: 8000000,
      gasPrice: 100000000000,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
