import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";


const spicyPrivateKey = process.env.SPICY_PRIVATE_KEY || "";


const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },

    ],
  },
  networks: {
    spicy: {
      url: "https://spicy-rpc.chiliz.com/",
      accounts: [spicyPrivateKey], 
       
      chainId: 88882,
    },
  },
  paths: {
    sources: "./contracts",
  },
};
export default config;
