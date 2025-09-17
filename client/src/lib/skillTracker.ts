import { getLocalStorage, setLocalStorage } from './utils';

export interface AttemptRecord {
  puzzleType: 'pattern' | 'logic' | 'spatial';
  difficulty: number;
  isCorrect: boolean;
  timeSpent: number;
  answer: any;
  timestamp: number;
}

export interface PlayerStats {
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number;
  difficultyProgression: number[];
  recentPerformance: boolean[];
}

export class SkillTracker {
  private readonly storageKey = 'puzzleGameSkills';
  private playerStats: Map<string, PlayerStats> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  recordAttempt(playerName: string, attempt: AttemptRecord) {
    if (!this.playerStats.has(playerName)) {
      this.playerStats.set(playerName, {
        totalAttempts: 0,
        correctAttempts: 0,
        averageTime: 0,
        difficultyProgression: [],
        recentPerformance: []
      });
    }

    const stats = this.playerStats.get(playerName)!;
    
    // Update stats
    stats.totalAttempts++;
    if (attempt.isCorrect) {
      stats.correctAttempts++;
    }
    
    // Update average time (weighted average)
    const totalTime = stats.averageTime * (stats.totalAttempts - 1) + attempt.timeSpent;
    stats.averageTime = totalTime / stats.totalAttempts;
    
    // Track difficulty progression
    stats.difficultyProgression.push(attempt.difficulty);
    if (stats.difficultyProgression.length > 10) {
      stats.difficultyProgression.shift();
    }
    
    // Track recent performance (last 5 attempts)
    stats.recentPerformance.push(attempt.isCorrect);
    if (stats.recentPerformance.length > 5) {
      stats.recentPerformance.shift();
    }

    this.saveToStorage();
  }

  getPlayerDifficulty(playerName: string): number {
    const stats = this.playerStats.get(playerName);
    
    if (!stats || stats.totalAttempts < 3) {
      return 1; // Start with easy difficulty
    }

    const successRate = stats.correctAttempts / stats.totalAttempts;
    const recentSuccessRate = stats.recentPerformance.filter(Boolean).length / stats.recentPerformance.length;
    
    // Calculate difficulty based on success rate and recent performance
    let difficulty = 1;
    
    if (recentSuccessRate > 0.8) {
      difficulty = Math.min(stats.difficultyProgression[stats.difficultyProgression.length - 1] + 1, 5);
    } else if (recentSuccessRate < 0.4) {
      difficulty = Math.max(stats.difficultyProgression[stats.difficultyProgression.length - 1] - 1, 1);
    } else {
      difficulty = stats.difficultyProgression[stats.difficultyProgression.length - 1] || 1;
    }

    // Factor in overall success rate
    if (successRate > 0.7) {
      difficulty = Math.min(difficulty + 1, 5);
    } else if (successRate < 0.3) {
      difficulty = Math.max(difficulty - 1, 1);
    }

    return Math.max(1, Math.min(5, Math.round(difficulty)));
  }

  getPlayerStats(playerName: string): PlayerStats | null {
    return this.playerStats.get(playerName) || null;
  }

  private loadFromStorage() {
    try {
      const data = getLocalStorage(this.storageKey);
      if (data) {
        this.playerStats = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load skill tracking data:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.playerStats);
      setLocalStorage(this.storageKey, data);
    } catch (error) {
      console.warn('Failed to save skill tracking data:', error);
    }
  }

  // Get difficulty recommendation for a specific puzzle type
  getPuzzleTypeDifficulty(playerName: string, puzzleType: 'pattern' | 'logic' | 'spatial'): number {
    const stats = this.playerStats.get(playerName);
    if (!stats) return 1;

    // This could be extended to track performance per puzzle type
    // For now, use general difficulty
    return this.getPlayerDifficulty(playerName);
  }
}
