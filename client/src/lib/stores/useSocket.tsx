import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { io, Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: string | null;
  isHost: boolean;
  error: string | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  setRoom: (roomCode: string, isHost: boolean) => void;
  clearError: () => void;
}

export const useSocket = create<SocketState>()(
  subscribeWithSelector((set, get) => ({
    socket: null,
    isConnected: false,
    currentRoom: null,
    isHost: false,
    error: null,

    connect: () => {
      const { socket } = get();
      
      if (socket && socket.connected) {
        return;
      }

      console.log('Connecting to quiz server...');
      const serverUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin // Use same domain as the website
        : 'http://localhost:5000';
      
      console.log('Connecting to:', serverUrl);
      const newSocket = io(serverUrl, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to quiz server');
        set({ isConnected: true, error: null });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from quiz server');
        set({ isConnected: false, currentRoom: null, isHost: false });
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        set({ 
          isConnected: false, 
          error: 'Failed to connect to quiz server' 
        });
      });

      // Quiz room events
      newSocket.on('room-created', (data) => {
        console.log('Room created:', data);
        set({ 
          currentRoom: data.roomCode, 
          isHost: true, 
          error: null 
        });
      });

      newSocket.on('room-joined', (data) => {
        console.log('Room joined:', data);
        set({ 
          currentRoom: data.roomCode, 
          isHost: false, 
          error: null 
        });
      });

      newSocket.on('join-error', (data) => {
        console.error('Join error:', data);
        set({ error: data.message });
      });

      newSocket.on('player-joined', (data) => {
        console.log('Player joined:', data);
      });

      newSocket.on('player-left', (data) => {
        console.log('Player left:', data);
      });

      newSocket.on('quiz-started', (data) => {
        console.log('Quiz started:', data);
      });

      newSocket.on('next-question', (data) => {
        console.log('Next question:', data);
      });

      newSocket.on('quiz-finished', (data) => {
        console.log('Quiz finished:', data);
      });

      newSocket.on('answer-result', (data) => {
        console.log('Answer result:', data);
      });

      newSocket.on('leaderboard-update', (data) => {
        console.log('Leaderboard update:', data);
      });

      set({ socket: newSocket });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.disconnect();
        set({ 
          socket: null, 
          isConnected: false, 
          currentRoom: null,
          isHost: false,
          error: null 
        });
      }
    },

    setRoom: (roomCode, isHost) => {
      set({ currentRoom: roomCode, isHost });
    },

    clearError: () => {
      set({ error: null });
    }
  }))
);