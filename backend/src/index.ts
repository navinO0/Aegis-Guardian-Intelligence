import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { logger } from './utils/logger.js';
import claimRoutes from './routes/claim.routes.js';
import policyRoutes from './routes/policy.routes.js';
import { OllamaProvider } from './providers/ollama.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const ai = new OllamaProvider();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});
const PORT = process.env.PORT || 4000;

// Import workers for background processing
import './workers/vision.worker.js';
import './workers/policy.worker.js';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/claims', claimRoutes);
app.use('/api/policies', policyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler — must be AFTER all routes
app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info(`🔌 Socket connected (Zero-Cost Mode): ${socket.id}`);
  
  socket.on('message', async (text: string) => {
    logger.info(`💬 Received: ${text}`);
    socket.emit('agent-state', 'thinking');
    
    try {
      const response = await ai.generateText(`
        You are an empathic insurance advocate. The user just said: "${text}".
        Respond with warmth, understanding, and helpful next steps.
      `);
      
      socket.emit('agent-msg', response);
      // Backend no longer streams audio; browser handles TTS
    } catch (error) {
      logger.error(`AI Error: ${error}`);
      socket.emit('agent-msg', "I'm having a little trouble connecting to my brain, but I'm here for you. Could you repeat that?");
    }
    
    socket.emit('agent-state', 'idle');
  });

  socket.on('disconnect', () => {
    logger.info(`🔌 Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, async () => {
  logger.info(`🚀 Zero-Cost Guardian Backend running on http://localhost:${PORT}`);

  // Check Ollama host reachability + auto-pull missing models
  try {
    await ai.initialize();
    logger.info('🤖 Ollama initialization complete');
  } catch (err) {
    logger.error(`🤖 Ollama initialization failed: ${err}`);
  }
});

export {};
