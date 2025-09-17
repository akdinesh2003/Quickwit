import type { Express } from "express";
import { Server as SocketIOServer } from "socket.io";

export function registerRoutes(app: Express, io: SocketIOServer): void {

  // Quiz room management
  const quizRooms = new Map();
  const playerConnections = new Map();

  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Host creates a new quiz room
    socket.on('create-room', (hostData) => {
      let roomCode;
      
      // Use custom room code if provided, otherwise generate one
      if (hostData.customRoomCode) {
        const customCode = hostData.customRoomCode.toUpperCase();
        
        // Validate custom code format (4-6 alphanumeric characters)
        if (!/^[A-Z0-9]{4,6}$/.test(customCode)) {
          socket.emit('join-error', { 
            message: 'Room code must be 4-6 characters (letters and numbers only)' 
          });
          return;
        }
        
        // Check if custom code already exists
        if (quizRooms.has(customCode)) {
          socket.emit('join-error', { 
            message: 'This room code is already taken. Please choose a different one.' 
          });
          return;
        }
        
        roomCode = customCode;
      } else {
        // Generate auto room code and ensure it's unique
        do {
          roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        } while (quizRooms.has(roomCode));
      }
      
      const room = {
        id: roomCode,
        host: socket.id,
        hostName: hostData.hostName || 'Host',
        players: [],
        currentQuestion: 0,
        gameState: 'waiting', // waiting, active, finished
        questions: hostData.questions || [],
        scores: new Map(),
        createdAt: Date.now()
      };
      
      quizRooms.set(roomCode, room);
      socket.join(roomCode);
      
      socket.emit('room-created', { 
        roomCode, 
        questions: room.questions.length,
        isHost: true 
      });
      
      console.log(`Quiz room ${roomCode} created by ${hostData.hostName} ${hostData.customRoomCode ? '(custom code)' : '(auto-generated)'}`);
    });

    // Player joins a quiz room
    socket.on('join-room', (joinData) => {
      const { roomCode, playerName } = joinData;
      const room = quizRooms.get(roomCode);
      
      if (!room) {
        socket.emit('join-error', { message: 'Room not found' });
        return;
      }
      
      if (room.gameState !== 'waiting') {
        socket.emit('join-error', { message: 'Game already in progress' });
        return;
      }
      
      const player = {
        id: socket.id,
        name: playerName || `Player ${room.players.length + 1}`,
        score: 0,
        connected: true,
        joinedAt: Date.now()
      };
      
      room.players.push(player);
      room.scores.set(socket.id, 0);
      socket.join(roomCode);
      playerConnections.set(socket.id, roomCode);
      
      // Notify all players in room
      io.to(roomCode).emit('player-joined', {
        player,
        playerCount: room.players.length,
        players: room.players
      });
      
      socket.emit('room-joined', {
        roomCode,
        isHost: false,
        players: room.players,
        hostName: room.hostName
      });
      
      console.log(`${playerName} joined room ${roomCode}`);
    });

    // Host starts the quiz
    socket.on('start-quiz', (data) => {
      const { roomCode } = data;
      const room = quizRooms.get(roomCode);
      
      if (!room || room.host !== socket.id) {
        return;
      }
      
      room.gameState = 'active';
      room.currentQuestion = 0;
      
      // Send first question to all players
      const currentQ = room.questions[0];
      io.to(roomCode).emit('quiz-started', {
        question: currentQ.question,
        options: currentQ.options,
        questionNumber: 1,
        totalQuestions: room.questions.length,
        timeLimit: 30
      });
      
      console.log(`Quiz started in room ${roomCode}`);
    });

    // Player submits answer
    socket.on('submit-answer', (data) => {
      const { roomCode, answer, timeSpent } = data;
      const room = quizRooms.get(roomCode);
      
      if (!room || room.gameState !== 'active') {
        return;
      }
      
      const currentQ = room.questions[room.currentQuestion];
      const isCorrect = answer === currentQ.correctAnswer;
      
      // Update player score
      let scoreGained = 0;
      if (isCorrect) {
        const baseScore = 100;
        const timeBonus = Math.max(0, (30 - timeSpent) * 2);
        scoreGained = baseScore + timeBonus;
        room.scores.set(socket.id, (room.scores.get(socket.id) || 0) + scoreGained);
      }
      
      // Send result to player
      socket.emit('answer-result', {
        isCorrect,
        score: scoreGained,
        correctAnswer: currentQ.correctAnswer,
        currentScore: room.scores.get(socket.id)
      });
      
      // Send leaderboard to all players
      const leaderboard = Array.from(room.scores.entries())
        .map((entry: any) => {
          const [playerId, score] = entry;
          const player = room.players.find((p: any) => p.id === playerId);
          return { name: player?.name || 'Unknown', score };
        })
        .sort((a: any, b: any) => b.score - a.score);
      
      io.to(roomCode).emit('leaderboard-update', { leaderboard });
    });

    // Host moves to next question
    socket.on('next-question', (data) => {
      const { roomCode } = data;
      const room = quizRooms.get(roomCode);
      
      if (!room || room.host !== socket.id) {
        return;
      }
      
      room.currentQuestion++;
      
      if (room.currentQuestion >= room.questions.length) {
        // Quiz finished
        room.gameState = 'finished';
        const finalLeaderboard = Array.from(room.scores.entries())
          .map((entry: any) => {
            const [playerId, score] = entry;
            const player = room.players.find((p: any) => p.id === playerId);
            return { name: player?.name || 'Unknown', score };
          })
          .sort((a: any, b: any) => b.score - a.score);
        
        io.to(roomCode).emit('quiz-finished', {
          finalLeaderboard,
          winner: finalLeaderboard[0]
        });
      } else {
        // Send next question
        const currentQ = room.questions[room.currentQuestion];
        io.to(roomCode).emit('next-question', {
          question: currentQ.question,
          options: currentQ.options,
          questionNumber: room.currentQuestion + 1,
          totalQuestions: room.questions.length,
          timeLimit: 30
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const roomCode = playerConnections.get(socket.id);
      if (roomCode) {
        const room = quizRooms.get(roomCode);
        if (room) {
          // Remove player from room
          room.players = room.players.filter((p: any) => p.id !== socket.id);
          room.scores.delete(socket.id);
          
          // Notify remaining players
          io.to(roomCode).emit('player-left', {
            playerId: socket.id,
            playerCount: room.players.length,
            players: room.players
          });
          
          // Clean up empty rooms
          if (room.players.length === 0 || room.host === socket.id) {
            quizRooms.delete(roomCode);
            console.log(`Room ${roomCode} cleaned up`);
          }
        }
        playerConnections.delete(socket.id);
      }
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
}
