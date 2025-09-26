import { useState, useEffect } from 'react';
import { config } from '../config';
import { CONFIDENTIAL_HIGHER_LOWER_GAME_ABI } from '../abi/HigherLowerGame';

// Smart contract hook with intelligent ABI detection
export function useGameContract(isConnected: boolean, address: string | null) {
  const [contract, setContract] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize contract when wallet is connected
  useEffect(() => {
    const initContract = async () => {
      console.log('🔧 Initializing contract...', { isConnected, address, contractAddress: config.contractAddress });
      
      if (!isConnected || !address || !window.ethereum || !config.contractAddress) {
        console.log('⏸️ Initialization skipped - wallet not connected:', {
          isConnected,
          hasAddress: !!address,
          hasEthereum: !!window.ethereum,
          hasContractAddress: !!config.contractAddress
        });
        setContract(null);
        setError(null); // Don't show error when wallet is simply not connected
        return;
      }

      try {
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Simple FHEVM contract initialization
        const gameContract = new ethers.Contract(config.contractAddress, CONFIDENTIAL_HIGHER_LOWER_GAME_ABI, signer);
        
        console.log('✅ FHEVM contract initialized at:', config.contractAddress);
        
        setContract(gameContract);
        setError(null);
        
      // Load contract balance with better error handling
      await loadContractBalance();
        
      } catch (err) {
        console.error('Contract initialization error:', err);
        setError('Failed to connect to contract');
      }
    };

    initContract();
  }, [isConnected, address]);

  const loadContractBalance = async (contractInstance: any = contract, playerAddress: string = address || '') => {
    if (!contractInstance || !playerAddress) return;
    
    try {
      console.log('🔍 Loading balance for address:', playerAddress);
      console.log('🏠 Contract address:', config.contractAddress);
      
      // Try to get simple balance first (for testing)
      try {
        const { ethers } = await import('ethers');
        const simpleBalance = await contractInstance.getSimpleBalance();
        console.log('💰 Simple balance:', simpleBalance.toString());
        if (simpleBalance > 0) {
          const balanceInEth = parseFloat(ethers.formatEther(simpleBalance));
          setContractBalance(balanceInEth.toString()); // Store as string to avoid NaN issues
          return;
        } else {
          // If simple balance is 0, set it to "0" explicitly
          setContractBalance('0');
          return;
        }
      } catch (simpleError: any) {
        console.log('⚠️  Simple balance failed, trying FHEVM balance:', simpleError.message);
      }
      
      // Check if player has balance using FHEVM contract (no address parameter needed)
      const hasBalance = await contractInstance.hasBalanceDeposited();
      console.log('📊 Has balance deposited:', hasBalance);
      
      if (hasBalance) {
        // For FHEVM, we can't directly read encrypted balance
        // We'll show a generic "Has Balance" status
        setContractBalance('Has Balance');
      } else {
        setContractBalance('0');
      }
    } catch (err) {
      console.error('❌ Error loading contract balance:', err);
      setContractBalance('0');
    }
  };

  const deposit = async (amount: string): Promise<boolean> => {
    if (!contract || !address) {
      console.error('❌ Deposit precondition failed:', { hasContract: !!contract, hasAddress: !!address });
      const errorMsg = !address ? 'Please connect your wallet first' : 'Contract not initialized - please refresh and try again';
      setError(errorMsg);
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting deposit of', amount, 'ETH');
      console.log('💼 From address:', address);
      console.log('🏦 To contract:', config.contractAddress);
      
      const { ethers } = await import('ethers');
      
      console.log('🚀 Preparing FHEVM-only deposit...');
      
      // Convert amount to wei for encryption
      const amountWei = ethers.parseEther(amount);
      
      // For FHEVM contract on Sepolia, we need to create proper encrypted input
      // Since real FHEVM encryption isn't available on Sepolia, we'll use placeholder values
      console.log('🔐 Creating FHEVM parameters...');
      
      // Create encrypted amount as bytes32 (32-byte representation of the amount)
      const encryptedAmount = ethers.zeroPadValue(ethers.toBeHex(amountWei), 32);
      const inputProof = '0x'; // Empty proof for Sepolia testing
      
      console.log('📊 Amount in wei:', amountWei.toString());
      console.log('🔒 Encrypted amount:', encryptedAmount);
      
      // Estimate gas - try FHEVM first, fallback to simple deposit
      let estimatedGas;
      let useSimpleDeposit = false;
      
      try {
        // Try FHEVM deposit first
        estimatedGas = await contract.deposit.estimateGas(encryptedAmount, inputProof, { value: amountWei });
        console.log('✅ FHEVM gas estimation successful:', estimatedGas.toString());
      } catch (fhevmError: any) {
        console.log('⚠️  FHEVM failed, trying simple deposit:', fhevmError.message);
        try {
          // Fallback to simple deposit
          estimatedGas = await contract.simpleDeposit.estimateGas({ value: amountWei });
          useSimpleDeposit = true;
          console.log('✅ Simple deposit estimation successful:', estimatedGas.toString());
        } catch (simpleError: any) {
          console.error('❌ Both deposits failed:', simpleError);
          throw new Error(`Gas estimation failed: ${simpleError.message || simpleError}`);
        }
      }
      
      // Add timeout for deposit transaction
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Deposit timeout after 60 seconds. Please check MetaMask.')), 60000);
      });
      
      const depositPromise = (async () => {
        console.log('📋 Calling contract deposit...', useSimpleDeposit ? '(Simple)' : '(FHEVM)');
        
        let tx;
        if (useSimpleDeposit) {
          // Use simple deposit fallback
          tx = await contract.simpleDeposit({ 
            value: amountWei,
            gasLimit: estimatedGas + BigInt(50000),
            gasPrice: ethers.parseUnits('20', 'gwei')
          });
        } else {
          // Use FHEVM deposit
          tx = await contract.deposit(encryptedAmount, inputProof, { 
            value: amountWei,
            gasLimit: estimatedGas + BigInt(100000),
            gasPrice: ethers.parseUnits('20', 'gwei')
          });
        }
        
        console.log('📦 Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('🎉 Gas used:', receipt.gasUsed.toString());
        console.log('💰 Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
        
        if (receipt.status !== 1) {
          throw new Error('Transaction failed on blockchain');
        }
        
        return receipt;
      })();
      
      // Race between deposit and timeout
      await Promise.race([depositPromise, timeoutPromise]);
      
      // Force refresh balance after successful deposit
      console.log('🔄 Refreshing balance after successful deposit...');
      await loadContractBalance();
      
      console.log('✅ Deposit completed successfully!');
      return true;
      
    } catch (err: any) {
      console.error('❌ Deposit error details:', {
        message: err.message,
        code: err.code,
        reason: err.reason,
        data: err.data,
        transaction: err.transaction,
        receipt: err.receipt,
        error: err
      });
      
      // Enhanced error handling
      let errorMessage = 'Deposit failed';
      
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction + gas fees';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Transaction timeout. Please check MetaMask and network status.';
      } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Transaction may fail. Please check contract state and try again.';
      } else if (err.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message.includes('Gas estimation failed')) {
        errorMessage = err.message; // Use the detailed gas estimation error
      } else if (err.message.includes('Address mismatch')) {
        errorMessage = 'Wallet address mismatch. Please refresh and reconnect your wallet.';
      } else {
        // Include more details in the error message
        const details = err.reason || err.message || 'Unknown error occurred';
        errorMessage = `Deposit failed: ${details}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const startGame = async (wager: string): Promise<{ gameId: number; startingCard: number } | null> => {
    if (!contract) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { ethers } = await import('ethers');
      const wagerWei = ethers.parseEther(wager);
      
      console.log('Starting simple game with wager:', wagerWei.toString());
      
      // Use simple start game function that works without FHEVM
      const tx = await contract.simpleStartGame(wagerWei, {
        gasLimit: 500000,
        gasPrice: ethers.parseUnits('20', 'gwei')
      });
      
      const receipt = await tx.wait();
      
      // Find GameStarted event
      const gameStartedEvent = receipt.logs.find((log: any) => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded?.name === 'GameStarted';
        } catch {
          return false;
        }
      });
      
      if (gameStartedEvent) {
        const decoded = contract.interface.parseLog(gameStartedEvent);
        const startingCard = Number(decoded.args.startingCard || decoded.args[1]);
        
        await loadContractBalance();
        return { gameId: 1, startingCard }; // Use dummy gameId for simple version
      }
      
      return null;
    } catch (err) {
      console.error('Start game error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const makeGuess = async (gameId: number, isHigher: boolean): Promise<{ correct: boolean; newCard: number } | null> => {
    if (!contract) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Making simple guess:', { gameId, isHigher });
      
      // Set a timeout for the transaction
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout after 60 seconds')), 60000);
      });
      
      const transactionPromise = (async () => {
        const { ethers } = await import('ethers');
        const tx = await contract.simpleMakeGuess(isHigher, {
          gasLimit: 500000,
          gasPrice: ethers.parseUnits('20', 'gwei')
        });
        console.log('Transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('Transaction confirmed:', receipt);
        
        // Find GameResult event
        const gameResultEvent = receipt.logs.find((log: any) => {
          try {
            const decoded = contract.interface.parseLog(log);
            return decoded?.name === 'GameResult';
          } catch {
            return false;
          }
        });
        
        if (gameResultEvent) {
          const decoded = contract.interface.parseLog(gameResultEvent);
          const correct = decoded.args.won;
          const newCard = Number(decoded.args.newCard);
          
          if (!correct) {
            await loadContractBalance();
          }
          
          return { correct, newCard };
        }
        
        return null;
      })();
      
      // Race between transaction and timeout
      const result = await Promise.race([transactionPromise, timeoutPromise]);
      return result;
      
    } catch (err: any) {
      console.error('Make guess error:', err);
      
      // Handle specific error types
      if (err.message.includes('timeout')) {
        setError('Transaction timeout - the network might be slow. Please try again.');
      } else if (err.code === 'ACTION_REJECTED') {
        setError('Transaction rejected by user');
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient funds for gas fees');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to make guess');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const cashOut = async (): Promise<boolean> => {
    if (!contract) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { ethers } = await import('ethers');
      const tx = await contract.simpleCashOut({
        gasLimit: 500000,
        gasPrice: ethers.parseUnits('20', 'gwei')
      });
      await tx.wait();
      
      await loadContractBalance();
      return true;
    } catch (err) {
      console.error('Cash out error:', err);
      setError(err instanceof Error ? err.message : 'Failed to cash out');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    contract,
    contractBalance,
    isLoading,
    error,
    deposit,
    startGame,
    makeGuess,
    cashOut,
    loadContractBalance,
  };
}