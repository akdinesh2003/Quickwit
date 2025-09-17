import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Clock,
  Trophy,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Crown
} from 'lucide-react';
import { useSocket } from '@/lib/stores/useSocket';

interface QuizPlayerProps {
  roomCode: string;
  playerName: string;
}

export default function QuizPlayer({ roomCode, playerName }: QuizPlayerProps) {
  const { socket } = useSocket();
  const [gameState, setGameState] = useState<'waiting' | 'active' | 'finished'>('waiting');
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number>(-1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [currentScore, setCurrentScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [hostName, setHostName] = useState('');

  useEffect(() => {
    if (!socket) return;

    socket.on('room-joined', (data) => {
      setPlayers(data.players);
      setHostName(data.hostName);
    });

    socket.on('player-joined', (data) => {
      setPlayers(data.players);
    });

    socket.on('player-left', (data) => {
      setPlayers(data.players);
    });

    socket.on('quiz-started', (data) => {
      setGameState('active');
      setCurrentQuestion(data.question);
      setQuestionOptions(data.options);
      setQuestionNumber(data.questionNumber);
      setTotalQuestions(data.totalQuestions);
      setTimeLeft(data.timeLimit);
      setHasSubmitted(false);
      setSelectedAnswer(-1);
      setLastResult(null);
    });

    socket.on('next-question', (data) => {
      setCurrentQuestion(data.question);
      setQuestionOptions(data.options);
      setQuestionNumber(data.questionNumber);
      setTimeLeft(data.timeLimit);
      setHasSubmitted(false);
      setSelectedAnswer(-1);
      setLastResult(null);
    });

    socket.on('quiz-finished', (data) => {
      setGameState('finished');
      setLeaderboard(data.finalLeaderboard);
    });

    socket.on('answer-result', (data) => {
      setLastResult(data);
      setCurrentScore(data.currentScore);
    });

    socket.on('leaderboard-update', (data) => {
      setLeaderboard(data.leaderboard);
    });

    return () => {
      socket.off('room-joined');
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('quiz-started');
      socket.off('next-question');
      socket.off('quiz-finished');
      socket.off('answer-result');
      socket.off('leaderboard-update');
    };
  }, [socket]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'active' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const handleSubmitAnswer = () => {
    if (!socket || hasSubmitted || selectedAnswer === -1 || !questionOptions.length) return;

    const timeSpent = Math.max(0, 30 - timeLeft);
    socket.emit('submit-answer', {
      roomCode,
      answer: selectedAnswer,
      timeSpent
    });

    setHasSubmitted(true);
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPlayerRank = () => {
    const playerRank = leaderboard.findIndex(p => p.name === playerName) + 1;
    return playerRank > 0 ? playerRank : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Player Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white">{playerName}</h1>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-blue-200">
            <span>Room: <span className="font-mono font-bold text-white">{roomCode}</span></span>
            <span>Host: <span className="text-white">{hostName}</span></span>
            {currentScore > 0 && (
              <Badge className="bg-yellow-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                {currentScore} points
              </Badge>
            )}
          </div>
        </div>

        {gameState === 'waiting' && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 border-blue-500/30 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">Waiting for Quiz to Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-blue-800/30 rounded-lg">
                  <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-blue-200 mb-4">
                    Players in room: <span className="font-bold text-white">{players.length}</span>
                  </p>
                  
                  <div className="space-y-2">
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-center gap-2 text-blue-200">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className={player.name === playerName ? 'text-white font-bold' : ''}>
                          {player.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-800/30 rounded-full text-purple-200">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    Waiting for host to start the quiz...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'active' && currentQuestion && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Question Panel */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-purple-500/30 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">
                      Question {questionNumber}/{totalQuestions}
                    </CardTitle>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                      timeLeft <= 10 ? 'bg-red-800/50 text-red-200' : 'bg-blue-800/50 text-blue-200'
                    }`}>
                      <Clock className="h-4 w-4" />
                      <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      {currentQuestion}
                    </h3>
                  </div>

                  {/* Multiple Choice Options */}
                  {questionOptions && questionOptions.length > 0 ? (
                    <div className="space-y-3">
                      {questionOptions.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        disabled={hasSubmitted}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                          selectedAnswer === index
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-purple-800/30 border-purple-500/50 text-purple-100 hover:bg-purple-700/50 hover:border-purple-400'
                        } ${hasSubmitted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === index
                              ? 'border-white bg-white'
                              : 'border-purple-400'
                          }`}>
                            {selectedAnswer === index && (
                              <div className="w-3 h-3 bg-purple-600 rounded-full" />
                            )}
                          </div>
                          <span className="flex-1 font-medium">
                            <span className="text-purple-300 font-bold mr-2">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </span>
                        </div>
                      </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-purple-300">
                      <p>Loading question options...</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  {!hasSubmitted && timeLeft > 0 && questionOptions.length > 0 && (
                    <div className="text-center pt-4">
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === -1}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {selectedAnswer === -1 ? 'Select an Answer' : 'Submit Answer'}
                      </Button>
                    </div>
                  )}

                  {/* Answer Result */}
                  {lastResult && (
                    <div className={`text-center p-4 rounded-lg ${
                      lastResult.isCorrect 
                        ? 'bg-green-900/50 border border-green-500/30' 
                        : 'bg-red-900/50 border border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {lastResult.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-400" />
                        )}
                        <span className={`font-bold text-lg ${
                          lastResult.isCorrect ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {lastResult.isCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      <p className={`text-sm ${
                        lastResult.isCorrect ? 'text-green-200' : 'text-red-200'
                      }`}>
                        {lastResult.feedback}
                      </p>
                      {lastResult.score > 0 && (
                        <Badge className="bg-yellow-600 text-white mt-2">
                          +{lastResult.score} points
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Leaderboard Panel */}
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
                    <Trophy className="h-8 w-8 mx-auto mb-3 text-green-400" />
                    <p className="text-sm">Scores will appear here</p>
                  </div>
                ) : (
                  leaderboard.map((player, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.name === playerName
                          ? 'bg-blue-700/50 border border-blue-400/50'
                          : index === 0 
                          ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30 border border-yellow-400/30' 
                          : 'bg-green-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                          'bg-gradient-to-r from-green-500 to-teal-500'
                        }`}>
                          {index === 0 ? <Crown className="h-3 w-3" /> : index + 1}
                        </div>
                        <span className={`text-sm font-medium ${
                          player.name === playerName ? 'text-blue-200 font-bold' : 'text-white'
                        }`}>
                          {player.name}
                        </span>
                      </div>
                      <div className="text-white font-bold">
                        {player.score}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-gradient-to-br from-yellow-900/80 to-orange-900/80 border-yellow-500/30 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-white">Quiz Finished!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
                  
                  {leaderboard.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        🎉 Winner: {leaderboard[0].name}!
                      </h3>
                      
                      <div className="space-y-2">
                        {leaderboard.slice(0, 5).map((player, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-3 rounded-lg ${
                              player.name === playerName
                                ? 'bg-blue-700/50 border border-blue-400/50'
                                : index === 0
                                ? 'bg-gradient-to-r from-yellow-600/30 to-orange-600/30'
                                : 'bg-yellow-800/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-700' :
                                'bg-gradient-to-r from-yellow-600 to-orange-600'
                              }`}>
                                {index === 0 ? '👑' : index + 1}
                              </div>
                              <span className={`font-medium ${
                                player.name === playerName ? 'text-blue-200 font-bold' : 'text-white'
                              }`}>
                                {player.name}
                              </span>
                            </div>
                            <div className="text-white font-bold text-lg">
                              {player.score}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-yellow-200">
                    Your final rank: <span className="font-bold text-white">#{getPlayerRank()}</span>
                  </p>
                  <p className="text-yellow-200">
                    Your final score: <span className="font-bold text-white">{currentScore} points</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}