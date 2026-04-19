import Database from 'better-sqlite3';
import path from 'path';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'dev.db');

// Ensure data directory exists
import { mkdirSync } from 'fs';
try { mkdirSync(path.dirname(dbPath), { recursive: true }); } catch {}

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// --- Category migration: recreate Recipe table with new categories if old schema detected ---
const oldSchema = db.prepare(
  `SELECT sql FROM sqlite_schema WHERE type='table' AND name='Recipe' AND sql LIKE '%breakfast%'`
).get() as { sql: string } | undefined;

if (oldSchema) {
  db.exec(`
    BEGIN;
    CREATE TABLE IF NOT EXISTS Recipe_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK(category IN ('main', 'soup', 'dessert', 'salad')),
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
    );
    INSERT INTO Recipe_new
      SELECT id, slug, title, description,
        CASE category
          WHEN 'main'      THEN 'main'
          WHEN 'dessert'   THEN 'dessert'
          WHEN 'breakfast' THEN 'main'
          WHEN 'side'      THEN 'salad'
          ELSE 'main'
        END,
        tags, prepTimeMin, cookTimeMin, bakeTimeMin, portions, difficulty,
        imageUrl, ingredients, steps, tip, createdAt, updatedAt
      FROM Recipe;
    DROP TABLE Recipe;
    ALTER TABLE Recipe_new RENAME TO Recipe;
    COMMIT;
  `);
} else {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Recipe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL CHECK(category IN ('main', 'soup', 'dessert', 'salad')),
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

// Seed default user on startup (async fire-and-forget)
async function seedDefaultUser() {
  const existing = db.prepare('SELECT id FROM User WHERE email = ?').get('sonja');
  if (!existing) {
    const hash = await bcrypt.hash('kitchen', 10);
    db.prepare('INSERT INTO User (email, passwordHash, name) VALUES (?, ?, ?)').run('sonja', hash, 'Sonja');
  }
}
seedDefaultUser().catch(console.error);

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
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
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
  if (existing) return { error: 'Email already registered' };
  const passwordHash = await hashPassword(password);
  const result = db.prepare('INSERT INTO User (email, passwordHash, name) VALUES (?, ?, ?)').run(email, passwordHash, name || null);
  return { id: Number(result.lastInsertRowid) };
}

export function getUserByEmail(email: string) {
  return db.prepare('SELECT * FROM User WHERE email = ?').get(email) as { id: number; email: string; passwordHash: string; name: string } | undefined;
}

// --- Recipe helpers ---

export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

export interface Recipe {
  id: number;
  slug: string;
  title: string;
  description?: string;
  category: 'main' | 'soup' | 'dessert' | 'salad';
  tags: string[];
  prepTimeMin?: number;
  cookTimeMin?: number;
  bakeTimeMin?: number;
  portions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  ingredients: Ingredient[];
  steps: string[];
  tip?: string;
  createdAt: string;
  updatedAt: string;
}

export function getRecipe(slug: string): Recipe | null {
  const row = db.prepare('SELECT * FROM Recipe WHERE slug = ?').get(slug);
  return row ? parseRecipe(row) : null;
}

export function getAllRecipes(): Recipe[] {
  const rows = db.prepare('SELECT * FROM Recipe ORDER BY id DESC').all();
  return rows.map(parseRecipe);
}

export function parseRecipe(row: any): Recipe {
  let ingredients: Ingredient[] = [];
  let tags: string[] = [];
  let steps: string[] = [];

  try {
    const raw = JSON.parse(row.ingredients || '[]');
    if (Array.isArray(raw)) {
      ingredients = raw.map((item: any) => {
        if (typeof item === 'object' && item !== null && 'name' in item) {
          return { amount: item.amount || '', unit: item.unit || '', name: item.name || '' };
        }
        if (Array.isArray(item)) {
          if (item.length >= 3) return { amount: item[0] || '', unit: item[1] || '', name: item[2] || '' };
          if (item.length === 2) return { amount: item[0] || '', unit: '', name: item[1] || '' };
          return { amount: '', unit: '', name: item[0] || '' };
        }
        return { amount: '', unit: '', name: String(item) };
      });
    }
  } catch { ingredients = []; }

  try { tags = JSON.parse(row.tags || '[]'); } catch { tags = []; }
  try { steps = JSON.parse(row.steps || '[]'); } catch { steps = []; }

  return { ...row, ingredients, tags, steps };
}
