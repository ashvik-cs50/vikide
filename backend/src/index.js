import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { SignJWT } from 'jose';
import { queryOne, queryAll, execute, generateId, now } from './db.js';
import { hashPassword, verifyPassword, authenticate, requireRole } from './middleware.js';

// ─── JWT helper ───
function getExpiry(expiresIn) {
  if (expiresIn === '30d') return Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;
  return Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
}

async function signToken(userId, secret, expiresIn = '7d') {
  const encoder = new TextEncoder();
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(getExpiry(expiresIn))
    .sign(encoder.encode(secret));
}

const app = new Hono();

// ─── CORS ───
app.use('/api/*', cors({
  origin: (origin, c) => c.env?.FRONTEND_URL || '*',
  credentials: true,
}));

// ─── Rate limiting ───
// Uses D1 database for rate limiting (since Workers are stateless)
app.use('/api/*', async (c, next) => {
  try {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const now_ts = Date.now();
    const windowMs = 60 * 1000;
    const maxReqs = 60;

    // Clean old entries
    await c.env.DB.prepare('DELETE FROM rate_limits WHERE timestamp < ?').bind(now_ts - windowMs).run();

    // Check current count
    const count = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM rate_limits WHERE ip = ? AND timestamp > ?'
    ).bind(ip, now_ts - windowMs).first();

    if (count && count.count >= maxReqs) {
      return c.json({ error: 'Too many requests. Please slow down.' }, 429);
    }

    // Track this request
    await c.env.DB.prepare(
      'INSERT INTO rate_limits (id, ip, timestamp) VALUES (?, ?, ?)'
    ).bind(generateId(), ip, now_ts).run();
  } catch (err) {
    // Rate limiting shouldn't block requests if DB has issues
    console.error('Rate limit error:', err);
  }
  await next();
});

// ═══════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════

