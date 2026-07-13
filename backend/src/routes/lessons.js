const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate, requireRole } = require('../middleware/auth');
const { z } = require('zod');

// ─── GET ALL LESSONS ───
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const where = {};
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        order: true,
        xpReward: true,
        createdAt: true,
        author: {
          select: { username: true, displayName: true }
        }
      }
    });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// ─── GET SINGLE LESSON ───
router.get('/:id', async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: {
        author: { select: { username: true, displayName: true } }
      }
    });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
});

// ─── CREATE LESSON (teacher/admin) ───
router.post('/', authenticate, requireRole('teacher', 'admin'), async (req, res) => {
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
      data: {
        ...data,
        order: data.order || 1,
        xpReward: data.xpReward || 50,
        authorId: req.user.id
      }
    });
    res.status(201).json(lesson);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// ─── COMPLETE LESSON ───
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id } });
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const existing = await prisma.lessonCompletion.findUnique({
      where: { userId_lessonId: { userId: req.user.id, lessonId: req.params.id } }
    });

    if (existing) {
      return res.json({ message: 'Already completed', xpEarned: 0 });
    }

    await prisma.lessonCompletion.create({
      data: { userId: req.user.id, lessonId: req.params.id }
    });

    // Award XP
    await prisma.user.update({
      where: { id: req.user.id },
      data: { xp: { increment: lesson.xpReward } }
    });

    res.json({ message: 'Lesson completed!', xpEarned: lesson.xpReward });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete lesson' });
  }
});

// ─── DELETE LESSON (admin only) ───
router.delete('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

module.exports = router;
