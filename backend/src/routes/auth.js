const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'vik-ide-jwt-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().max(30).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional()
});

const profileSchema = z.object({
  displayName: z.string().max(30).optional(),
  profilePicture: z.string().url().optional().nullable()
});

// ─── REGISTER ───
router.post('/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check existing user
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: data.username } });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username taken' });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash,
        displayName: data.displayName || data.username,
        profilePicture: null,
        xp: 0,
        level: 1,
        streak: 0
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
        createdAt: true
      }
    });

    // Create session
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.loginSession.create({
      data: {
        userId: user.id,
        token,
        rememberMe: false,
        expiresAt
      }
    });

    res.status(201).json({
      message: 'Account created successfully! Welcome to VIKco.',
      user,
      token
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── LOGIN ───
router.post('/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login and streak
    const now = new Date();
    const lastLogin = user.lastLogin;
    let newStreak = user.streak;

    if (lastLogin) {
      const daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      if (daysSinceLastLogin === 1) {
        newStreak += 1;
      } else if (daysSinceLastLogin > 1) {
        newStreak = 0; // streak broken
      }
    } else {
      newStreak = 1;
    }

    // Give daily login XP if streak increased
    let xpEarned = 0;
    if (newStreak > (user.streak || 0)) {
      xpEarned = 10 + Math.min(newStreak * 2, 50); // up to 50 XP per day
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: now,
        streak: newStreak,
        xp: { increment: xpEarned }
      }
    });

    // Calculate level based on XP
    const totalXp = user.xp + xpEarned;
    const newLevel = Math.floor(totalXp / 500) + 1;

    if (newLevel > user.level) {
      await prisma.user.update({
        where: { id: user.id },
        data: { level: newLevel }
      });
    }

    // Create session
    const expiresIn = data.rememberMe ? '30d' : JWT_EXPIRES_IN;
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });
    const expiresAt = new Date(Date.now() + (data.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);

    await prisma.loginSession.create({
      data: {
        userId: user.id,
        token,
        rememberMe: data.rememberMe || false,
        expiresAt
      }
    });

    res.json({
      message: 'Welcome back!',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        role: user.role,
        xp: totalXp,
        level: newLevel,
        streak: newStreak,
        createdAt: user.createdAt
      },
      token,
      xpEarned
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ─── PROFILE ───
router.get('/profile', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
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
      lastLogin: true,
      createdAt: true,
      _count: {
        select: {
          projects: true,
          achievements: true,
          lessons: true
        }
      }
    }
  });

  // Get recent projects
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 5
  });

  // Get unlocked achievements
  const achievements = await prisma.userAchievement.findMany({
    where: { userId: user.id },
    include: { achievement: true },
    orderBy: { unlockedAt: 'desc' }
  });

  // Get completed lessons count
  const completedLessons = await prisma.lessonCompletion.count({
    where: { userId: user.id, completed: true }
  });

  res.json({
    ...user,
    projects,
    achievements: achievements.map(a => a.achievement),
    completedLessons
  });
});

// ─── UPDATE PROFILE ───
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const data = profileSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.profilePicture !== undefined && { profilePicture: data.profilePicture })
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        profilePicture: true,
        role: true,
        xp: true,
        level: true,
        streak: true
      }
    });
    res.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Update failed' });
  }
});

// ─── LOGOUT ───
router.post('/logout', authenticate, async (req, res) => {
  try {
    await prisma.loginSession.deleteMany({
      where: { userId: req.user.id }
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ─── LEADERBOARD ───
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 50,
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePicture: true,
        xp: true,
        level: true,
        streak: true,
        _count: {
          select: {
            achievements: true,
            projects: true
          }
        }
      }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
