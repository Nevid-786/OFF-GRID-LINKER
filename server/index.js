import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { initDb } from './db.js';
import { seedDatabase } from './seed.js';
import { startSimulator } from './simulator.js';

import { router as authRouter } from './routes/auth.js';
import nodesRouter from './routes/nodes.js';
import { createReadingsRouter } from './routes/readings.js';
import { createAlertsRouter } from './routes/alerts.js';
import analyticsRouter from './routes/analytics.js';
import { createReportsRouter } from './routes/reports.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Initialize DB and Seed Data
initDb();
seedDatabase();

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/readings', createReadingsRouter(io));
app.use('/api/alerts', createAlertsRouter(io));
app.use('/api/analytics', analyticsRouter);
app.use('/api', createReportsRouter(io));

// Root Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', system: 'Environmental Intelligence Network (EIN)', timestamp: new Date().toISOString() });
});

// Socket.io connection logging
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to EIN Socket.io stream: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start live simulator
startSimulator(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🌐 EIN Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server ready for real-time telemetry`);
  console.log(`===================================================`);
});
