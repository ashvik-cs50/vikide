const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// All admin routes require admin role
router.use(authenticate, requireRole('admin'));

// ─── GET ALL USERS ───
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        xp: true,
        level: true,
        streak: true,
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
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ─── UPDATE USER ROLE ───
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, username: true, role: true }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ─── DELETE USER ───
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Delete all associated data
    await prisma.loginSession.deleteMany({ where: { userId: user.id } });
    await prisma.userAchievement.deleteMany({ where: { userId: user.id } });
    await prisma.lessonCompletion.deleteMany({ where: { userId: user.id } });
    await prisma.userDailyChallenge.deleteMany({ where: { userId: user.id } });
    await prisma.project.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ─── ANALYTICS ───
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProjects = await prisma.project.count();
    const totalLessons = await prisma.lesson.count();
    const totalLessonCompletions = await prisma.lessonCompletion.count();
    const totalAchievements = await prisma.achievement.count();
    const totalChallenges = await prisma.dailyChallenge.count();

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    const topUsers = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take: 10,
      select: {
        username: true,
        displayName: true,
        xp: true,
        level: true
      }
    });

    const recentRegistrations = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    res.json({
      totalUsers,
      totalProjects,
      totalLessons,
      totalLessonCompletions,
      totalAchievements,
      totalChallenges,
      usersByRole,
      topUsers,
      recentRegistrations
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
