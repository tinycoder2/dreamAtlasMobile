import type { SQLiteDatabase } from 'expo-sqlite';

import type { DayLog, DayLogDraft } from '@/types/day-log';
import type { Dream, DreamDraft, DreamType, Mood } from '@/types/dream';

const DATABASE_VERSION = 3;

interface DreamRow {
  id: number;
  date: string;
  text: string;
  mood: string | null;
  dream_type: string | null;
  tags: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface DayLogRow {
  date: string;
  sleep_hours: number | null;
  sleep_quality: string | null;
  created_at: string;
  updated_at: string;
}

function rowToDream(row: DreamRow): Dream {
  return {
    id: row.id,
    date: row.date,
    text: row.text,
    mood: row.mood as Dream['mood'],
    dreamType: row.dream_type as Dream['dreamType'],
    tags: JSON.parse(row.tags) as string[],
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToDayLog(row: DayLogRow): DayLog {
  return {
    date: row.date,
    sleepHours: row.sleep_hours,
    sleepQuality: row.sleep_quality as DayLog['sleepQuality'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = result?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS dreams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        text TEXT NOT NULL,
        sleep_hours REAL,
        mood TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_dreams_date ON dreams(date);
    `);
    currentDbVersion = 1;
  }

  if (currentDbVersion === 1) {
    await db.execAsync(`
      BEGIN;
      CREATE TABLE dreams_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        text TEXT NOT NULL,
        sleep_hours REAL,
        mood TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO dreams_new SELECT * FROM dreams;
      DROP TABLE dreams;
      ALTER TABLE dreams_new RENAME TO dreams;
      DROP INDEX IF EXISTS idx_dreams_date;
      CREATE INDEX IF NOT EXISTS idx_dreams_date ON dreams(date);
      COMMIT;
    `);
    currentDbVersion = 2;
  }

  if (currentDbVersion === 2) {
    // Sleep hours/quality move from per-dream to per-day (day_logs). Dreams
    // gain dream_type (a fixed field, separate from mood) and sort_order
    // (for drag-to-reorder within a day).
    await db.execAsync(`
      BEGIN;
      CREATE TABLE day_logs (
        date TEXT PRIMARY KEY,
        sleep_hours REAL,
        sleep_quality TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO day_logs (date, sleep_hours, created_at, updated_at)
        SELECT date, MAX(sleep_hours), datetime('now'), datetime('now')
        FROM dreams
        GROUP BY date;

      CREATE TABLE dreams_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        text TEXT NOT NULL,
        mood TEXT,
        dream_type TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO dreams_new (id, date, text, mood, tags, sort_order, created_at, updated_at)
        SELECT id, date, text, mood, tags,
          (ROW_NUMBER() OVER (PARTITION BY date ORDER BY created_at ASC)) - 1,
          created_at, updated_at
        FROM dreams;
      DROP TABLE dreams;
      ALTER TABLE dreams_new RENAME TO dreams;
      DROP INDEX IF EXISTS idx_dreams_date;
      CREATE INDEX IF NOT EXISTS idx_dreams_date ON dreams(date);
      COMMIT;
    `);
    currentDbVersion = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${currentDbVersion}`);
}

export async function getDreamDates(db: SQLiteDatabase): Promise<string[]> {
  const rows = await db.getAllAsync<{ date: string }>('SELECT DISTINCT date FROM dreams');
  return rows.map((row) => row.date);
}

export async function getDreamsByDate(db: SQLiteDatabase, date: string): Promise<Dream[]> {
  const rows = await db.getAllAsync<DreamRow>(
    'SELECT * FROM dreams WHERE date = ? ORDER BY sort_order ASC',
    [date]
  );
  return rows.map(rowToDream);
}

export async function createDream(db: SQLiteDatabase, draft: DreamDraft): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO dreams (date, text, mood, dream_type, tags, sort_order, updated_at)
     VALUES (
       $date, $text, $mood, $dreamType, $tags,
       (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM dreams WHERE date = $date),
       datetime('now')
     )`,
    {
      $date: draft.date,
      $text: draft.text,
      $mood: draft.mood,
      $dreamType: draft.dreamType,
      $tags: JSON.stringify(draft.tags),
    }
  );
  return result.lastInsertRowId;
}

export async function updateDream(
  db: SQLiteDatabase,
  id: number,
  draft: DreamDraft
): Promise<void> {
  await db.runAsync(
    `UPDATE dreams SET
       date = $date, text = $text, mood = $mood, dream_type = $dreamType,
       tags = $tags, updated_at = datetime('now')
     WHERE id = $id`,
    {
      $id: id,
      $date: draft.date,
      $text: draft.text,
      $mood: draft.mood,
      $dreamType: draft.dreamType,
      $tags: JSON.stringify(draft.tags),
    }
  );
}

export async function deleteDream(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM dreams WHERE id = ?', [id]);
}

export async function reorderDreams(
  db: SQLiteDatabase,
  orderedIds: number[]
): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (let i = 0; i < orderedIds.length; i++) {
      await db.runAsync('UPDATE dreams SET sort_order = ? WHERE id = ?', [i, orderedIds[i]]);
    }
  });
}

export async function getAllDreams(db: SQLiteDatabase): Promise<Dream[]> {
  const rows = await db.getAllAsync<DreamRow>(
    'SELECT * FROM dreams ORDER BY date DESC, sort_order ASC'
  );
  return rows.map(rowToDream);
}

export async function searchDreams(
  db: SQLiteDatabase,
  filters: { text?: string; mood?: Mood | null; dreamType?: DreamType | null; tag?: string }
): Promise<Dream[]> {
  const clauses: string[] = [];
  const params: Record<string, string> = {};

  if (filters.text) {
    clauses.push('text LIKE $text');
    params.$text = `%${filters.text}%`;
  }
  if (filters.mood) {
    clauses.push('mood = $mood');
    params.$mood = filters.mood;
  }
  if (filters.dreamType) {
    clauses.push('dream_type = $dreamType');
    params.$dreamType = filters.dreamType;
  }
  if (filters.tag) {
    clauses.push('tags LIKE $tag');
    params.$tag = `%"${filters.tag}"%`;
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await db.getAllAsync<DreamRow>(
    `SELECT * FROM dreams ${where} ORDER BY date DESC, sort_order ASC`,
    params
  );
  return rows.map(rowToDream);
}

export async function getRecentTags(db: SQLiteDatabase, limit = 12): Promise<string[]> {
  const rows = await db.getAllAsync<{ tags: string }>(
    'SELECT tags FROM dreams ORDER BY updated_at DESC LIMIT 50'
  );
  const seen = new Set<string>();
  for (const row of rows) {
    for (const tag of JSON.parse(row.tags) as string[]) {
      seen.add(tag);
      if (seen.size >= limit) return Array.from(seen);
    }
  }
  return Array.from(seen);
}

export async function getDayLog(db: SQLiteDatabase, date: string): Promise<DayLog | null> {
  const row = await db.getFirstAsync<DayLogRow>('SELECT * FROM day_logs WHERE date = ?', [date]);
  return row ? rowToDayLog(row) : null;
}

export async function upsertDayLog(
  db: SQLiteDatabase,
  draft: DayLogDraft
): Promise<void> {
  await db.runAsync(
    `INSERT INTO day_logs (date, sleep_hours, sleep_quality, updated_at)
     VALUES ($date, $sleepHours, $sleepQuality, datetime('now'))
     ON CONFLICT(date) DO UPDATE SET
       sleep_hours = excluded.sleep_hours,
       sleep_quality = excluded.sleep_quality,
       updated_at = excluded.updated_at`,
    {
      $date: draft.date,
      $sleepHours: draft.sleepHours,
      $sleepQuality: draft.sleepQuality,
    }
  );
}
