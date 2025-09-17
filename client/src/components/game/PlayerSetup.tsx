import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, User, Play } from 'lucide-react';
import { usePuzzleGame } from '@/lib/stores/usePuzzleGame';

export default function PlayerSetup() {
  const { startGame } = usePuzzleGame();
  const [playerCount, setPlayerCount] = useState<number>(1);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1']);

  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    const newNames = Array.from({ length: count }, (_, i) => 
      playerNames[i] || `Player ${i + 1}`
    );
    setPlayerNames(newNames);
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name || `Player ${index + 1}`;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    startGame(playerNames.slice(0, playerCount));
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Adaptive Puzzle Game
          </CardTitle>
          <p className="text-gray-600">Quick puzzles that adapt to your skill</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium text-gray-700">Number of Players</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[1, 2, 3, 4].map((count) => (
                <Button
                  key={count}
                  variant={playerCount === count ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePlayerCountChange(count)}
                  className="flex items-center gap-1"
                >
                  {count === 1 ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {playerCount > 1 && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Player Names</Label>
              {Array.from({ length: playerCount }, (_, i) => (
                <Input
                  key={i}
                  placeholder={`Player ${i + 1}`}
                  value={playerNames[i] || ''}
                  onChange={(e) => handleNameChange(i, e.target.value)}
                  className="text-sm"
                />
              ))}
            </div>
          )}

          <Button 
            onClick={handleStartGame}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Game
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
