import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Play, RefreshCw } from 'lucide-react';

interface Card {
  name: string;
  suit: string;
}

interface GameResult {
  won: boolean;
  streak: number;
  wager: number;
  winnings: number;
  timestamp: number;
}

interface HigherLowerGameProps {
  isConnected: boolean;
  currentBalance: number;
  onStartGame: (wager: number) => Promise<{ gameId: number; startingCard: number } | null>;
  onMakeGuess: (gameId: number, isHigher: boolean) => Promise<{ correct: boolean; newCard: number } | null>;
  onCashOut: (gameId: number) => Promise<boolean>;
  onGameResult?: (result: GameResult) => void;
  onWithdraw?: () => void;
  isLoading: boolean;
  error: string | null;
}

export const HigherLowerGame: React.FC<HigherLowerGameProps> = ({
  isConnected,
  currentBalance,
  onStartGame,
  onMakeGuess,
  onCashOut,
  onGameResult,
  onWithdraw,
  isLoading,
  error
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'playing'>('waiting');
  const [gameId, setGameId] = useState<number | null>(null);
  const [currentCard, setCurrentCard] = useState(7);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wager, setWager] = useState(0.01);
  const [lastGuess, setLastGuess] = useState<'higher' | 'lower' | null>(null);
  const [nextCard, setNextCard] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);

  const cardSuits = ['♠', '♥', '♦', '♣'];
  const cardNames = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const getCardDisplay = (value: number): Card => {
    const suit = cardSuits[Math.floor(Math.random() * 4)];
    const name = cardNames[value - 1];
    return { name, suit };
  };

  const startGame = async () => {
    if (wager > currentBalance) {
      alert('Insufficient balance');
      return;
    }
    
    if (isConnected) {
      try {
        const result = await onStartGame(wager);
        if (result) {
          setGameState('playing');
          setGameId(result.gameId);
          setCurrentCard(result.startingCard);
          setScore(0);
          setStreak(0);
          setShowResult(false);
        }
      } catch (error) {
        console.error('Failed to start blockchain game:', error);
        alert('Failed to start game. Please try again.');
      }
    } else {
      alert('Please connect wallet and deposit ETH to play.');
    }
  };

  const makeGuess = async (isHigher: boolean) => {
    if (gameState !== 'playing' || gameLoading || !gameId) return;
    
    setGameLoading(true);
    setLastGuess(isHigher ? 'higher' : 'lower');
    
    try {
      console.log('Making guess:', isHigher ? 'HIGHER' : 'LOWER');
      const result = await onMakeGuess(gameId, isHigher);
      
      if (result) {
        console.log('Guess result:', result);
        setNextCard(result.newCard);
        setShowResult(true);
        
        if (result.correct) {
          setScore(prev => prev + 1);
          setStreak(prev => prev + 1);
          
          setTimeout(() => {
            setCurrentCard(result.newCard);
            setShowResult(false);
            setNextCard(null);
            setGameLoading(false);
          }, 2000);
        } else {
          // Game lost - record the result
          const gameResult: GameResult = {
            won: false,
            streak: streak,
            wager: wager,
            winnings: 0,
            timestamp: Date.now()
          };
          
          if (onGameResult) {
            onGameResult(gameResult);
          }
          
          setTimeout(() => {
            setGameState('waiting');
            setGameId(null);
            setShowResult(false);
            setNextCard(null);
            setGameLoading(false);
          }, 2000);
        }
      } else {
        // Transaction failed or timed out
        console.log('Guess failed - resetting loading state');
        setGameLoading(false);
        setLastGuess(null);
      }
    } catch (error) {
      console.error('Failed to make blockchain guess:', error);
      setGameLoading(false);
      setLastGuess(null);
    }
  };

  const cashOut = async () => {
    if (!gameId) return;
    
    try {
      const success = await onCashOut(gameId);
      if (success) {
        // Game won by cashing out - record the result
        const totalWinnings = wager + score * wager * 0.8;
        const gameResult: GameResult = {
          won: true,
          streak: streak,
          wager: wager,
          winnings: totalWinnings - wager, // Net winnings (excluding original wager)
          timestamp: Date.now()
        };
        
        if (onGameResult) {
          onGameResult(gameResult);
        }
        
        setGameState('waiting');
        setGameId(null);
        setShowResult(false);
      }
    } catch (error) {
      console.error('Failed to cash out:', error);
    }
  };

  const currentCardDisplay = getCardDisplay(currentCard);
  const nextCardDisplay = nextCard ? getCardDisplay(nextCard) : null;

  return (
    <div className="bg-white/10 p-8 rounded-xl border border-white/20">
      {gameState === 'waiting' ? (
        <div className="text-center">
          <div className="w-32 h-44 mx-auto bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-6">
            <div className="text-4xl">🃏</div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-4">
            Higher or Lower?
          </h2>
          <p className="opacity-70 mb-6">Set your wager and start playing!</p>
          
          <div className="max-w-xs mx-auto">
            <label className="block text-sm mb-2">Wager Amount</label>
            <input
              type="number"
              step="0.001"
              value={wager}
              onChange={(e) => setWager(parseFloat(e.target.value) || 0.01)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-center font-bold w-full mb-4"
            />
            <button
              onClick={startGame}
              disabled={wager > currentBalance || wager <= 0 || isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 px-6 py-3 rounded-xl font-bold disabled:opacity-50 flex items-center justify-center"
            >
              <Play className="w-5 h-5 mr-2" /> Start Game
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Current Card</h2>
          <div className="w-32 h-44 mx-auto bg-white rounded-xl flex flex-col justify-center items-center text-black mb-4">
            <div className={`text-4xl ${currentCardDisplay.suit === '♥' || currentCardDisplay.suit === '♦' ? 'text-red-500' : ''}`}>
              {currentCardDisplay.suit}
            </div>
            <div className={`text-2xl font-bold ${currentCardDisplay.suit === '♥' || currentCardDisplay.suit === '♦' ? 'text-red-500' : ''}`}>
              {currentCardDisplay.name}
            </div>
          </div>

          {!gameLoading && !showResult && (
            <div className="flex justify-center space-x-4 mb-4">
              <button 
                onClick={() => makeGuess(true)} 
                className="bg-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center"
              >
                <ArrowUp className="w-5 h-5 mr-2" /> Higher
              </button>
              <button 
                onClick={() => makeGuess(false)} 
                className="bg-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center"
              >
                <ArrowDown className="w-5 h-5 mr-2" /> Lower
              </button>
            </div>
          )}

          {gameLoading && (
            <div className="flex flex-col items-center py-6">
              <RefreshCw className="w-6 h-6 animate-spin mr-2 mb-2" /> 
              <span className="text-lg font-semibold">Drawing next card...</span>
              <span className="text-sm opacity-70 mt-1">Blockchain transaction in progress</span>
              <span className="text-xs opacity-50 mt-1">This may take 10-60 seconds on testnet</span>
              {error && (
                <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="text-red-300 text-sm font-semibold mb-2">⚠️ Transaction Error</div>
                  <div className="text-red-200 text-xs">{error}</div>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-semibold"
                  >
                    Reload & Try Again
                  </button>
                </div>
              )}
            </div>
          )}

          {showResult && nextCard && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Next Card</h3>
              <div className="w-32 h-44 mx-auto bg-white rounded-xl flex flex-col justify-center items-center text-black mb-4">
                <div className={`text-4xl ${nextCardDisplay?.suit === '♥' || nextCardDisplay?.suit === '♦' ? 'text-red-500' : ''}`}>
                  {nextCardDisplay?.suit}
                </div>
                <div className={`text-2xl font-bold ${nextCardDisplay?.suit === '♥' || nextCardDisplay?.suit === '♦' ? 'text-red-500' : ''}`}>
                  {nextCardDisplay?.name}
                </div>
              </div>
              <div className="mt-4 font-bold text-xl">
                {(lastGuess === 'higher' && nextCard > currentCard) || (lastGuess === 'lower' && nextCard < currentCard)
                  ? <span className="text-green-400">✨ Correct! Continue or cash out</span>
                  : <span className="text-red-400">💔 Wrong! Game Over</span>}
              </div>
            </div>
          )}

          {score > 0 && (
            <div className="mt-4 space-y-2">
              <button
                onClick={cashOut}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 rounded-xl font-bold w-full"
              >
                Cash Out ({(wager + score * wager * 0.8).toFixed(3)} ETH)
              </button>
              
              {/* Show withdraw button after successful cash out */}
              {currentBalance > 0 && onWithdraw && (
                <button
                  onClick={onWithdraw}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 rounded-xl font-bold w-full flex items-center justify-center space-x-2"
                >
                  <span>💰</span>
                  <span>Withdraw to Wallet</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};