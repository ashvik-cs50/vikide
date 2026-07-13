import { jwtVerify } from 'jose';

/**
 * Verify a JWT token and return the payload
 */
async function verifyToken(token, secret) {
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    return payload;
  } catch {
    return null;
  }
}

/**
 * Hash a password using PBKDF2 (Web Crypto API)
 * Returns: base64(salt):base64(hash)
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );

  const saltB64 = btoa(String.fromCharCode(...salt));
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return `${saltB64}:${hashB64}`;
}

/**
 * Verify a password against a stored hash:salt string
 */
export async function verifyPassword(password, stored) {
  const [saltB64, hashB64] = stored.split(':');
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hash = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    key,
    256
  );

  const computedB64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
  return computedB64 === hashB64;
}

/**
 * Auth middleware - extracts and verifies JWT from Authorization header
 * Sets c.user if valid, returns 401 otherwise
 */
export async function authenticate(c, next) {
  const auth = c.req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  const token = auth.slice(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET);

  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Check session exists in DB
  const session = await c.env.DB.prepare(
    'SELECT user_id FROM login_sessions WHERE token = ? AND expires_at > datetime(\'now\')'
  ).bind(token).first();

  if (!session) {
    return c.json({ error: 'Session expired' }, 401);
  }

  // Get user data
  const user = await c.env.DB.prepare(
    'SELECT id, username, email, display_name, profile_picture, role, xp, level, streak FROM users WHERE id = ?'
  ).bind(session.user_id).first();

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  c.user = user;
  c.token = token;
  await next();
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...roles) {
  return async (c, next) => {
    if (!c.user) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    if (!roles.includes(c.user.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }
    await next();
  };
}