// POST /api/auth/register
app.post('/api/auth/register', async (c) => {
  try {
    const { username, email, password, displayName } = await c.req.json();

    if (!username || !email || !password) {
      return c.json({ error: 'Username, email, and password required' }, 400);
    }
    if (username.length < 3 || username.length > 20) {
      return c.json({ error: 'Username must be 3-20 characters' }, 400);
    }
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Check existing
    const existingEmail = await queryOne(c.env.DB, 'SELECT id FROM users WHERE email = ?', email);
    if (existingEmail) return c.json({ error: 'Email already registered' }, 409);

    const existingUser = await queryOne(c.env.DB, 'SELECT id FROM users WHERE username = ?', username);
    if (existingUser) return c.json({ error: 'Username taken' }, 409);

    const id = generateId();
    const passwordHash = await hashPassword(password);

    await execute(c.env.DB,
      'INSERT INTO users (id, username, email, password_hash, display_name) VALUES (?, ?, ?, ?, ?)',
      id, username, email, passwordHash, displayName || username
    );

    const token = await signToken(id, c.env.JWT_SECRET);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await execute(c.env.DB,
      'INSERT INTO login_sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
      generateId(), id, token, expiresAt
    );

    return c.json({
      message: 'Account created successfully! Welcome to VIKco.',
      user: { id, username, email, displayName: displayName || username, role: 'student', xp: 0, level: 1, streak: 0 },
      token
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password, rememberMe } = await c.req.json();

    const user = await queryOne(c.env.DB,
      'SELECT * FROM users WHERE email = ?', email
    );
    if (!user) return c.json({ error: 'Invalid email or password' }, 401);

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return c.json({ error: 'Invalid email or password' }, 401);

    // Update streak
    const now_ = new Date();
    let newStreak = user.streak || 0;
    if (user.last_login) {
      const daysSince = Math.floor((now_.getTime() - new Date(user.last_login).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince === 1) newStreak += 1;
      else if (daysSince > 1) newStreak = 0;
    } else {
      newStreak = 1;
    }

    let xpEarned = 0;
    if (newStreak > (user.streak || 0)) {
      xpEarned = 10 + Math.min(newStreak * 2, 50);
    }

    const totalXp = (user.xp || 0) + xpEarned;
    const newLevel = Math.floor(totalXp / 500) + 1;

    await execute(c.env.DB,
      'UPDATE users SET last_login = ?, streak = ?, xp = ?, level = ? WHERE id = ?',
      now_.toISOString(), newStreak, totalXp, newLevel, user.id
    );

    const expiresIn = rememberMe ? '30d' : '7d';
    const token = await signToken(user.id, c.env.JWT_SECRET, expiresIn);
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString();

    await execute(c.env.DB,
      'INSERT INTO login_sessions (id, user_id, token, expires_at, remember_me) VALUES (?, ?, ?, ?, ?)',
      generateId(), user.id, token, expiresAt, rememberMe ? 1 : 0
    );

    return c.json({
      message: 'Welcome back!',
      user: {
        id: user.id, username: user.username, email: user.email,
        displayName: user.display_name, profilePicture: user.profile_picture,
        role: user.role, xp: totalXp, level: newLevel, streak: newStreak
      },
      token, xpEarned
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// GET /api/auth/profile
app.get('/api/auth/profile', authenticate, async (c) => {
  const user = await queryOne(c.env.DB, `
    SELECT id, username, email, display_name, profile_picture, role, streak, xp, level, last_login, created_at
    FROM users WHERE id = ?
  `, c.user.id);

  if (!user) return c.json({ error: 'User not found' }, 404);

  // Get counts
  const projects = await queryAll(c.env.DB,
    'SELECT id, name, language, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT 5',
    c.user.id
  );
  const achievementCount = await queryOne(c.env.DB,
    'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?', c.user.id
  );
  const lessonCount = await queryOne(c.env.DB,
    'SELECT COUNT(*) as count FROM lesson_completions WHERE user_id = ?', c.user.id
  );

  return c.json({
    ...user,
    projects,
    _count: { projects: projects.length, achievements: achievementCount?.count || 0, lessons: lessonCount?.count || 0 }
  });
});

// PATCH /api/auth/profile
app.patch('/api/auth/profile', authenticate, async (c) => {
  try {
    const { displayName, profilePicture } = await c.req.json();
    const updates = [];
    const values = [];

    if (displayName !== undefined) { updates.push('display_name = ?'); values.push(displayName); }
    if (profilePicture !== undefined) { updates.push('profile_picture = ?'); values.push(profilePicture); }

    if (updates.length > 0) {
      values.push(c.user.id);
      await execute(c.env.DB,
        `UPDATE users SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
        ...values
      );
    }

    const user = await queryOne(c.env.DB,
      'SELECT id, username, email, display_name, profile_picture, role, xp, level, streak FROM users WHERE id = ?',
      c.user.id
    );
    return c.json({ user });
  } catch (err) {
    return c.json({ error: 'Update failed' }, 500);
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticate, async (c) => {
  await execute(c.env.DB, 'DELETE FROM login_sessions WHERE user_id = ?', c.user.id);
  return c.json({ message: 'Logged out successfully' });
});

// GET /api/auth/leaderboard
app.get('/api/auth/leaderboard', async (c) => {
  const users = await queryAll(c.env.DB, `
    SELECT id, username, display_name, profile_picture, xp, level, streak,
      (SELECT COUNT(*) FROM user_achievements WHERE user_id = users.id) as achievement_count,
      (SELECT COUNT(*) FROM projects WHERE user_id = users.id) as project_count
    FROM users ORDER BY xp DESC LIMIT 50
  `);
  return c.json(users);
});

// ═══════════════════════════════════════
// LESSON ROUTES
// ═══════════════════════════════════════

// GET /api/lessons
app.get('/api/lessons', async (c) => {
  const category = c.req.query('category');
  const difficulty = c.req.query('difficulty');
  let sql = 'SELECT id, title, description, category, difficulty, "order", xp_reward, created_at FROM lessons WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (difficulty) { sql += ' AND difficulty = ?'; params.push(difficulty); }
  sql += ' ORDER BY "order" ASC';

  const lessons = await queryAll(c.env.DB, sql, ...params);
  return c.json(lessons);
});

// GET /api/lessons/:id
app.get('/api/lessons/:id', async (c) => {
  const lesson = await queryOne(c.env.DB, 'SELECT * FROM lessons WHERE id = ?', c.req.param('id'));
  if (!lesson) return c.json({ error: 'Lesson not found' }, 404);
  return c.json(lesson);
});

// POST /api/lessons (teacher/admin)
app.post('/api/lessons', authenticate, requireRole('teacher', 'admin'), async (c) => {
  try {
    const data = await c.req.json();
    const id = generateId();
    const validCategories = ['python', 'java', 'web', 'cpp', 'algorithms'];
    const validDifficulties = ['easy', 'medium', 'hard'];

    if (!data.title || !data.description || !data.content || !data.category || !data.difficulty) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    if (!validCategories.includes(data.category)) return c.json({ error: 'Invalid category' }, 400);
    if (!validDifficulties.includes(data.difficulty)) return c.json({ error: 'Invalid difficulty' }, 400);

    await execute(c.env.DB,
      'INSERT INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      id, data.title, data.description, data.category, data.difficulty, data.content,
      data.order || 1, data.xpReward || 50, c.user.id
    );

    return c.json({ id, ...data, authorId: c.user.id }, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create lesson' }, 500);
  }
});

// POST /api/lessons/:id/complete
app.post('/api/lessons/:id/complete', authenticate, async (c) => {
  const lesson = await queryOne(c.env.DB, 'SELECT id, xp_reward FROM lessons WHERE id = ?', c.req.param('id'));
  if (!lesson) return c.json({ error: 'Lesson not found' }, 404);

  const existing = await queryOne(c.env.DB,
    'SELECT id FROM lesson_completions WHERE user_id = ? AND lesson_id = ?',
    c.user.id, lesson.id
  );

  if (existing) {
    return c.json({ message: 'Already completed', xpEarned: 0 });
  }

  await execute(c.env.DB,
    'INSERT INTO lesson_completions (id, user_id, lesson_id) VALUES (?, ?, ?)',
    generateId(), c.user.id, lesson.id
  );

  await execute(c.env.DB,
    'UPDATE users SET xp = xp + ? WHERE id = ?',
    lesson.xp_reward, c.user.id
  );

  return c.json({ message: 'Lesson completed!', xpEarned: lesson.xp_reward });
});

// DELETE /api/lessons/:id (admin)
app.delete('/api/lessons/:id', authenticate, requireRole('admin'), async (c) => {
  await execute(c.env.DB, 'DELETE FROM lessons WHERE id = ?', c.req.param('id'));
  return c.json({ message: 'Lesson deleted' });
});

// ═══════════════════════════════════════
// PROJECT ROUTES
// ═══════════════════════════════════════

// GET /api/projects
app.get('/api/projects', authenticate, async (c) => {
  const projects = await queryAll(c.env.DB,
    'SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC',
    c.user.id
  );
  return c.json(projects);
});

// POST /api/projects
app.post('/api/projects', authenticate, async (c) => {
  try {
    const { name, description, language, code } = await c.req.json();
    if (!name) return c.json({ error: 'Project name required' }, 400);

    const id = generateId();
    await execute(c.env.DB,
      'INSERT INTO projects (id, name, description, language, code, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      id, name, description || null, language || 'vik', code || null, c.user.id
    );

    return c.json({ id, name, description: description || null, language: language || 'vik', code: code || null, userId: c.user.id }, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// PATCH /api/projects/:id
app.patch('/api/projects/:id', authenticate, async (c) => {
  const project = await queryOne(c.env.DB, 'SELECT * FROM projects WHERE id = ?', c.req.param('id'));
  if (!project) return c.json({ error: 'Project not found' }, 404);
  if (project.user_id !== c.user.id && c.user.role !== 'admin') {
    return c.json({ error: 'Not authorized' }, 403);
  }

  try {
    const { name, description, language, code, isPublic } = await c.req.json();
    const updates = [];
    const values = [];

    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (language !== undefined) { updates.push('language = ?'); values.push(language); }
    if (code !== undefined) { updates.push('code = ?'); values.push(code); }
    if (isPublic !== undefined) { updates.push('is_public = ?'); values.push(isPublic ? 1 : 0); }

    if (updates.length > 0) {
      values.push(c.req.param('id'));
      await execute(c.env.DB,
        `UPDATE projects SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`,
        ...values
      );
    }

    const updated = await queryOne(c.env.DB, 'SELECT * FROM projects WHERE id = ?', c.req.param('id'));
    return c.json(updated);
  } catch (err) {
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// DELETE /api/projects/:id
app.delete('/api/projects/:id', authenticate, async (c) => {
  const project = await queryOne(c.env.DB, 'SELECT * FROM projects WHERE id = ?', c.req.param('id'));
  if (!project) return c.json({ error: 'Project not found' }, 404);
  if (project.user_id !== c.user.id && c.user.role !== 'admin') {
    return c.json({ error: 'Not authorized' }, 403);
  }
  await execute(c.env.DB, 'DELETE FROM projects WHERE id = ?', c.req.param('id'));
  return c.json({ message: 'Project deleted' });
});

// ═══════════════════════════════════════
// ACHIEVEMENT ROUTES
// ═══════════════════════════════════════

// GET /api/achievements
app.get('/api/achievements', async (c) => {
  const achievements = await queryAll(c.env.DB, 'SELECT * FROM achievements ORDER BY xp_reward ASC');
  return c.json(achievements);
});

// GET /api/achievements/user
app.get('/api/achievements/user', authenticate, async (c) => {
  const achievements = await queryAll(c.env.DB, `
    SELECT a.*, ua.unlocked_at
    FROM achievements a
    INNER JOIN user_achievements ua ON a.id = ua.achievement_id
    WHERE ua.user_id = ?
    ORDER BY ua.unlocked_at DESC
  `, c.user.id);
  return c.json(achievements);
});

// POST /api/achievements/:id/unlock
app.post('/api/achievements/:id/unlock', authenticate, async (c) => {
  const achievement = await queryOne(c.env.DB, 'SELECT * FROM achievements WHERE id = ?', c.req.param('id'));
  if (!achievement) return c.json({ error: 'Achievement not found' }, 404);

  const existing = await queryOne(c.env.DB,
    'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
    c.user.id, achievement.id
  );
  if (existing) return c.json({ message: 'Already unlocked', xpEarned: 0 });

  await execute(c.env.DB,
    'INSERT INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, ?)',
    generateId(), c.user.id, achievement.id
  );
  await execute(c.env.DB,
    'UPDATE users SET xp = xp + ? WHERE id = ?',
    achievement.xp_reward, c.user.id
  );

  return c.json({ message: 'Achievement unlocked!', xpEarned: achievement.xp_reward, achievement });
});

// ═══════════════════════════════════════
// DAILY CHALLENGE ROUTES
// ═══════════════════════════════════════

// GET /api/daily
app.get('/api/daily', async (c) => {
  const today = now().split('T')[0];
  const challenge = await queryOne(c.env.DB,
    'SELECT * FROM daily_challenges WHERE date = ?', today
  );
  if (!challenge) return c.json({ message: 'No challenge today' });
  return c.json(challenge);
});

// POST /api/daily/:id/complete
app.post('/api/daily/:id/complete', authenticate, async (c) => {
  const challenge = await queryOne(c.env.DB, 'SELECT * FROM daily_challenges WHERE id = ?', c.req.param('id'));
  if (!challenge) return c.json({ error: 'Challenge not found' }, 404);

  const existing = await queryOne(c.env.DB,
    'SELECT id FROM user_daily_challenges WHERE user_id = ? AND challenge_id = ?',
    c.user.id, challenge.id
  );
  if (existing) return c.json({ message: 'Already completed', xpEarned: 0 });

  const { code } = await c.req.json();
  await execute(c.env.DB,
    'INSERT INTO user_daily_challenges (id, user_id, challenge_id, code, xp_earned) VALUES (?, ?, ?, ?, ?)',
    generateId(), c.user.id, challenge.id, code || null, challenge.xp_reward
  );
  await execute(c.env.DB,
    'UPDATE users SET xp = xp + ? WHERE id = ?',
    challenge.xp_reward, c.user.id
  );

  return c.json({ message: 'Challenge completed!', xpEarned: challenge.xp_reward });
});

// ═══════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════

// GET /api/admin/stats
app.get('/api/admin/stats', authenticate, requireRole('admin'), async (c) => {
  const [userCount, lessonCount, projectCount, achievementCount] = await Promise.all([
    queryOne(c.env.DB, 'SELECT COUNT(*) as count FROM users'),
    queryOne(c.env.DB, 'SELECT COUNT(*) as count FROM lessons'),
    queryOne(c.env.DB, 'SELECT COUNT(*) as count FROM projects'),
    queryOne(c.env.DB, 'SELECT COUNT(*) as count FROM achievements'),
  ]);
  return c.json({
    users: userCount?.count || 0,
    lessons: lessonCount?.count || 0,
    projects: projectCount?.count || 0,
    achievements: achievementCount?.count || 0
  });
});

// GET /api/admin/users
app.get('/api/admin/users', authenticate, requireRole('admin'), async (c) => {
  const users = await queryAll(c.env.DB, `
    SELECT id, username, email, display_name, role, xp, level, streak, created_at
    FROM users ORDER BY created_at DESC
  `);
  return c.json(users);
});

// PATCH /api/admin/users/:id/role
app.patch('/api/admin/users/:id/role', authenticate, requireRole('admin'), async (c) => {
  const { role } = await c.req.json();
  if (!['student', 'teacher', 'admin'].includes(role)) {
    return c.json({ error: 'Invalid role' }, 400);
  }
  await execute(c.env.DB, 'UPDATE users SET role = ? WHERE id = ?', role, c.req.param('id'));
  return c.json({ message: 'Role updated' });
});

// DELETE /api/admin/users/:id
app.delete('/api/admin/users/:id', authenticate, requireRole('admin'), async (c) => {
  await execute(c.env.DB, 'DELETE FROM users WHERE id = ?', c.req.param('id'));
  return c.json({ message: 'User deleted' });
});

// ═══════════════════════════════════════
// TEACHER ROUTES
// ═══════════════════════════════════════

// GET /api/teacher/stats
app.get('/api/teacher/stats', authenticate, requireRole('teacher', 'admin'), async (c) => {
  const [studentCount, lessonCount, assignmentCount] = await Promise.all([
    queryOne(c.env.DB, "SELECT COUNT(*) as count FROM users WHERE role = 'student'"),
    queryOne(c.env.DB, 'SELECT COUNT(*) as count FROM lessons'),
    queryOne(c.env.DB, 'SELECT COUNT(*) as count FROM assignments'),
  ]);
  return c.json({
    students: studentCount?.count || 0,
    lessons: lessonCount?.count || 0,
    assignments: assignmentCount?.count || 0
  });
});

// GET /api/teacher/students
app.get('/api/teacher/students', authenticate, requireRole('teacher', 'admin'), async (c) => {
  const search = c.req.query('search');
  let sql = `
    SELECT u.id, u.username, u.display_name, u.email, u.xp, u.level, u.streak, u.last_login,
      (SELECT COUNT(*) FROM lesson_completions WHERE user_id = u.id) as completed_lessons,
      (SELECT COUNT(*) FROM user_achievements WHERE user_id = u.id) as achievements
    FROM users u WHERE u.role = 'student'
  `;
  const params = [];
  if (search) {
    sql += ' AND (u.username LIKE ? OR u.display_name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY u.xp DESC';

  const students = await queryAll(c.env.DB, sql, ...params);
  return c.json(students);
});

// GET /api/teacher/students/:id/progress
app.get('/api/teacher/students/:id/progress', authenticate, requireRole('teacher', 'admin'), async (c) => {
  const student = await queryOne(c.env.DB, `
    SELECT id, username, display_name, email, xp, level, streak FROM users WHERE id = ? AND role = 'student'
  `, c.req.param('id'));

  if (!student) return c.json({ error: 'Student not found' }, 404);

  const [completedLessons, achievements, projects] = await Promise.all([
    queryAll(c.env.DB, `
      SELECT l.id, l.title, l.category, l.difficulty, l.xp_reward, lc.created_at as completed_at
      FROM lesson_completions lc INNER JOIN lessons l ON l.id = lc.lesson_id
      WHERE lc.user_id = ? ORDER BY lc.created_at DESC
    `, student.id),
    queryAll(c.env.DB, `
      SELECT a.name, a.description, a.xp_reward, ua.unlocked_at
      FROM user_achievements ua INNER JOIN achievements a ON a.id = ua.achievement_id
      WHERE ua.user_id = ? ORDER BY ua.unlocked_at DESC
    `, student.id),
    queryAll(c.env.DB, 'SELECT id, name, language, created_at FROM projects WHERE user_id = ? ORDER BY created_at DESC', student.id),
  ]);

  return c.json({ ...student, completedLessons, achievements, projects });
});

// GET /api/teacher/assignments
app.get('/api/teacher/assignments', authenticate, requireRole('teacher', 'admin'), async (c) => {
  const assignments = await queryAll(c.env.DB, `
    SELECT a.*, l.title as lesson_title FROM assignments a
    INNER JOIN lessons l ON l.id = a.lesson_id ORDER BY a.created_at DESC
  `);
  return c.json(assignments);
});

// POST /api/teacher/assignments
app.post('/api/teacher/assignments', authenticate, requireRole('teacher', 'admin'), async (c) => {
  try {
    const { title, description, lessonId, dueDate } = await c.req.json();
    if (!title || !description || !lessonId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    const id = generateId();
    await execute(c.env.DB,
      'INSERT INTO assignments (id, title, description, lesson_id, due_date) VALUES (?, ?, ?, ?, ?)',
      id, title, description, lessonId, dueDate || null
    );
    return c.json({ id, title, description, lessonId, dueDate: dueDate || null }, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create assignment' }, 500);
  }
});

// POST /api/teacher/lessons
app.post('/api/teacher/lessons', authenticate, requireRole('teacher', 'admin'), async (c) => {
  // Reuse the lesson creation logic
  const data = await c.req.json();
  const id = generateId();
  await execute(c.env.DB,
    'INSERT INTO lessons (id, title, description, category, difficulty, content, "order", xp_reward, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id, data.title, data.description, data.category || 'python', data.difficulty || 'easy',
    data.content, data.order || 1, data.xpReward || 50, c.user.id
  );
  return c.json({ id, ...data }, 201);
});

// ═══════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: now(),
    message: 'VIK IDE API is running — VIKco community online.'
  });
});

// 404 handler
app.notFound((c) => c.json({ error: 'Route not found' }, 404));

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
