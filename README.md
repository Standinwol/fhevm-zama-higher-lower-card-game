# 🃏 Higher/Lower DApp - FHEVM Privacy Gaming

A decentralized blockchain-based card guessing game built with **Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine)** for complete privacy and modern Web3 architecture. Players guess whether the next card will be higher or lower than the current card, with real ETH rewards and transparent gameplay on the Ethereum blockchain.

![Higher/Lower Game Preview](https://img.shields.io/badge/Status-Production_Ready-green)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-blue)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)
![FHEVM](https://img.shields.io/badge/FHEVM-Zama_SDK-purple)

## 🔐 FHEVM Privacy Features

### 🔒 Complete Privacy Integration
- **Encrypted Gameplay**: All game data encrypted with FHEVM
- **Zero-Knowledge Proofs**: Secure input validation without revealing data
- **SepoliaConfig Integration**: Production-ready FHEVM setup
- **Encrypted Balances**: Private wallet balance management
- **Encrypted Scoring**: Score tracking without revealing values

### 👍 Deployed FHEVM Contract
- **FHEVMContract**: `0x4099E173d8fBC5499Ca6fdD0cBfe93524388B557` (Complete solution)
- **Single Contract**: All FHEVM demo + gaming functionality in one place

## 🌟 Features

### 🎯 Game Features
- **Higher/Lower Card Game**: Classic card guessing with blockchain integration
- **Progressive Scoring**: Exponential payouts (1.5x multiplier per correct guess)
- **Cash Out Anytime**: Players can secure winnings at any time
- **Real-time Results**: Instant feedback with smooth animations
- **Transparent Gameplay**: All game logic verified on-chain

### 👩‍💻 Blockchain Integration
- **FHEVM Privacy**: Full homomorphic encryption for complete privacy
- **MetaMask Connection**: Seamless wallet integration
- **Sepolia Testnet**: Safe testing environment with FHEVM support
- **Smart Contract Game Logic**: Transparent and verifiable with encryption
- **Transaction Timeout Handling**: Robust error management
- **Gas Optimization**: Efficient contract interactions

### 🏗️ Professional Architecture
- **Modular Frontend**: Component-based React architecture
- **Backend API**: Express.js server for enhanced functionality
- **Separated Concerns**: Clean separation of frontend/backend/contracts
- **TypeScript Support**: Full type safety across the stack
- **Modern Development**: Professional project structure

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- Git

### 1. Clone & Setup
```bash
git clone https://github.com/Standinwol/higher-lower-dapp.git
cd higher-lower-dapp
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Smart Contract Configuration - UNIFIED CONTRACT
VITE_CONTRACT_ADDRESS=0x4099E173d8fBC5499Ca6fdD0cBfe93524388B557
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Deployment Configuration
DEPLOYER_PRIVATE_KEY=your_private_key_for_deployment
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Install Dependencies

#### Frontend
```bash
cd frontend-higher-lower
npm install
```

#### Backend (Optional)
```bash
cd ../server
npm install
```

#### Smart Contracts
```bash
# In project root
npm install
```

### 4. Start Development

#### Frontend
```bash
cd frontend-higher-lower
npm run dev
```

#### Backend (Optional)
```bash
cd server
npm run dev
```

#### Smart Contract Development
```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npx hardhat run deploy/deploy.ts --network sepolia
```

## 📁 Professional Project Structure

```
higher-lower-dapp/
├── frontend-higher-lower/              # React Frontend Application
│   ├── src/
│   │   ├── components/                 # React Components
│   │   │   └── HigherLowerGame.tsx    # Main game component
│   │   ├── hooks/                     # Custom React Hooks
│   │   │   └── useWallet.ts           # Wallet connection logic
│   │   ├── config/                    # Configuration
│   │   │   └── index.ts              # App configuration
│   │   ├── abi/                      # Contract ABIs
│   │   │   └── HigherLowerGame.ts    # Contract interface
│   │   ├── utils/                    # Utility functions
│   │   ├── App.tsx                   # Main app component
│   │   └── main.tsx                  # React entry point
│   ├── public/                       # Static assets
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.ts               # Vite configuration
├── server/                           # Express.js Backend API
│   ├── index.js                      # Main server file
│   └── package.json                  # Backend dependencies
├── contracts/                        # Single FHEVM Contract
│   └── FHEVMContract.sol             # Complete FHEVM solution (demo + game)
├── deploy/                          # Deployment Scripts
│   └── deploy-fhevm.cjs              # FHEVM contract deployment
├── test/                           # Smart Contract Tests
│   └── HigherLowerGame.test.ts     # Contract unit tests
├── hardhat.config.ts               # Hardhat configuration
├── package.json                    # Root dependencies
└── README.md                       # This file
```

## 🎮 How to Play

### 1. Connect Wallet
- Click "Connect Wallet" to connect MetaMask
- Ensure you're on Sepolia testnet
- Get testnet ETH from a faucet if needed

### 2. Start Playing
- Set your wager amount (minimum 0.001 ETH)
- Click "Start Game" to begin
- Your starting card will be revealed

### 3. Make Predictions
- Choose "Higher" or "Lower" for the next card
- Correct guesses increase your score and potential winnings
- Wrong guesses end the game immediately

### 4. Cash Out
- Cash out anytime to secure your winnings
- Payouts follow exponential curve: `wager * (1.5^score) * 0.95`
- 5% house edge on all payouts

## 🔧 Development

### Frontend Development
The frontend uses modern React with TypeScript:

```bash
cd frontend-higher-lower
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development
The backend provides API endpoints for enhanced functionality:

```bash
cd server
npm run dev          # Start with nodemon
npm start           # Start production server
npm test            # Run tests
```

### Smart Contract Development
Contract development uses Hardhat framework:

```bash
npx hardhat compile                    # Compile FHEVM contract
npx hardhat test                      # Run tests
npx hardhat run deploy/deploy-fhevm.cjs --network sepolia  # Deploy FHEVM contract
```

## 🔒 Security Features

### Smart Contract Security
- **Reentrancy Protection**: SafeMath and proper state management
- **Access Control**: Owner-only functions for administrative tasks
- **Input Validation**: Comprehensive parameter checking
- **Gas Optimization**: Efficient contract design

### Frontend Security
- **Timeout Handling**: 60-second transaction timeouts
- **Error Recovery**: Graceful error handling and retry mechanisms
- **Input Validation**: Client-side validation for all user inputs
- **Secure Connections**: HTTPS-only in production

## 🌐 Network Configuration

### Sepolia Testnet
- **Contract Address**: `0xf57D3874A276C1bD0cB157f9f14Daee37d7dDFa0`
- **RPC URL**: `https://ethereum-sepolia-rpc.publicnode.com`
- **Chain ID**: `11155111`
- **Explorer**: https://sepolia.etherscan.io

### Development
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **Contract Tests**: Hardhat local network

## 📋 Environment Variables

### Frontend (.env)
```env
VITE_CONTRACT_ADDRESS=0xf57D3874A276C1bD0cB157f9f14Daee37d7dDFa0
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

### Backend (.env)
```env
PORT=4000
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
CONTRACT_ADDRESS=0xf57D3874A276C1bD0cB157f9f14Daee37d7dDFa0
```

### Smart Contract (.env)
```env
DEPLOYER_PRIVATE_KEY=your_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Connect your repository to Vercel or Netlify
2. Set the build directory to `frontend-higher-lower`
3. Configure environment variables
4. Deploy automatically on push

### Backend Deployment (Railway/Render)
1. Deploy the `server/` directory
2. Set environment variables
3. Update frontend API configuration

### Smart Contract Deployment
```bash
# Deploy to Sepolia
npx hardhat run deploy/deploy-sepolia.cjs --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add comprehensive tests for new features
- Update documentation for API changes
- Use semantic commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ethereum Foundation** - For the blockchain infrastructure
- **MetaMask** - For wallet integration
- **Hardhat** - For development framework
- **Vite** - For fast frontend development
- **Sepolia Testnet** - For safe testing environment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Standinwol/higher-lower-dapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Standinwol/higher-lower-dapp/discussions)
- **Author**: [@Standinwol](https://github.com/Standinwol)

---

⚠️ **Disclaimer**: This is a demo application for educational purposes. Always test thoroughly before using real funds. Use at your own risk.

# 🎴 FHEVM Zama Higher/Lower Card Game

A privacy-preserving blockchain card game built with **FHEVM (Fully Homomorphic Encryption Virtual Machine)** by Zama. Experience true confidential gaming where your cards, bets, and strategies remain completely private on-chain.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Standinwol/fhevm-zama-higher-lower-card-game)

## 🚀 Live Demo

🌐 **[Play Now on Vercel](https://fhevm-higher-lower-game.vercel.app)**

## 🔐 Privacy Features

- **🃏 Encrypted Cards**: Card values are encrypted on-chain using FHEVM
- **💰 Private Bets**: Your wager amounts remain confidential
- **📊 Hidden Scores**: Game statistics are encrypted and private
- **🔒 Zero-Knowledge**: Prove game outcomes without revealing private data

## 🛠️ Technology Stack

- **🔐 FHEVM**: Zama's Fully Homomorphic Encryption Virtual Machine
- **⚛️ React 18**: Modern frontend with TypeScript
- **⚡ Vite**: Lightning-fast build tool
- **🎨 Tailwind CSS**: Utility-first styling
- **🦊 MetaMask**: Wallet integration
- **🌐 Sepolia**: Ethereum testnet deployment
- **🚀 Vercel**: Production deployment

## 📋 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Sepolia ETH for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/Standinwol/fhevm-zama-higher-lower-card-game.git
cd fhevm-zama-higher-lower-card-game

# Install dependencies
cd frontend-higher-lower
npm install

# Start development server
npm run dev
```

### Smart Contract

```bash
# Compile contracts
npm run compile

# Deploy to Sepolia
npm run deploy:sepolia
```

## 🎮 How to Play

1. **Connect Wallet**: Connect your MetaMask to Sepolia testnet
2. **Deposit Funds**: Make an encrypted deposit to start playing
3. **Place Bet**: Choose your encrypted wager amount
4. **Make Prediction**: Guess if the next card is higher or lower
5. **Win Rewards**: Earn encrypted rewards for correct predictions

## 🏗️ Architecture

### Smart Contract (`FHEVMContract.sol`)

- **Unified FHEVM Implementation**: Single contract with all privacy features
- **Encrypted State**: All game data stored as encrypted values
- **Zero-Knowledge Proofs**: Validate inputs without revealing values
- **Privacy-Preserving Logic**: Game rules enforced on encrypted data

### Frontend Architecture

- **React Hooks**: Clean state management with custom hooks
- **TypeScript**: Type-safe development
- **FHEVM Integration**: Direct encrypted operations
- **Responsive Design**: Mobile-first approach

## 🔧 Contract Details

**Contract Address**: `0x4099E173d8fBC5499Ca6fdD0cBfe93524388B557`  
**Network**: Sepolia Testnet  
**Framework**: FHEVM by Zama

### Key Features

- ✅ Encrypted deposits and withdrawals
- ✅ Private betting system
- ✅ Confidential card generation
- ✅ Zero-knowledge score tracking
- ✅ Privacy-preserving game logic

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend-higher-lower
vercel
```

### Environment Variables

```env
VITE_CONTRACT_ADDRESS=0x4099E173d8fBC5499Ca6fdD0cBfe93524388B557
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## 📚 FHEVM Integration

This project demonstrates advanced FHEVM features:

- **Encrypted Data Types**: `euint32`, `ebool`, `externalEuint32`
- **FHE Operations**: `FHE.add`, `FHE.sub`, `FHE.mul`, `FHE.fromExternal`
- **Access Control**: `FHE.allow`, `FHE.allowThis`
- **Input Validation**: Zero-knowledge proof verification

## 🧪 Testing

```bash
# Run contract tests
npm run test:contract

# Frontend development
npm run dev

# Production build
npm run build
```

## 📁 Project Structure

```
fhevm-zama-higher-lower-card-game/
├── contracts/
│   └── FHEVMContract.sol      # Unified FHEVM smart contract
├── frontend-higher-lower/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── config/           # Contract configuration
│   ├── vercel.json           # Vercel deployment config
│   └── DEPLOYMENT.md         # Deployment guide
├── scripts/
│   └── deploy.ts             # Contract deployment
└── README.md                 # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Zama](https://zama.ai)** for FHEVM technology
- **[Ethereum](https://ethereum.org)** for the blockchain infrastructure
- **[Vercel](https://vercel.com)** for deployment platform

## 📞 Support

- 📧 **Issues**: [GitHub Issues](https://github.com/Standinwol/fhevm-zama-higher-lower-card-game/issues)
- 📖 **FHEVM Docs**: [Zama Documentation](https://docs.zama.ai/protocol/solidity-guides)
- 🌐 **Vercel Docs**: [Vercel Documentation](https://vercel.com/docs)

---

**Built with ❤️ using FHEVM by Zama**
