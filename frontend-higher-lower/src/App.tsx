import { useState } from 'react';
import { Wallet, Crown, LogOut, RefreshCw, AlertTriangle } from 'lucide-react';
import { HigherLowerGame } from './components/HigherLowerGame';
import { useWallet } from './hooks/useWallet';
import { useGameContract } from './hooks/useGameContract';
import { useGameStats } from './hooks/useGameStats';

function App() {
  const { isConnected, address, balance: walletBalance, isLoading: walletLoading, error: walletError, connectWallet, cancelConnection, disconnectWallet } = useWallet();
  
  // Real contract integration
  const { contractBalance, isLoading: contractLoading, error: contractError, deposit, startGame: startContractGame, makeGuess: makeContractGuess, cashOut: cashOutContract, loadContractBalance } = useGameContract(isConnected, address);
  
  // Game statistics tracking
  const { stats, recordGameResult, resetStats } = useGameStats(address);
  
  // Safe balance parsing with fallback
  const currentBalance = contractBalance === 'Has Balance' ? 0.001 : (isNaN(parseFloat(contractBalance)) ? 0 : parseFloat(contractBalance));
  
  const handleStartGame = async (wager: number) => {
    return await startContractGame(wager.toString());
  };
  
  const handleMakeGuess = async (gameId: number, isHigher: boolean) => {
    return await makeContractGuess(gameId, isHigher);
  };
  
  const handleCashOut = async () => {
    return await cashOutContract();
  };

  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositError, setDepositError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setDepositError('Please enter a valid deposit amount');
      return;
    }
    
    const amount = parseFloat(depositAmount);
    const walletBal = parseFloat(walletBalance);
    
    if (amount > walletBal) {
      setDepositError('Insufficient wallet balance for this deposit');
      return;
    }
    
    setDepositError(null); // Clear any previous errors
    
    try {
      console.log('🚀 Starting deposit process for', depositAmount, 'ETH');
      console.log('💼 Wallet balance:', walletBalance, 'ETH');
      console.log('🏦 Current contract balance:', currentBalance, 'ETH');
      
      const success = await deposit(depositAmount);
      
      if (success) {
        console.log('✅ Deposit successful, clearing modal');
        setDepositAmount('');
        setShowDepositModal(false);
        setDepositError(null);
        
        // Additional balance refresh with longer delay for blockchain confirmation
        console.log('🔄 Refreshing balance after deposit...');
        setTimeout(async () => {
          if (loadContractBalance) {
            await loadContractBalance();
            console.log('🎉 Balance refreshed after deposit');
          }
        }, 3000); // Increased delay for better blockchain sync
      } else {
        console.error('❌ Deposit failed - check contract error');
        setDepositError('Transaction failed. Please check your wallet and try again.');
      }
    } catch (error) {
      console.error('💥 Handle deposit exception:', error);
      setDepositError(error instanceof Error ? error.message : 'Deposit failed');
    }
  };

  const currentError = contractError || walletError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Higher/Lower DApp
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <>
                <div className="text-right">
                  <div className="text-sm opacity-70">Wallet</div>
                  <div className="text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-70">Contract Balance</div>
                  <div className="font-bold">
                    {contractBalance === 'Has Balance' 
                      ? 'Has Balance' 
                      : `${currentBalance.toFixed(4)} ETH`
                    }
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDepositModal(true);
                    setDepositError(null); // Clear any previous errors when opening modal
                  }}
                  className="bg-gradient-to-r from-green-600 to-blue-600 px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  Deposit
                </button>
                <button
                  onClick={() => loadContractBalance && loadContractBalance()}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 rounded-lg text-sm font-semibold"
                >
                  Refresh
                </button>
                <button onClick={disconnectWallet} className="p-2 hover:bg-white/10 rounded-lg">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-end space-y-2">
                <button
                  onClick={connectWallet}
                  disabled={walletLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 disabled:opacity-50 hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  {walletLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      <span>Connect Wallet</span>
                    </>
                  )}
                </button>
                
                {walletLoading && (
                  <div className="text-xs opacity-70 text-center space-y-2">
                    <div>⏳ Please check MetaMask</div>
                    <div>This may take 10-20 seconds</div>
                    <button
                      onClick={cancelConnection}
                      className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-semibold mt-1"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                
                {walletError && (
                  <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30 max-w-xs">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-300" />
                      <span className="text-red-300 text-sm font-semibold">Connection Failed</span>
                    </div>
                    <div className="text-red-200 text-xs mb-2">{walletError}</div>
                    <button
                      onClick={connectWallet}
                      className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded font-semibold"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Stats */}
          <div className="space-y-6">
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Game Stats</h3>
                <div className="flex space-x-2">
                  {/* Test buttons for development */}
                  {process.env.NODE_ENV === 'development' && stats.gamesPlayed === 0 && (
                    <>
                      <button
                        onClick={() => recordGameResult({
                          won: true,
                          streak: 3,
                          wager: 0.01,
                          winnings: 0.024,
                          timestamp: Date.now()
                        })}
                        className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded font-semibold"
                      >
                        +Win
                      </button>
                      <button
                        onClick={() => recordGameResult({
                          won: false,
                          streak: 2,
                          wager: 0.005,
                          winnings: 0,
                          timestamp: Date.now()
                        })}
                        className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded font-semibold"
                      >
                        +Loss
                      </button>
                    </>
                  )}
                  {stats.gamesPlayed > 0 && (
                    <button
                      onClick={resetStats}
                      className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded font-semibold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Games Played:</span>
                  <span className="font-bold">{stats.gamesPlayed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Games Won:</span>
                  <span className="font-bold text-green-400">{stats.gamesWon}</span>
                </div>
                <div className="flex justify-between">
                  <span>Games Lost:</span>
                  <span className="font-bold text-red-400">{stats.gamesLost}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Winnings:</span>
                  <span className="font-bold text-green-400">{stats.totalWinnings.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Losses:</span>
                  <span className="font-bold text-red-400">{stats.totalLosses.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak:</span>
                  <span className="font-bold text-yellow-400">{stats.bestStreak}</span>
                </div>
                <div className="flex justify-between">
                  <span>Win Rate:</span>
                  <span className="font-bold text-blue-400">
                    {stats.gamesPlayed > 0 ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
              </div>
            </div>

            {!isConnected && (
              <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/30">
                <div className="text-red-300 text-sm font-semibold mb-2">⚠️ Wallet Required</div>
                <div className="text-red-200 text-xs">
                  Connect your wallet and deposit ETH to play
                </div>
              </div>
            )}

            {currentError && isConnected && (
              <div className="bg-red-500/20 p-4 rounded-xl border border-red-500/30">
                <div className="text-red-300 text-sm font-semibold mb-2">⚠️ Error</div>
                <div className="text-red-200 text-xs">{currentError}</div>
              </div>
            )}
          </div>

          {/* Center Panel - Game */}
          <HigherLowerGame
            isConnected={isConnected}
            currentBalance={currentBalance}
            onStartGame={handleStartGame}
            onMakeGuess={handleMakeGuess}
            onCashOut={handleCashOut}
            onGameResult={recordGameResult}
            isLoading={contractLoading}
            error={contractError}
          />

          {/* Right Panel - How to Play */}
          <div className="space-y-6">
            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-4">How to Play</h3>
              <div className="space-y-2 text-sm opacity-80">
                <p>1. Connect your MetaMask wallet</p>
                <p>2. Deposit ETH to your game balance</p>
                <p>3. Set your wager amount</p>
                <p>4. Predict if the next card is higher or lower</p>
                <p>5. Each correct guess increases your score</p>
                <p>6. Cash out anytime to claim winnings</p>
                <p>7. Wrong guess ends the game</p>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-xl border border-white/20">
              <h3 className="text-xl font-bold mb-4">🏆 Leaderboard</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>0x1a2b...3c4d</span>
                  <span className="font-bold">Score: 15</span>
                </div>
                <div className="flex justify-between">
                  <span>0x5e6f...7g8h</span>
                  <span className="font-bold">Score: 12</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                  <span className="font-semibold">
                    {isConnected && address 
                      ? `${address.slice(0, 6)}...${address.slice(-4)}` 
                      : 'You'
                    }
                  </span>
                  <span className="font-bold text-yellow-400">
                    Best: {stats.bestStreak} | W/L: {stats.gamesWon}/{stats.gamesLost}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDepositModal(false)}>
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-xl border border-white/20 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">💰 Deposit to Contract</h3>
            <p className="text-sm opacity-70 mb-4">
              Deposit ETH to your contract balance to play with real blockchain transactions.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Amount (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => {
                    setDepositAmount(e.target.value);
                    setDepositError(null); // Clear error when user types
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2"
                  placeholder="0.1"
                  disabled={contractLoading}
                />
              </div>
              
              <div className="text-xs opacity-70">
                <div>Wallet Balance: {parseFloat(walletBalance).toFixed(4)} ETH</div>
                <div>Contract Balance: {
                  contractBalance === 'Has Balance' 
                    ? 'Has Balance' 
                    : `${currentBalance.toFixed(4)} ETH`
                }</div>
              </div>
              
              {/* Error Display */}
              {depositError && (
                <div className="bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-300" />
                    <span className="text-red-300 text-sm font-semibold">Deposit Error</span>
                  </div>
                  <div className="text-red-200 text-xs">{depositError}</div>
                </div>
              )}
              
              {/* Loading State with Time Estimate */}
              {contractLoading && (
                <div className="bg-blue-500/20 p-3 rounded-lg border border-blue-500/30">
                  <div className="flex items-center space-x-2 mb-1">
                    <RefreshCw className="w-4 h-4 text-blue-300 animate-spin" />
                    <span className="text-blue-300 text-sm font-semibold">Processing Deposit</span>
                  </div>
                  <div className="text-blue-200 text-xs">
                    <div>⏳ Please confirm transaction in MetaMask</div>
                    <div>Expected time: 10-60 seconds</div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || contractLoading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 hover:from-green-700 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
                >
                  {contractLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Deposit'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositError(null);
                    setDepositAmount('');
                  }}
                  disabled={contractLoading}
                  className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;