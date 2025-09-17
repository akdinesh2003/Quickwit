import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Add CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://quickwit-akdinesh2003.vercel.app", "https://*.vercel.app"]
    : ["http://localhost:3000", "http://192.168.29.22:3000"],
  credentials: true
}));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ["https://quickwit-akdinesh2003.vercel.app", "https://*.vercel.app"]
      : ["http://localhost:3000", "http://192.168.29.22:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
  path: "/socket.io/",
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Handle connection errors
io.engine.on('connection_error', (err) => {
  console.error('Socket.IO connection error:', err);
});

app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, path } = req;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${method} ${path} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

async function main() {
  // Register API routes
  registerRoutes(app, io);

  // In development, use Vite's middleware for HMR
  if (process.env.NODE_ENV !== 'production') {
    await setupVite(app, server);
  } else {
    // In production, serve static files from the dist directory
    serveStatic(app);
  }

  // Start the server
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the application
main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});