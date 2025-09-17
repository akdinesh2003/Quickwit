import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { generatePuzzle } from '@/lib/puzzleGenerator';
import { SkillTracker } from '@/lib/skillTracker';

export interface Player {
  name: string;
  score: number;
  puzzlesSolved: number;
  averageTime: number;
  difficulty: number;
}

export interface Puzzle {
  type: 'pattern' | 'logic' | 'spatial';
  difficulty: number;
  solution: any;
  timeLimit: number;
  [key: string]: any;
}

interface PuzzleGameState {
  gamePhase: 'setup' | 'playing' | 'gameOver';
  players: Player[];
  currentPlayer: number;
  currentPuzzle: Puzzle | null;
  timeLeft: number;
  puzzlesCompleted: number;
  totalPuzzles: number;
  skillTracker: SkillTracker;
  
  // Actions
  initializeGame: () => void;
  startGame: (playerNames: string[]) => void;
  nextPuzzle: () => void;
  submitAnswer: (answer: any, isCorrect: boolean) => void;
  nextTurn: () => void;
  restartGame: () => void;
  goToSetup: () => void;
}

export const usePuzzleGame = create<PuzzleGameState>()(
  subscribeWithSelector((set, get) => ({
    gamePhase: 'setup',
    players: [],
    currentPlayer: 0,
    currentPuzzle: null,
    timeLeft: 120, // 2 minutes per session
    puzzlesCompleted: 0,
    totalPuzzles: 10,
    skillTracker: new SkillTracker(),

    initializeGame: () => {
      const skillTracker = new SkillTracker();
      set({ skillTracker });
    },

    startGame: (playerNames: string[]) => {
      const { skillTracker } = get();
      const players = playerNames.map(name => ({
        name,
        score: 0,
        puzzlesSolved: 0,
        averageTime: 0,
        difficulty: skillTracker.getPlayerDifficulty(name)
      }));

      set({
        gamePhase: 'playing',
        players,
        currentPlayer: 0,
        puzzlesCompleted: 0,
        timeLeft: 120
      });

      get().nextPuzzle();
      
      // Start countdown timer
      const timer = setInterval(() => {
        const state = get();
        if (state.timeLeft <= 1) {
          clearInterval(timer);
          set({ gamePhase: 'gameOver' });
        } else {
          set({ timeLeft: state.timeLeft - 1 });
        }
      }, 1000);
    },

    nextPuzzle: () => {
      const { players, currentPlayer, skillTracker } = get();
      const player = players[currentPlayer];
      
      const puzzle = generatePuzzle(
        ['pattern', 'logic', 'spatial'][Math.floor(Math.random() * 3)] as any,
        player.difficulty
      );

      set({ currentPuzzle: puzzle });
    },

    submitAnswer: (answer: any, isCorrect: boolean) => {
      const { 
        players, 
        currentPlayer, 
        currentPuzzle, 
        puzzlesCompleted, 
        totalPuzzles,
        skillTracker 
      } = get();
      
      if (!currentPuzzle) return;

      const player = players[currentPlayer];
      const timeSpent = currentPuzzle.timeLimit - 10; // Simplified time calculation
      
      // Update skill tracking
      skillTracker.recordAttempt(player.name, {
        puzzleType: currentPuzzle.type,
        difficulty: currentPuzzle.difficulty,
        isCorrect,
        timeSpent,
        answer,
        timestamp: Date.now()
      });

      // Update player stats
      const updatedPlayers = [...players];
      if (isCorrect) {
        updatedPlayers[currentPlayer].score += currentPuzzle.difficulty * 10;
        updatedPlayers[currentPlayer].puzzlesSolved += 1;
      }
      
      // Update difficulty for next puzzle
      updatedPlayers[currentPlayer].difficulty = skillTracker.getPlayerDifficulty(player.name);

      const newPuzzlesCompleted = puzzlesCompleted + 1;
      
      set({ 
        players: updatedPlayers,
        puzzlesCompleted: newPuzzlesCompleted
      });

      if (newPuzzlesCompleted >= totalPuzzles) {
        set({ gamePhase: 'gameOver' });
      } else {
        setTimeout(() => {
          get().nextTurn();
        }, 1500);
      }
    },

    nextTurn: () => {
      const { players, currentPlayer } = get();
      const nextPlayerIndex = (currentPlayer + 1) % players.length;
      
      set({ currentPlayer: nextPlayerIndex });
      get().nextPuzzle();
    },

    restartGame: () => {
      const { players } = get();
      const playerNames = players.map(p => p.name);
      get().startGame(playerNames);
    },

    goToSetup: () => {
      set({
        gamePhase: 'setup',
        players: [],
        currentPlayer: 0,
        currentPuzzle: null,
        puzzlesCompleted: 0,
        timeLeft: 120
      });
    }
  }))
);
