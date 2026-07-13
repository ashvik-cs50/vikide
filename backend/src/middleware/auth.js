const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'vik-ide-jwt-secret';

// Verify JWT token from Authorization header
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify session is still valid
    const session = await prisma.loginSession.findUnique({
      where: { token }
    });
    
    if (!session) {
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    if (new Date() > session.expiresAt) {
      await prisma.loginSession.delete({ where: { id: session.id } });
      return res.status(401).json({ error: 'Session expired. Please login again.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        profilePicture: true,
        role: true,
        streak: true,
        xp: true,
        level: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Auth middleware error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Require specific role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };
