// Configuration settings for Higher/Lower DApp
export const config = {
  // Contract Configuration - FHEVMContract (Unified Solution with Withdrawal)
  contractAddress: '0x77E06E5810aDd5Ee4C3eBc5FB3525Ee92157aAa7', // New FHEVMContract with withdrawETH functions
  chainId: Number((import.meta as any).env?.VITE_CHAIN_ID) || 11155111,
  networkName: (import.meta as any).env?.VITE_NETWORK_NAME as string || 'sepolia',
  
  // RPC Configuration
  rpcUrl: (import.meta as any).env?.VITE_RPC_URL as string || 'https://ethereum-sepolia-rpc.publicnode.com',
  
  // Game Configuration
  defaultWager: 0.01,
  maxWager: 1.0,
  minWager: 0.001,
  
  // UI Configuration
  cardRange: { min: 1, max: 13 },
  cardSuits: ['♠', '♥', '♦', '♣'],
  cardNames: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
  
  // Network Configuration
  networks: {
    sepolia: {
      chainId: 11155111,
      name: 'Sepolia Testnet',
      rpcUrl: 'https://rpc.sepolia.org',
      explorerUrl: 'https://sepolia.etherscan.io',
    },
    localhost: {
      chainId: 31337,
      name: 'Localhost',
      rpcUrl: 'http://127.0.0.1:8545',
      explorerUrl: 'http://localhost:8545',
    }
  }
};

export default config;