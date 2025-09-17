import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePuzzleGame } from '@/lib/stores/usePuzzleGame';
import { useAudio } from '@/lib/stores/useAudio';

interface PatternPuzzleProps {
  puzzle: any;
}

export default function PatternPuzzle({ puzzle }: PatternPuzzleProps) {
  const { submitAnswer } = usePuzzleGame();
  const { playHit, playSuccess } = useAudio();
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [showPattern, setShowPattern] = useState(true);

  useEffect(() => {
    // Show pattern for a few seconds then hide it
    const timer = setTimeout(() => {
      setShowPattern(false);
    }, puzzle.difficulty * 1000 + 2000); // More time for harder puzzles

    return () => clearTimeout(timer);
  }, [puzzle.difficulty]);

  const handleCellClick = (index: number) => {
    if (showPattern) return;
    
    playHit();
    const newPattern = [...userPattern];
    const cellIndex = newPattern.indexOf(index);
    
    if (cellIndex === -1) {
      newPattern.push(index);
    } else {
      newPattern.splice(cellIndex, 1);
    }
    
    setUserPattern(newPattern);
  };

  const handleSubmit = () => {
    const isCorrect = userPattern.length === puzzle.solution.length &&
      userPattern.every(cell => puzzle.solution.includes(cell));
    
    if (isCorrect) {
      playSuccess();
    } else {
      playHit();
    }
    
    submitAnswer(userPattern, isCorrect);
  };

  const isSelected = (index: number) => userPattern.includes(index);
  const isTarget = (index: number) => showPattern && puzzle.solution.includes(index);

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="max-w-lg">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {showPattern ? 'Memorize this pattern!' : 'Recreate the pattern'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {showPattern ? 'Pattern will disappear soon...' : 'Click the cells that were highlighted'}
            </p>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Array.from({ length: 16 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                disabled={showPattern}
                className={`
                  w-12 h-12 rounded border-2 transition-all duration-200
                  ${isTarget(i) 
                    ? 'bg-blue-500 border-blue-600' 
                    : isSelected(i)
                    ? 'bg-green-500 border-green-600'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                  }
                  ${showPattern ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
              />
            ))}
          </div>

          {!showPattern && (
            <div className="flex gap-2">
              <Button 
                onClick={() => setUserPattern([])}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={userPattern.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Submit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
