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
import workspaceRoutes from './routes/workspace.routes.js';

import { OllamaProvider } from './providers/ollama.js';
import { aiProvider } from './providers/manager.js';
import providerRoutes from './routes/provider.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger.js';
import client from 'prom-client';

dotenv.config();

const ai = new OllamaProvider();
const app = express();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

app.use((req, res, next) => {
  const start = Date.now();
  const end = httpRequestDurationMicroseconds.startTimer();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`
    }, `📡 HTTP ${req.method} ${req.originalUrl}`);

    if (req.route) {
      end({ method: req.method, route: req.route.path, code: res.statusCode });
    }
  });
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});
const PORT = process.env.PORT || 4000;

import './workers/vision.worker.js';
import './workers/policy.worker.js';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use('/api/claims', claimRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/providers', providerRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

io.on('connection', (socket) => {
  logger.info(`🔌 Socket connected (Zero-Cost Mode): ${socket.id}`);
  
  socket.on('message', async (text: string) => {
    logger.info(`💬 Received: ${text}`);
    socket.emit('agent-state', 'thinking');
    
    try {
      const response = await aiProvider.generateText(`
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
  logger.info(`------------------------------------------------`);
  logger.info(`🛡️ Aegis Guardian Backend is Live`);
  logger.info(`------------------------------------------------`);
  logger.info(`📍 Local Backend: http://localhost:${PORT}`);
  logger.info(`📍 Swagger Docs:  http://localhost:${PORT}/docs`);
  logger.info(`📍 Metrics:       http://localhost:${PORT}/metrics`);
  logger.info(`📍 Aegis Gateway: http://navin.lol`);
  logger.info(`------------------------------------------------`);

  try {
    await aiProvider.initialize();
    logger.info(`🤖 Aegis Intelligence (${aiProvider.name}) initialized`);
  } catch (err) {
    logger.error(`🤖 AI Initialization failed: ${err}`);
  }
});

export {};
