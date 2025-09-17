import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePuzzleGame } from '@/lib/stores/usePuzzleGame';
import { useAudio } from '@/lib/stores/useAudio';

interface LogicPuzzleProps {
  puzzle: any;
}

export default function LogicPuzzle({ puzzle }: LogicPuzzleProps) {
  const { submitAnswer } = usePuzzleGame();
  const { playHit, playSuccess } = useAudio();
  const [userAnswer, setUserAnswer] = useState('');

  const handleSubmit = () => {
    const isCorrect = userAnswer.trim() === puzzle.solution.toString();
    
    if (isCorrect) {
      playSuccess();
    } else {
      playHit();
    }
    
    submitAnswer(userAnswer, isCorrect);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-4">
      <Card className="max-w-lg">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Logic Sequence
            </h3>
            <p className="text-sm text-gray-600">
              Find the pattern and complete the sequence
            </p>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-2xl font-mono font-bold text-gray-700 mb-4">
              {puzzle.sequence.join(' → ')} → ?
            </div>
            
            <div className="text-sm text-gray-500 mb-2">
              Hint: {puzzle.hint}
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your answer"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center text-lg"
              autoFocus
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setUserAnswer('')}
                variant="outline"
                className="flex-1"
              >
                Clear
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={userAnswer.trim() === ''}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Submit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
