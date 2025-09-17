
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Users, 
  Play, 
  Copy,
  CheckCircle,
  Clock,
  Trophy,
  SkipForward,
  UserCheck
} from 'lucide-react';
import { useSocket } from '@/lib/stores/useSocket';

interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  joinedAt: number;
}

interface QuizHostProps {
  roomCode: string;
}

export default function QuizHost({ roomCode }: QuizHostProps) {
  const { socket } = useSocket();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    socket.on('player-left', (data) => {
      setPlayers(data.players);
    });

    socket.on('quiz-started', (data) => {
      setGameState('active');
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.timeLimit);
    });

    socket.on('next-question', (data) => {
      setCurrentQuestion(data.question);
      setQuestionNumber(data.questionNumber);
      setTimeLeft(data.timeLimit);
    });

    socket.on('quiz-finished', (data) => {
      setGameState('finished');
      setLeaderboard(data.finalLeaderboard);
    });

    socket.on('leaderboard-update', (data) => {
      setLeaderboard(data.leaderboard);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('quiz-started');
      socket.off('next-question');
      socket.off('quiz-finished');
      socket.off('leaderboard-update');
    };
  }, [socket]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'active' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto advance to next question when time runs out
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartQuiz = () => {
    if (socket) {
      socket.emit('start-quiz', { roomCode });
    }
  };

  const handleNextQuestion = () => {
    if (socket) {
      socket.emit('next-question', { roomCode });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Host Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white">Quiz Host Panel</h1>
          </div>
          
          {/* Room Code Display */}
          <Card className="max-w-md mx-auto bg-gradient-to-r from-purple-800/50 to-pink-800/50 border-purple-400/30 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <Label className="text-purple-200 text-sm font-medium">Room Code</Label>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <span className="text-4xl font-black text-white font-mono tracking-wider">
                    {roomCode}
                  </span>
                  <Button
                    size="sm"
                    onClick={copyRoomCode}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-purple-300 text-sm mt-2">
                  Share this code with players to join
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Players */}
          <Card className="bg-gradient-to-br from-blue-900/80 to-cyan-900/80 border-blue-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-cyan-400" />
                Players ({players.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {players.length === 0 ? (
                <div className="text-center py-8 text-blue-300">
                  <UserCheck className="h-12 w-12 mx-auto mb-3 text-blue-400" />
                  <p>Waiting for players to join...</p>
                </div>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-blue-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-white font-medium">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-700/50 text-blue-200">
                        {player.score}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${
                        player.connected ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Center Panel - Game Control */}
          <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Play className="h-5 w-5 text-purple-400" />
                Game Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gameState === 'waiting' && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-purple-800/30 rounded-lg">
                    <Play className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                    <p className="text-purple-200 mb-4">Ready to start the quiz?</p>
                    <Button
                      onClick={handleStartQuiz}
                      disabled={players.length === 0}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  </div>
                  {players.length === 0 && (
                    <p className="text-purple-300 text-sm">
                      Wait for at least one player to join before starting
                    </p>
                  )}
                </div>
              )}

              {gameState === 'active' && currentQuestion && (
                <div className="space-y-4">
                  <div className="text-center p-4 bg-purple-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-purple-600 text-white">
                        Question {questionNumber}/{totalQuestions}
                      </Badge>
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="h-4 w-4" />
                        <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Multiple Choice Question
                    </h3>
                    <p className="text-purple-200 text-sm">
                      Players are answering this question now...
                    </p>
                  </div>

                  <Button
                    onClick={handleNextQuestion}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3"
                  >
                    <SkipForward className="h-4 w-4 mr-2" />
                    Next Question
                  </Button>
                </div>
              )}

              {gameState === 'finished' && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-yellow-800/30 rounded-lg">
                    <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-white mb-2">Quiz Completed!</h3>
                    <p className="text-yellow-200">
                      {leaderboard.length > 0 && `🎉 Winner: ${leaderboard[0].name}!`}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Leaderboard */}
          <Card className="bg-gradient-to-br from-green-900/80 to-teal-900/80 border-green-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Live Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-green-300">
                  <Trophy className="h-12 w-12 mx-auto mb-3 text-green-400" />
                  <p>Leaderboard will appear during the quiz</p>
                </div>
              ) : (
                leaderboard.map((player, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 
                        ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-400/30' 
                        : 'bg-green-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                        'bg-gradient-to-r from-green-500 to-teal-500'
                      }`}>
                        {index === 0 ? '👑' : index + 1}
                      </div>
                      <span className="text-white font-medium">{player.name}</span>
                    </div>
                    <div className="text-white font-bold text-lg">
                      {player.score}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={className}>{children}</label>
);