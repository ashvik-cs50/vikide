const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');

// ─── GET ALL ACHIEVEMENTS ───
router.get('/', async (req, res) => {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'asc' }
    });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// ─── GET USER'S ACHIEVEMENTS ───
router.get('/mine', authenticate, async (req, res) => {
  try {
    const achievements = await prisma.userAchievement.findMany({
      where: { userId: req.user.id },
      include: { achievement: true },
      orderBy: { unlockedAt: 'desc' }
    });
    res.json(achievements.map(a => ({
      ...a.achievement,
      unlockedAt: a.unlockedAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// ─── ACHIEVEMENTS SETUP (admin/seed) ───
router.post('/setup', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const defaultAchievements = [
      { name: 'First Login', description: 'Welcome to VIKco! You logged in for the first time.', xpReward: 50, criteria: { type: 'login', count: 1 } },
      { name: 'Code Newbie', description: 'Write your first line of code.', xpReward: 100, criteria: { type: 'lines_written', count: 1 } },
      { name: 'Streak Starter', description: 'Log in 3 days in a row.', xpReward: 150, criteria: { type: 'streak', count: 3 } },
      { name: 'Week Warrior', description: 'Maintain a 7-day streak.', xpReward: 300, criteria: { type: 'streak', count: 7 } },
      { name: 'Lesson Learner', description: 'Complete your first lesson.', xpReward: 100, criteria: { type: 'lessons_completed', count: 1 } },
      { name: 'Scholar', description: 'Complete 10 lessons.', xpReward: 500, criteria: { type: 'lessons_completed', count: 10 } },
      { name: 'Project Starter', description: 'Create your first project.', xpReward: 100, criteria: { type: 'projects_created', count: 1 } },
      { name: 'Builder', description: 'Create 5 projects.', xpReward: 300, criteria: { type: 'projects_created', count: 5 } },
      { name: 'Daily Dedication', description: 'Complete 3 daily challenges.', xpReward: 200, criteria: { type: 'daily_challenges', count: 3 } },
      { name: 'Level 5', description: 'Reach level 5.', xpReward: 500, criteria: { type: 'level', count: 5 } },
      { name: 'Level 10', description: 'Reach level 10!', xpReward: 1000, criteria: { type: 'level', count: 10 } },
      { name: 'Centurion', description: 'Earn 1000 XP total.', xpReward: 200, criteria: { type: 'xp_total', count: 1000 } },
      { name: 'Polyglot', description: 'Write code in 3 different languages.', xpReward: 400, criteria: { type: 'languages', count: 3 } },
    ];

    for (const ach of defaultAchievements) {
      await prisma.achievement.upsert({
        where: { name: ach.name },
        update: ach,
        create: ach
      });
    }

    res.json({ message: 'Achievements set up successfully!', count: defaultAchievements.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to setup achievements' });
  }
});

module.exports = router;
