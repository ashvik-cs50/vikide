// Database helpers for Vik IDE on D1 (SQLite)

/**
 * Run a query that returns all matching rows
 */
export async function queryAll(db, sql, ...bind) {
  const stmt = db.prepare(sql);
  if (bind.length > 0) stmt.bind(...bind);
  const { results } = await stmt.all();
  return results || [];
}

/**
 * Run a query that returns a single row (or null)
 */
export async function queryOne(db, sql, ...bind) {
  const stmt = db.prepare(sql);
  if (bind.length > 0) stmt.bind(...bind);
  return await stmt.first();
}

/**
 * Run a write query (INSERT, UPDATE, DELETE) - returns D1 result
 */
export async function execute(db, sql, ...bind) {
  const stmt = db.prepare(sql);
  if (bind.length > 0) stmt.bind(...bind);
  return await stmt.run();
}

/**
 * Generate a simple CUID-like ID using crypto
 */
export function generateId() {
  const timestamp = Date.now().toString(36);
  const random = crypto.getRandomValues(new Uint8Array(12));
  let randStr = '';
  for (let i = 0; i < 12; i++) {
    randStr += random[i].toString(36).padStart(2, '0');
  }
  return `c${timestamp}${randStr}`;
}

/**
 * Get current UTC timestamp string
 */
export function now() {
  return new Date().toISOString();
}
