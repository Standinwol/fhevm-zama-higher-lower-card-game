import { useState, useEffect } from 'react';

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  totalWinnings: number;
  totalLosses: number;
  bestStreak: number;
  currentStreak: number;
  averageWager: number;
}

interface GameResult {
  won: boolean;
  streak: number;
  wager: number;
  winnings: number;
  timestamp: number;
}

export function useGameStats(address: string | null) {
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalWinnings: 0,
    totalLosses: 0,
    bestStreak: 0,
    currentStreak: 0,
    averageWager: 0,
  });

  // Load stats from localStorage when wallet connects
  useEffect(() => {
    if (address) {
      loadStats(address);
    } else {
      // Reset stats when wallet disconnects
      setStats({
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalWinnings: 0,
        totalLosses: 0,
        bestStreak: 0,
        currentStreak: 0,
        averageWager: 0,
      });
    }
  }, [address]);

  const loadStats = (walletAddress: string) => {
    try {
      const storedStats = localStorage.getItem(`gameStats_${walletAddress}`);
      if (storedStats) {
        const parsedStats = JSON.parse(storedStats);
        setStats(parsedStats);
        console.log('📊 Loaded game stats for', walletAddress, parsedStats);
      } else {
        console.log('📊 No previous stats found for', walletAddress);
      }
    } catch (error) {
      console.error('❌ Error loading game stats:', error);
    }
  };

  const saveStats = (newStats: GameStats, walletAddress: string) => {
    try {
      localStorage.setItem(`gameStats_${walletAddress}`, JSON.stringify(newStats));
      console.log('💾 Saved game stats for', walletAddress, newStats);
    } catch (error) {
      console.error('❌ Error saving game stats:', error);
    }
  };

  const recordGameResult = (result: GameResult) => {
    if (!address) return;

    const newStats: GameStats = {
      gamesPlayed: stats.gamesPlayed + 1,
      gamesWon: result.won ? stats.gamesWon + 1 : stats.gamesWon,
      gamesLost: result.won ? stats.gamesLost : stats.gamesLost + 1,
      totalWinnings: result.won ? stats.totalWinnings + result.winnings : stats.totalWinnings,
      totalLosses: result.won ? stats.totalLosses : stats.totalLosses + result.wager,
      bestStreak: Math.max(stats.bestStreak, result.streak),
      currentStreak: result.won ? result.streak : 0,
      averageWager: (stats.averageWager * stats.gamesPlayed + result.wager) / (stats.gamesPlayed + 1),
    };

    setStats(newStats);
    saveStats(newStats, address);

    console.log('🎮 Game result recorded:', {
      result,
      newStats,
      address: address.slice(0, 6) + '...' + address.slice(-4)
    });
  };

  const resetStats = () => {
    if (!address) return;
    
    const emptyStats: GameStats = {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      totalWinnings: 0,
      totalLosses: 0,
      bestStreak: 0,
      currentStreak: 0,
      averageWager: 0,
    };

    setStats(emptyStats);
    saveStats(emptyStats, address);
    console.log('🔄 Game stats reset for', address);
  };

  return {
    stats,
    recordGameResult,
    resetStats,
  };
}