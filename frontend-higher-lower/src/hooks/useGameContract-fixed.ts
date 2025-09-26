import { useState, useEffect } from 'react';
import { config } from '../config';
import { CONFIDENTIAL_HIGHER_LOWER_GAME_ABI } from '../abi/HigherLowerGame';
import { SIMPLE_HIGHER_LOWER_GAME_ABI } from '../abi/SimpleHigherLowerGame';

// Smart contract hook with intelligent ABI detection and fallback handling
export function useGameContract(isConnected: boolean, address: string | null) {
  const [contract, setContract] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contractType, setContractType] = useState<'FHEVM' | 'REGULAR' | null>(null);

  // Initialize contract when wallet is connected
  useEffect(() => {
    const initContract = async () => {
      if (!isConnected || !address || !window.ethereum || !config.contractAddress) {
        setContract(null);
        setContractType(null);
        return;
      }

      try {
        const { ethers } = await import('ethers');
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        
        // Try FHEVM ABI first, fall back to regular ABI
        let gameContract;
        let detectedType: 'FHEVM' | 'REGULAR' = 'REGULAR';
        
        try {
          // Try FHEVM ABI first
          gameContract = new ethers.Contract(config.contractAddress, CONFIDENTIAL_HIGHER_LOWER_GAME_ABI, signer);
          // Test if FHEVM functions exist by calling a simple function
          await gameContract.hasBalanceDeposited.staticCall(address);
          detectedType = 'FHEVM';
          console.log('✅ Using FHEVM contract ABI');
        } catch (fhevmError: any) {
          console.log('⚠️  FHEVM ABI failed, trying regular ABI:', fhevmError.message);
          // Fall back to regular ABI
          try {
            gameContract = new ethers.Contract(config.contractAddress, SIMPLE_HIGHER_LOWER_GAME_ABI, signer);
            // Test if regular functions exist
            await gameContract.getBalance.staticCall(address);
            detectedType = 'REGULAR';
            console.log('✅ Using regular contract ABI');
          } catch (regularError: any) {
            console.error('❌ Both FHEVM and regular ABI failed:', regularError);
            throw new Error('Contract ABI mismatch - neither FHEVM nor regular ABI works');
          }
        }
        
        setContract(gameContract);
        setContractType(detectedType);
        setError(null);
        
        // Load contract balance
        await loadContractBalance(gameContract, address, detectedType);
        
        console.log('Contract initialized:', config.contractAddress, `(${detectedType})`);
      } catch (err) {
        console.error('Contract initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize contract');
      }
    };

    initContract();
  }, [isConnected, address]);

  const loadContractBalance = async (
    contractInstance: any = contract, 
    playerAddress: string = address || '', 
    type: 'FHEVM' | 'REGULAR' = contractType || 'REGULAR'
  ) => {
    if (!contractInstance || !playerAddress) return;
    
    try {
      console.log('🔍 Loading balance for address:', playerAddress);
      console.log('🏠 Contract address:', config.contractAddress);
      console.log('🔧 Contract type:', type);
      
      if (type === 'FHEVM') {
        // Check if player has balance using FHEVM contract
        const hasBalance = await contractInstance.hasBalanceDeposited(playerAddress);
        console.log('📊 Has balance deposited:', hasBalance);
        
        if (hasBalance) {
          // For FHEVM, we can't directly read encrypted balance
          setContractBalance('Has Balance');
        } else {
          setContractBalance('0');
        }
      } else {
        // Use regular getBalance for non-FHEVM contracts
        const balance = await contractInstance.getBalance(playerAddress);
        const { ethers } = await import('ethers');
        const balanceStr = ethers.formatEther(balance);
        console.log('💰 Regular balance:', balanceStr, 'ETH');
        setContractBalance(balanceStr);
      }
    } catch (err) {
      console.error('❌ Error loading contract balance:', err);
      setContractBalance('0');
    }
  };

  const deposit = async (amount: string): Promise<boolean> => {
    if (!contract || !address || !contractType) {
      console.error('❌ Deposit precondition failed:', { 
        hasContract: !!contract, 
        hasAddress: !!address, 
        contractType 
      });
      setError('Contract not initialized or wallet not connected');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting deposit of', amount, 'ETH');
      console.log('💼 From address:', address);
      console.log('🏦 To contract:', config.contractAddress);
      console.log('🔧 Contract type:', contractType);
      
      const { ethers } = await import('ethers');
      const amountWei = ethers.parseEther(amount);
      
      let estimatedGas;
      
      if (contractType === 'FHEVM') {
        console.log('🔐 Preparing FHEVM deposit...');
        // For FHEVM contract
        const encryptedAmount = ethers.zeroPadValue(ethers.toBeHex(amountWei), 32);
        const inputProof = '0x';
        
        try {
          estimatedGas = await contract.deposit.estimateGas(encryptedAmount, inputProof, { value: amountWei });
          console.log('✅ FHEVM deposit gas estimation successful');
        } catch (gasError: any) {
          throw new Error(`FHEVM gas estimation failed: ${gasError.message}`);
        }
      } else {
        console.log('💰 Preparing regular deposit...');
        // For regular contract
        try {
          estimatedGas = await contract.deposit.estimateGas({ value: amountWei });
          console.log('✅ Regular deposit gas estimation successful');
        } catch (gasError: any) {
          throw new Error(`Regular deposit gas estimation failed: ${gasError.message}`);
        }
      }
      
      // Add timeout for deposit transaction (60 seconds as per memory specification)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Deposit timeout after 60 seconds. Please check MetaMask.')), 60000);
      });
      
      const depositPromise = (async () => {
        console.log('📋 Calling contract.deposit()...');
        
        let tx;
        if (contractType === 'FHEVM') {
          // Use FHEVM deposit
          const encryptedAmount = ethers.zeroPadValue(ethers.toBeHex(amountWei), 32);
          const inputProof = '0x';
          tx = await contract.deposit(encryptedAmount, inputProof, { 
            value: amountWei,
            gasLimit: estimatedGas + BigInt(100000), // Buffer for FHEVM operations
            gasPrice: ethers.parseUnits('20', 'gwei') // Faster processing per memory spec
          });
        } else {
          // Use regular deposit
          tx = await contract.deposit({ 
            value: amountWei,
            gasLimit: estimatedGas + BigInt(50000), // Standard buffer
            gasPrice: ethers.parseUnits('20', 'gwei') // Faster processing per memory spec
          });
        }
        
        console.log('📦 Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation (10-60 seconds)...');
        
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
        contractType
      });
      
      // Enhanced error handling based on memory specifications
      let errorMessage = 'Deposit failed';
      
      if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction + gas fees';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Transaction timeout (60s). Please check MetaMask and network status.';
      } else if (err.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Transaction may fail. Please check contract state and try again.';
      } else if (err.message.includes('no matching fragment')) {
        errorMessage = `Contract function mismatch. Detected ${contractType} contract but function signature doesn't match.`;
      } else if (err.message.includes('Gas estimation failed') || err.message.includes('gas estimation failed')) {
        errorMessage = `Gas estimation failed: ${err.message}`;
      } else {
        const details = err.reason || err.message || 'Unknown error occurred';
        errorMessage = `Deposit failed: ${details}`;
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified startGame and other functions for now - focusing on deposit fix
  const startGame = async (): Promise<any> => {
    setError('Game functions not yet updated for dynamic contract detection');
    return null;
  };

  const makeGuess = async (): Promise<any> => {
    setError('Game functions not yet updated for dynamic contract detection');
    return null;
  };

  const cashOut = async (): Promise<boolean> => {
    setError('Game functions not yet updated for dynamic contract detection');
    return false;
  };

  return {
    contract,
    contractBalance,
    contractType,
    isLoading,
    error,
    deposit,
    startGame,
    makeGuess,
    cashOut,
    loadContractBalance,
  };
}