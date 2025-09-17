import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Users, 
  Play, 
  Sparkles, 
  Trophy, 
  Clock, 
  Target,
  Zap,
  Star,
  ChevronRight
} from 'lucide-react';
import { useSocket } from '@/lib/stores/useSocket';

export default function QuizLanding() {
  const { socket, connect, isConnected } = useSocket();
  const [mode, setMode] = useState<'choose' | 'host' | 'join'>('choose');
  const [hostName, setHostName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useCustomCode, setUseCustomCode] = useState(false);
  const [customRoomCode, setCustomRoomCode] = useState('');
  const [questions, setQuestions] = useState<Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
  }>>([{ id: 1, question: '', options: ['', '', '', ''], correctAnswer: 0 }]);

  useEffect(() => {
    connect();
  }, [connect]);

  const handleCreateRoom = () => {
    if (!hostName.trim() || !socket) return;
    if (useCustomCode && !customRoomCode.trim()) return;
    
    // Validate questions
    const validQuestions = questions.filter(q => 
      q.question.trim() && 
      q.options.every(opt => opt.trim()) &&
      q.correctAnswer >= 0 && q.correctAnswer < 4
    );
    
    if (validQuestions.length === 0) {
      return;
    }
    
    setIsLoading(true);
    
    socket.emit('create-room', {
      hostName: hostName.trim(),
      questions: validQuestions,
      customRoomCode: useCustomCode ? customRoomCode.trim().toUpperCase() : undefined
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim() || !socket) return;
    setIsLoading(true);
    
    socket.emit('join-room', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              QuizMaster Live
            </h1>
          </div>
          <p className="text-xl text-purple-100 font-light max-w-2xl mx-auto leading-relaxed">
            Host live quiz competitions where anyone can join and compete in real-time! 
            Experience the thrill of competitive puzzles and brain teasers.
          </p>
          <div className="flex items-center justify-center gap-6 mt-8">
            <Badge variant="secondary" className="bg-purple-800/50 text-purple-100 px-4 py-2 text-sm">
              <Users className="h-4 w-4 mr-2" />
              Multiplayer
            </Badge>
            <Badge variant="secondary" className="bg-blue-800/50 text-blue-100 px-4 py-2 text-sm">
              <Clock className="h-4 w-4 mr-2" />
              Real-time
            </Badge>
            <Badge variant="secondary" className="bg-pink-800/50 text-pink-100 px-4 py-2 text-sm">
              <Target className="h-4 w-4 mr-2" />
              Adaptive
            </Badge>
          </div>
        </div>

        {/* Connection status */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-900/30 text-green-300 border border-green-500/30' 
              : 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
            }`} />
            {isConnected ? 'Connected to Quiz Server' : 'Connecting to Server...'}
          </div>
        </div>

        {mode === 'choose' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Host a Quiz */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-purple-500/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Crown className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">Host a Quiz</CardTitle>
                      <p className="text-purple-200 text-sm">Control the game, manage players</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-purple-800/30 rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-purple-200">Real-time Control</p>
                    </div>
                    <div className="text-center p-3 bg-purple-800/30 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-purple-200">Live Leaderboard</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setMode('host')}
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-xl group-hover:shadow-lg transition-all duration-300"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Host Quiz
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>

              {/* Join a Quiz */}
              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-900/80 to-cyan-900/80 border-blue-500/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <CardHeader className="relative pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">Join a Quiz</CardTitle>
                      <p className="text-blue-200 text-sm">Enter a room code and compete</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-800/30 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-blue-200">Compete Live</p>
                    </div>
                    <div className="text-center p-3 bg-blue-800/30 rounded-lg">
                      <Users className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                      <p className="text-xs text-blue-200">Join Others</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setMode('join')}
                    disabled={!isConnected}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl group-hover:shadow-lg transition-all duration-300"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Join Quiz
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {mode === 'host' && (
          <div className="max-w-md mx-auto">
            <Card className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 border-purple-500/30 backdrop-blur-sm shadow-2xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="h-6 w-6 text-yellow-400" />
                  <CardTitle className="text-2xl font-bold text-white">Host Quiz Setup</CardTitle>
                </div>
                <p className="text-purple-200">Configure your live quiz session</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-purple-200 font-medium">Host Name</Label>
                  <Input
                    placeholder="Enter your name as host"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="mt-2 bg-purple-800/30 border-purple-500/50 text-white placeholder-purple-300 focus:border-purple-400"
                  />
                </div>
                
                <div>
                  <Label className="text-purple-200 font-medium">Create Your Questions</Label>
                  <div className="space-y-4 mt-2">
                    {questions.map((q, qIndex) => (
                      <Card key={q.id} className="bg-purple-800/20 border-purple-500/30">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-purple-200 text-sm">Question {qIndex + 1}</Label>
                            {questions.length > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setQuestions(questions.filter(quest => quest.id !== q.id))}
                                className="h-6 w-6 p-0 border-red-500/50 text-red-300 hover:bg-red-800/50"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                          
                          <Input
                            placeholder="Enter your question..."
                            value={q.question}
                            onChange={(e) => {
                              const newQuestions = [...questions];
                              newQuestions[qIndex].question = e.target.value;
                              setQuestions(newQuestions);
                            }}
                            className="bg-purple-800/30 border-purple-500/50 text-white placeholder-purple-300 focus:border-purple-400"
                          />
                          
                          <div className="space-y-2">
                            <Label className="text-purple-200 text-sm">Answer Options</Label>
                            {q.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newQuestions = [...questions];
                                    newQuestions[qIndex].correctAnswer = optIndex;
                                    setQuestions(newQuestions);
                                  }}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    q.correctAnswer === optIndex
                                      ? 'border-green-400 bg-green-500'
                                      : 'border-purple-500/50 hover:border-purple-400'
                                  }`}
                                >
                                  {q.correctAnswer === optIndex && <div className="w-3 h-3 bg-white rounded-full" />}
                                </button>
                                <Input
                                  placeholder={`Option ${optIndex + 1}...`}
                                  value={option}
                                  onChange={(e) => {
                                    const newQuestions = [...questions];
                                    newQuestions[qIndex].options[optIndex] = e.target.value;
                                    setQuestions(newQuestions);
                                  }}
                                  className="flex-1 bg-purple-800/30 border-purple-500/50 text-white placeholder-purple-300 focus:border-purple-400"
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    <Button
                      onClick={() => {
                        const newId = Math.max(...questions.map(q => q.id)) + 1;
                        setQuestions([...questions, { 
                          id: newId, 
                          question: '', 
                          options: ['', '', '', ''], 
                          correctAnswer: 0 
                        }]);
                      }}
                      variant="outline"
                      className="w-full border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
                    >
                      + Add Question
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-purple-200 font-medium">Room Code</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setUseCustomCode(!useCustomCode);
                        if (useCustomCode) setCustomRoomCode('');
                      }}
                      className="text-xs text-purple-300 hover:text-purple-100 underline"
                    >
                      {useCustomCode ? 'Use auto-generated' : 'Create custom code'}
                    </button>
                  </div>
                  
                  {useCustomCode ? (
                    <div>
                      <Input
                        placeholder="Enter 4-6 character code"
                        value={customRoomCode}
                        onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                        maxLength={6}
                        className="bg-purple-800/30 border-purple-500/50 text-white placeholder-purple-300 focus:border-purple-400 text-center font-mono tracking-widest"
                      />
                      <p className="text-xs text-purple-300 mt-1 text-center">
                        Custom codes must be 4-6 characters (letters/numbers)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-purple-800/30 rounded-lg border border-purple-500/50">
                      <p className="text-purple-200 text-sm">
                        A 6-digit code will be generated automatically
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMode('choose')}
                    className="flex-1 border-purple-500/50 text-purple-200 hover:bg-purple-800/50"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={
                      !hostName.trim() || 
                      !isConnected || 
                      isLoading || 
                      (useCustomCode && customRoomCode.trim().length < 4) ||
                      !questions.some(q => q.question.trim() && q.options.every(opt => opt.trim()))
                    }
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <>
                        <Crown className="h-4 w-4 mr-2" />
                        Create Room
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {mode === 'join' && (
          <div className="max-w-md mx-auto">
            <Card className="bg-gradient-to-br from-blue-900/90 to-cyan-900/90 border-blue-500/30 backdrop-blur-sm shadow-2xl">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Play className="h-6 w-6 text-cyan-400" />
                  <CardTitle className="text-2xl font-bold text-white">Join Quiz</CardTitle>
                </div>
                <p className="text-blue-200">Enter the room code to participate</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-blue-200 font-medium">Your Name</Label>
                  <Input
                    placeholder="Enter your player name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="mt-2 bg-blue-800/30 border-blue-500/50 text-white placeholder-blue-300 focus:border-blue-400"
                  />
                </div>
                
                <div>
                  <Label className="text-blue-200 font-medium">Room Code</Label>
                  <Input
                    placeholder="Enter 6-digit room code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="mt-2 bg-blue-800/30 border-blue-500/50 text-white placeholder-blue-300 focus:border-blue-400 text-center text-xl font-mono tracking-widest"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMode('choose')}
                    className="flex-1 border-blue-500/50 text-blue-200 hover:bg-blue-800/50"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={!playerName.trim() || !roomCode.trim() || !isConnected || isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Joining...
                      </div>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Join Room
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}