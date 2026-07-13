const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { z } = require('zod');

// All teacher routes require teacher or admin role
router.use(authenticate, requireRole('teacher', 'admin'));

// ─── DASHBOARD ───
router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await prisma.user.count({ where: { role: 'student' } });
    const totalLessons = await prisma.lesson.count();
    const totalAssignments = await prisma.assignment.count();
    const totalCompletions = await prisma.lessonCompletion.count();
    const recentStudents = await prisma.user.findMany({
      where: { role: 'student' },
      orderBy: { lastLogin: 'desc' },
      take: 5,
      select: { id: true, username: true, displayName: true, xp: true, level: true, streak: true, lastLogin: true }
    });
    const lessonStats = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        difficulty: true,
        _count: { select: { completions: true } }
      },
      orderBy: { completions: { _count: 'desc' } }
    });
    res.json({ totalStudents, totalLessons, totalAssignments, totalCompletions, recentStudents, lessonStats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// ─── LIST ALL STUDENTS ───
router.get('/students', async (req, res) => {
  try {
    const { search } = req.query;
    const where = { role: 'student' };
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    const students = await prisma.user.findMany({
      where,
      orderBy: { xp: 'desc' },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            lessonCompletions: { where: { completed: true } },
            achievements: true,
            projects: true,
            userDailyChallenges: { where: { completed: true } }
          }
        }
      }
    });
    res.json(students);
  } catch (err) {
    console.error('Failed to fetch students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// ─── SINGLE STUDENT PROGRESS ───
router.get('/students/:id/progress', async (req, res) => {
  try {
    const student = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        lastLogin: true,
        createdAt: true
      }
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.role !== 'student') return res.status(400).json({ error: 'User is not a student' });

    const completedLessons = await prisma.lessonCompletion.findMany({
      where: { userId: student.id, completed: true },
      include: { lesson: { select: { id: true, title: true, category: true, difficulty: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const achievements = await prisma.userAchievement.findMany({
      where: { userId: student.id },
      include: { achievement: { select: { id: true, name: true, description: true, xpReward: true } } }
    });

    const projects = await prisma.project.findMany({
      where: { userId: student.id },
      orderBy: { updatedAt: 'desc' },
      take: 5
    });

    const challenges = await prisma.userDailyChallenge.findMany({
      where: { userId: student.id, completed: true },
      orderBy: { completedAt: 'desc' },
      take: 10
    });

    const allLessons = await prisma.lesson.findMany({
      select: { id: true, title: true, category: true }
    });

    res.json({
      student,
      completedLessons,
      achievements: achievements.map(a => a.achievement),
      projects,
      challenges,
      totalLessons: allLessons.length,
      allLessons
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
});

// ─── LESSONS: CREATE ───
router.post('/lessons', async (req, res) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.enum(['python', 'java', 'web', 'cpp', 'algorithms']),
      difficulty: z.enum(['easy', 'medium', 'hard']),
      content: z.string().min(1),
      order: z.number().int().optional(),
      xpReward: z.number().int().optional()
    });
    const data = schema.parse(req.body);
    const lesson = await prisma.lesson.create({
      data: { ...data, order: data.order || 1, xpReward: data.xpReward || 50, authorId: req.user.id }
    });
    res.status(201).json(lesson);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// ─── LESSONS: UPDATE ───
router.put('/lessons/:id', async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      category: z.enum(['python', 'java', 'web', 'cpp', 'algorithms']).optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      content: z.string().min(1).optional(),
      order: z.number().int().optional(),
      xpReward: z.number().int().optional()
    });
    const data = schema.parse(req.body);
    const updated = await prisma.lesson.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// ─── LESSONS: DELETE (teacher can delete own) ───
router.delete('/lessons/:id', async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    if (lesson.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this lesson' });
    }
    await prisma.lessonCompletion.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.assignment.deleteMany({ where: { lessonId: lesson.id } });
    await prisma.lesson.delete({ where: { id: lesson.id } });
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// ─── ASSIGNMENTS: LIST ───
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        lesson: { select: { id: true, title: true, category: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ─── ASSIGNMENTS: CREATE ───
router.post('/assignments', async (req, res) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      lessonId: z.string().min(1),
      dueDate: z.string().optional().nullable()
    });
    const data = schema.parse(req.body);
    const assignment = await prisma.assignment.create({
      data: {
        title: data.title,
        description: data.description,
        lessonId: data.lessonId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      }
    });
    res.status(201).json(assignment);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// ─── ASSIGNMENTS: DELETE ───
router.delete('/assignments/:id', async (req, res) => {
  try {
    await prisma.assignment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// ─── CODING CHALLENGES: CREATE ───
router.post('/challenges', async (req, res) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
      language: z.string().default('vik'),
      starterCode: z.string().optional(),
      solution: z.string().optional(),
      xpReward: z.number().int().default(100)
    });
    const data = schema.parse(req.body);
    const challenge = await prisma.dailyChallenge.create({
      data: {
        ...data,
        date: new Date(new Date().toDateString()) // Today at midnight
      }
    });
    res.status(201).json(challenge);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message });
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// ─── CODING CHALLENGES: LIST ───
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await prisma.dailyChallenge.findMany({
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        _count: { select: { completions: true } }
      }
    });
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// ─── CODING CHALLENGES: DELETE ───
router.delete('/challenges/:id', async (req, res) => {
  try {
    await prisma.userDailyChallenge.deleteMany({ where: { challengeId: req.params.id } });
    await prisma.dailyChallenge.delete({ where: { id: req.params.id } });
    res.json({ message: 'Challenge deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete challenge' });
  }
});

// ─── CLASS PROGRESS SUMMARY ───
router.get('/class-progress', async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'student' },
      select: {
        id: true,
        username: true,
        displayName: true,
        xp: true,
        level: true,
        streak: true,
        _count: {
          select: {
            lessonCompletions: { where: { completed: true } },
            achievements: true,
            projects: true
          }
        }
      },
      orderBy: { xp: 'desc' }
    });

    const totalLessons = await prisma.lesson.count();
    const avgCompletion = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s._count.lessonCompletions, 0) / students.length)
      : 0;
    const avgXp = students.length > 0
      ? Math.round(students.reduce((sum, s) => sum + s.xp, 0) / students.length)
      : 0;

    res.json({
      students,
      totalStudents: students.length,
      totalLessons,
      avgCompletion,
      avgXp,
      topStudent: students[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch class progress' });
  }
});

module.exports = router;
