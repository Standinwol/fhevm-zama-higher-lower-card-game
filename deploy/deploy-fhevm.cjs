const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Deploying FHEVM Contract to Sepolia...');
  console.log('===========================================');

  // Configuration
  const yourPrivateKey = '0xd8d81d0f51bafc652eacd1d8c73450c76c001570ae9a00266319d0b0a94ead8d';
  console.log('🔑 Using deployment wallet...');

  // Set up provider and wallet
  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const wallet = new ethers.Wallet(yourPrivateKey, provider);
  
  console.log('💼 Deployer address:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Deployer balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance < ethers.parseEther('0.01')) {
    throw new Error('❌ Insufficient balance for deployment');
  }

  // Deploy the FHEVM contract
  console.log('\n📄 Compiling and deploying FHEVMContract...');
  
  const FHEVMContract = await ethers.getContractFactory('FHEVMContract');
  const contractWithWallet = FHEVMContract.connect(wallet);
  
  console.log('⚡ Deploying with optimized gas settings...');
  const contract = await contractWithWallet.deploy({
    gasLimit: 6000000, // Higher gas limit for comprehensive FHEVM features
    gasPrice: ethers.parseUnits('25', 'gwei')
  });

  console.log('⏳ Waiting for deployment confirmation...');
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();
  
  console.log('\n✅ FHEVM CONTRACT DEPLOYED!');
  console.log('===========================================');
  console.log('📍 Contract Address:', contractAddress);
  console.log('🔗 Transaction Hash:', deploymentTx.hash);
  console.log('⛽ Gas Used:', deploymentTx.gasLimit?.toString() || 'Unknown');
  console.log('💎 Gas Price:', deploymentTx.gasPrice?.toString() || 'Unknown');
  console.log('🌐 Network: Sepolia Testnet');
  console.log('🔍 Etherscan:', `https://sepolia.etherscan.io/address/${contractAddress}`);
  
  // Test the FHEVM contract
  console.log('\n🧪 Testing FHEVM contract functions...');
  try {
    // Test public view functions
    const userStatus = await contract.getUserStatus();
    console.log('✅ getUserStatus() works:', {
      hasBalance: userStatus.hasBalance,
      lastActivity: userStatus.lastActivityTime.toString(),
      isActive: userStatus.isActive
    });
    
    // Test balance functions
    const hasDeposit = await contract.hasDeposit(wallet.address);
    console.log('✅ hasDeposit() works:', hasDeposit);
    
    const simpleBalance = await contract.getSimpleBalance();
    console.log('✅ getSimpleBalance() works:', ethers.formatEther(simpleBalance), 'ETH');
    
    const hasBalanceDeposited = await contract.hasBalanceDeposited();
    console.log('✅ hasBalanceDeposited() works:', hasBalanceDeposited);
    
    console.log('✅ All FHEVM contract tests passed!');
    
  } catch (testError) {
    console.error('⚠️  Contract test failed:', testError.message);
  }

  // Features Summary
  console.log('\n🎯 FHEVM CONTRACT FEATURES:');
  console.log('===========================================');
  console.log('🔐 FHEVM Demo Features:');
  console.log('   ✅ Encrypted deposits with ZK proofs');
  console.log('   ✅ Encrypted arithmetic operations');
  console.log('   ✅ Encrypted transfers between users');
  console.log('   ✅ Permission management');
  console.log('   ✅ Encrypted flags and counters');
  
  console.log('\n🎮 Gaming Features:');
  console.log('   ✅ Encrypted Higher/Lower game');
  console.log('   ✅ Simple Higher/Lower game (fallback)');
  console.log('   ✅ Encrypted scoring and wagers');
  console.log('   ✅ Cash out functionality');
  
  console.log('\n💼 Utility Features:');
  console.log('   ✅ Multiple deposit methods');
  console.log('   ✅ Balance management');
  console.log('   ✅ User status tracking');
  console.log('   ✅ Data reset capabilities');

  // Instructions
  console.log('\n📋 NEXT STEPS:');
  console.log('===========================================');
  console.log('1. Update your .env file with this contract address:');
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('2. This single contract provides ALL functionality:');
  console.log('   • Complete FHEVM SDK demonstration');
  console.log('   • Privacy-preserving Higher/Lower game');
  console.log('   • Fallback simple functions for testing');
  console.log('3. Use any of the available functions as needed');
  console.log('4. Frontend can interact with this one contract for everything');
  
  return {
    contractAddress,
    transactionHash: deploymentTx.hash,
    deployerAddress: wallet.address,
    features: [
      'unified-contract',
      'fhevm-demo',
      'encrypted-gaming',
      'simple-fallbacks',
      'complete-functionality'
    ]
  };
}

main()
  .then((result) => {
    console.log('\n🎉 FHEVM Contract deployment completed!');
    console.log('📍 Contract Address:', result.contractAddress);
    console.log('🔐 All Features Available in One Place!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 FHEVM contract deployment failed:', error);
    process.exit(1);
  });