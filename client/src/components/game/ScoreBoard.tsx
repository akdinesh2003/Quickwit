import { usePuzzleGame } from '@/lib/stores/usePuzzleGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award, RotateCcw, Home } from 'lucide-react';

export default function ScoreBoard() {
  const { players, restartGame, goToSetup } = usePuzzleGame();

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];

  const getIcon = (rank: number) => {
    switch (rank) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <div className="h-6 w-6" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-800">
          Game Over!
        </CardTitle>
        {players.length > 1 && (
          <p className="text-lg text-blue-600 font-semibold">
            🎉 {winner.name} wins!
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {sortedPlayers.map((player, index) => (
            <div 
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {getIcon(index)}
                <div>
                  <div className="font-medium text-gray-800">{player.name}</div>
                  <div className="text-sm text-gray-600">
                    {player.puzzlesSolved} puzzles solved
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-800">
                  {player.score}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2 pt-4">
          <Button
            onClick={restartGame}
            variant="outline"
            className="flex-1 flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Play Again</span>
          </Button>
          <Button
            onClick={goToSetup}
            className="flex-1 flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            <span>New Game</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
