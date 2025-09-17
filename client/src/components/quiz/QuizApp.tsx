import { useState, useEffect } from 'react';
import QuizLanding from './QuizLanding';
import QuizHost from './QuizHost';
import QuizPlayer from './QuizPlayer';
import { useSocket } from '@/lib/stores/useSocket';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

type GameMode = 'landing' | 'host' | 'player';

export default function QuizApp() {
  const { socket, currentRoom, isHost, error, clearError } = useSocket();
  const [mode, setMode] = useState<GameMode>('landing');
  const [playerName, setPlayerName] = useState('');

  // Auto-dismiss connection errors after 5 seconds
  useEffect(() => {
    if (error === 'Failed to connect to quiz server') {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (!socket) return;

    // Listen for successful room creation (host)
    socket.on('room-created', (data) => {
      setMode('host');
    });

    // Listen for successful room join (player)  
    socket.on('room-joined', (data) => {
      setMode('player');
    });

    // Listen for join errors
    socket.on('join-error', (data) => {
      // Stay in landing mode so user can try again
      setMode('landing');
    });

    // Listen for disconnect - return to landing
    socket.on('disconnect', () => {
      setMode('landing');
      setPlayerName('');
    });

    return () => {
      socket.off('room-created');
      socket.off('room-joined');
      socket.off('join-error');
      socket.off('disconnect');
    };
  }, [socket]);

  // Store player name from join attempt
  useEffect(() => {
    if (!socket) return;

    const originalEmit = socket.emit;
    socket.emit = function(event, ...args) {
      if (event === 'join-room' && args[0]?.playerName) {
        setPlayerName(args[0].playerName);
      }
      return originalEmit.apply(this, [event, ...args]);
    };

    return () => {
      socket.emit = originalEmit;
    };
  }, [socket]);

  return (
    <div className="min-h-screen">
      {/* Error Alert */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <Alert className="bg-red-900/90 border-red-500/50 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-100">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      {mode === 'landing' && <QuizLanding />}
      
      {mode === 'host' && currentRoom && (
        <QuizHost roomCode={currentRoom} />
      )}
      
      {mode === 'player' && currentRoom && playerName && (
        <QuizPlayer roomCode={currentRoom} playerName={playerName} />
      )}
    </div>
  );
}