const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const { z } = require('zod');

// ─── GET USER'S PROJECTS ───
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// ─── CREATE PROJECT ───
router.post('/', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(1).max(50),
      description: z.string().optional(),
      language: z.string().default('vik'),
      code: z.string().optional()
    });

    const data = schema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        ...data,
        userId: req.user.id
      }
    });
    res.status(201).json(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// ─── UPDATE PROJECT ───
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const schema = z.object({
      name: z.string().min(1).max(50).optional(),
      description: z.string().optional().nullable(),
      language: z.string().optional(),
      code: z.string().optional().nullable(),
      isPublic: z.boolean().optional()
    });

    const data = schema.parse(req.body);
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data
    });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ─── DELETE PROJECT ───
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router;
