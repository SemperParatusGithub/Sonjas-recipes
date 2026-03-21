import Database from 'better-sqlite3';
import path from 'path';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'dev.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS Recipe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN ('breakfast', 'main', 'side', 'dessert', 'other')),
    tags TEXT DEFAULT '[]',
    prepTimeMin INTEGER,
    cookTimeMin INTEGER,
    bakeTimeMin INTEGER,
    portions INTEGER,
    difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
    imageUrl TEXT,
    ingredients TEXT DEFAULT '[]',
    steps TEXT DEFAULT '[]',
    tip TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migration: ensure new columns exist (for existing databases)
try {
  db.exec(`ALTER TABLE Recipe ADD COLUMN bakeTimeMin INTEGER`);
} catch (e) {
  // Column already exists
}

// Auth schema
db.exec(`
  CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY,
    userId INTEGER NOT NULL,
    expiresAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
  )
`);

export default db;

// --- Auth helpers ---

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSession(userId: number): string {
  const id = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  db.prepare('INSERT INTO Session (id, userId, expiresAt) VALUES (?, ?, ?)').run(id, userId, expiresAt);
  return id;
}

export function getSession(sessionId: string): { userId: number; email: string } | null {
  if (!sessionId) return null;
  const session = db.prepare(
    `SELECT s.userId, u.email FROM Session s JOIN User u ON u.id = s.userId WHERE s.id = ? AND s.expiresAt > datetime('now')`
  ).get(sessionId) as { userId: number; email: string } | undefined;
  return session || null;
}

export function deleteSession(sessionId: string): void {
  db.prepare('DELETE FROM Session WHERE id = ?').run(sessionId);
}

export async function createUser(email: string, password: string, name?: string): Promise<{ id: number } | { error: string }> {
  const existing = db.prepare('SELECT id FROM User WHERE email = ?').get(email);
  if (existing) {
    return { error: 'Email already registered' };
  }
  const passwordHash = await hashPassword(password);
  const result = db.prepare('INSERT INTO User (email, passwordHash, name) VALUES (?, ?, ?)').run(email, passwordHash, name || null);
  return { id: Number(result.lastInsertRowid) };
}

export function getUserByEmail(email: string) {
  return db.prepare('SELECT * FROM User WHERE email = ?').get(email) as { id: number; email: string; passwordHash: string; name: string } | undefined;
}

// --- Recipe helpers ---

export interface Recipe {
  id: number;
  slug: string;
  title: string;
  description?: string;
  category: 'breakfast' | 'main' | 'side' | 'dessert' | 'other';
  tags: string[];
  prepTimeMin?: number;
  cookTimeMin?: number;
  bakeTimeMin?: number;
  portions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  ingredients: [string, string][];
  steps: string[];
  tip?: string;
  createdAt: string;
  updatedAt: string;
}

export function parseRecipe(row: any): Recipe {
  let ingredients = [];
  let tags = [];
  let steps = [];
  
  try {
    ingredients = JSON.parse(row.ingredients || '[]');
    if (ingredients.length > 0 && typeof ingredients[0] === 'string') {
      ingredients = (ingredients as string[]).map((item: string) => ['', item]);
    }
  } catch { ingredients = []; }
  
  try {
    tags = JSON.parse(row.tags || '[]');
  } catch { tags = []; }
  
  try {
    steps = JSON.parse(row.steps || '[]');
  } catch { steps = []; }
  
  return {
    ...row,
    ingredients,
    tags,
    steps,
  };
}
