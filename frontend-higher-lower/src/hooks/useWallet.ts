import { useState } from 'react';

// Wallet connection hook for MetaMask integration
export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    // Create abort controller for better cancellation
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      console.log('🔌 Starting wallet connection...');
      
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask extension.');
      }

      console.log('📱 MetaMask detected, requesting accounts...');
      
      // Shorter timeout for better UX - 20 seconds
      const timeoutPromise = new Promise<never>((_, reject) => {
        const timeoutId = setTimeout(() => {
          console.log('⏰ Connection timeout reached');
          controller.abort();
          reject(new Error('Connection timeout. Please check MetaMask and try again.'));
        }, 20000);
        
        // Clear timeout if aborted
        controller.signal.addEventListener('abort', () => {
          clearTimeout(timeoutId);
        });
      });
      
      const connectionPromise = (async () => {
        // Check if already aborted
        if (controller.signal.aborted) {
          throw new Error('Connection cancelled');
        }
        
        console.log('📝 Requesting account access...');
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        if (controller.signal.aborted) {
          throw new Error('Connection cancelled');
        }

        if (accounts.length === 0) {
          throw new Error('No accounts found. Please unlock MetaMask.');
        }

        console.log('👛 Account found:', accounts[0]);
        
        // Try to get balance, but don't fail if it times out
        let balanceInEth = '0';
        try {
          console.log('💰 Getting balance...');
          
          if (controller.signal.aborted) {
            throw new Error('Connection cancelled');
          }
          
          // Create provider and get balance with shorter timeout
          const { ethers } = await import('ethers');
          const provider = new ethers.BrowserProvider(window.ethereum);
          
          // Shorter timeout for balance - 10 seconds
          const balancePromise = provider.getBalance(accounts[0]);
          const balanceTimeout = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Balance fetch timeout')), 10000);
          });
          
          const walletBalance = await Promise.race([balancePromise, balanceTimeout]);
          balanceInEth = ethers.formatEther(walletBalance);
          
          console.log('💰 Balance:', balanceInEth, 'ETH');
        } catch (balanceError) {
          console.warn('⚠️ Balance fetch failed, using default:', balanceError);
          // Continue with zero balance - don't fail the connection
        }

        console.log('✅ Wallet connected successfully!');
        console.log('📍 Address:', accounts[0]);
        
        return { address: accounts[0], balance: balanceInEth };
      })();
      
      // Race between connection and timeout
      const result = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (controller.signal.aborted) {
        throw new Error('Connection was cancelled');
      }
      
      setIsConnected(true);
      setAddress(result.address);
      setBalance(result.balance);
      
    } catch (err: any) {
      console.error('❌ Wallet connection error:', err);
      
      // Handle specific error types
      let errorMessage = 'Failed to connect wallet';
      
      if (err.message.includes('timeout') || err.message.includes('cancelled')) {
        errorMessage = 'Connection timeout. Please check MetaMask is unlocked and try again.';
      } else if (err.code === 4001 || err.message.includes('rejected') || err.message.includes('denied')) {
        errorMessage = 'Connection rejected. Please approve the connection in MetaMask.';
      } else if (err.message.includes('MetaMask not installed')) {
        errorMessage = 'MetaMask not installed. Please install the MetaMask browser extension.';
      } else if (err.message.includes('No accounts found')) {
        errorMessage = 'No accounts found. Please unlock MetaMask and create an account.';
      } else if (err.code === -32002) {
        errorMessage = 'MetaMask is busy. Please check MetaMask and try again.';
      } else if (err.message.includes('Network Error') || err.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = err.message || 'Unknown wallet error occurred. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const cancelConnection = () => {
    if (abortController) {
      console.log('🚫 Cancelling wallet connection...');
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      setError('Connection cancelled by user');
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setAddress(null);
    setBalance('0');
    setError(null);
  };

  return {
    isConnected,
    address,
    balance,
    isLoading,
    error,
    connectWallet,
    cancelConnection,
    disconnectWallet,
  };
}

// Global window type
declare global {
  interface Window {
    ethereum?: any;
  }
}