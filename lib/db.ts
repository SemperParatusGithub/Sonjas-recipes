// lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

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

export default db;

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
    // Support legacy format: flat array of strings
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
