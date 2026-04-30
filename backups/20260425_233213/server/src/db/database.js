import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export const initDatabase = (dbName = 'zymi.db') => {
  if (db) return db;
  
  db = new Database(path.join(__dirname, '..', dbName));
  db.pragma('journal_mode = WAL');
  return db;
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

export const closeDatabase = () => {
  if (db) {
    db.close();
    db = null;
  }
};

export const prepare = (sql) => getDatabase().prepare(sql);
export const exec = (sql) => getDatabase().exec(sql);
export const get = (sql, ...params) => prepare(sql).get(...params);
export const all = (sql, ...params) => prepare(sql).all(...params);
export const run = (sql, ...params) => prepare(sql).run(...params);