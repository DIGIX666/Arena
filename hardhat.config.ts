import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config"; // Important : Importez dotenv/config tout en haut

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
    include: ["Arena.sol"], 
  },
};
export default config;
