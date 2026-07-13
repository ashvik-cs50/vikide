require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');

const prisma = require('./lib/prisma');

const authRoutes = require('./routes/auth');
const lessonRoutes = require('./routes/lessons');
const projectRoutes = require('./routes/projects');
const achievementRoutes = require('./routes/achievements');
const dailyRoutes = require('./routes/daily');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');

const app = express();
const server = http.createServer(app);

// ─── Security Middleware ───
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Auth-specific stricter rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use(express.json({ limit: '10mb' }));

// ─── Socket.io for real-time features ───
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST']
  }
});

const connectedClients = new Map();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join:workspace', (userId) => {
    socket.join(`user:${userId}`);
    connectedClients.set(socket.id, userId);
    io.to(`user:${userId}`).emit('status:online', { userId });
  });

  socket.on('code:sync', (data) => {
    const { userId, projectId, code } = data;
    socket.to(`project:${projectId}`).emit('code:update', { userId, code });
  });

  socket.on('join:project', (projectId) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    const userId = connectedClients.get(socket.id);
    if (userId) {
      io.to(`user:${userId}`).emit('status:offline', { userId });
      connectedClients.delete(socket.id);
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    message: 'VIK IDE API is running — VIKco community online.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ───
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════╗
║       VIK IDE Backend Server v1.0        ║
║──────────────────────────────────────────║
║  Status:  Running                        ║
║  Port:    ${PORT}                           ║
║  API:     http://localhost:${PORT}/api     ║
║  Health:  http://localhost:${PORT}/api/health ║
╚══════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
