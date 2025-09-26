# 🚀 FHEVM Higher/Lower Game - Vercel Deployment

## 🎯 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Standinwol/higher-lower-dapp)

## 📋 Deployment Steps

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**:
   ```bash
   cd frontend-higher-lower
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project? `N`
   - What's your project's name? `fhevm-higher-lower-game`
   - In which directory is your code located? `./`
   - Want to override the settings? `N`

### Method 2: GitHub Integration

1. **Push your code to GitHub**
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend-higher-lower` directory as root
   - Deploy!

## ⚙️ Environment Variables

Your contract is already configured in `vercel.json`, but you can also set these in Vercel dashboard:

```
VITE_CONTRACT_ADDRESS=0x4099E173d8fBC5499Ca6fdD0cBfe93524388B557
VITE_CHAIN_ID=11155111
VITE_NETWORK_NAME=sepolia
VITE_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
```

## 🔗 Live Demo

Once deployed, your FHEVM Higher/Lower game will be live at:
`https://your-project-name.vercel.app`

## 🎮 Features

- ✅ Complete FHEVM integration
- ✅ Privacy-preserving gameplay
- ✅ Sepolia testnet ready
- ✅ MetaMask integration
- ✅ Single contract architecture
- ✅ Production optimized

## 📱 Mobile Responsive

The dApp is fully responsive and works on:
- 💻 Desktop browsers
- 📱 Mobile browsers
- 🦊 MetaMask mobile app

---

**Contract**: FHEVMContract (`0x4099E173d8fBC5499Ca6fdD0cBfe93524388B557`)  
**Network**: Sepolia Testnet  
**Framework**: React + Vite + TypeScript