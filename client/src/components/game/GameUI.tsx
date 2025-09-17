import { usePuzzleGame } from '@/lib/stores/usePuzzleGame';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, Trophy, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GameUI() {
  const { 
    currentPlayer, 
    players, 
    timeLeft, 
    puzzlesCompleted, 
    totalPuzzles,
    gamePhase,
    nextTurn,
    restartGame
  } = usePuzzleGame();
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress((puzzlesCompleted / totalPuzzles) * 100);
  }, [puzzlesCompleted, totalPuzzles]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-mono font-semibold text-lg">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            {players.length > 1 && (
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-medium">
                  {players[currentPlayer]?.name}'s turn
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={restartGame}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Restart</span>
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{puzzlesCompleted} / {totalPuzzles} puzzles</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {players.length > 1 && (
          <div className="mt-3 flex items-center space-x-4">
            {players.map((player: any, index: number) => (
              <div 
                key={index}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                  index === currentPlayer 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-gray-100'
                }`}
              >
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-sm">{player.name}</span>
                <span className="text-xs bg-white px-2 py-1 rounded">
                  {player.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
