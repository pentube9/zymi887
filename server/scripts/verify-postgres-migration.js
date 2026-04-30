import Database from 'better-sqlite3';
import { query, getPostgresPool, initPostgres, closePostgres, testConnection } from '../db/postgres.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_DB_PATH = path.join(__dirname, '..', 'ovyo.db');

async function getRowCounts(sqliteDb) {
  const tables = ['users', 'messages', 'blocked_users', 'message_reports', 'call_history', 'admin_audit_logs', 'metrics'];
  const counts = {};
  
  for (const table of tables) {
    try {
      const result = sqliteDb.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      counts[table] = result?.count || 0;
    } catch (err) {
      counts[table] = 0;
    }
  }
  
  return counts;
}

async function verifyPostgresCounts(postgresPool) {
  const tables = ['users', 'messages', 'blocked_users', 'message_reports', 'call_history', 'admin_audit_logs', 'metrics'];
  const counts = {};
  
  for (const table of tables) {
    try {
      const result = await postgresPool.query(`SELECT COUNT(*) as count FROM ${table}`);
      counts[table] = parseInt(result.rows[0]?.count || 0);
    } catch (err) {
      counts[table] = 0;
    }
  }
  
  return counts;
}

async function runVerification() {
  console.log('='.repeat(60));
  console.log('PostgreSQL Migration Verification');
  console.log('='.repeat(60));
  console.log('');
  
  try {
    await initPostgres();
    
    const testResult = await testConnection();
    if (!testResult.connected) {
      console.log('[ERROR] PostgreSQL not available:', testResult.error);
      console.log('');
      console.log('To run this verification:');
      console.log('1. Start PostgreSQL: docker compose up -d postgres');
      console.log('2. Run migration: node scripts/migrate-sqlite-to-postgres.js');
      console.log('3. Run verification: node scripts/verify-postgres-migration.js');
      process.exit(1);
    }
    
    console.log('[INFO] PostgreSQL connected');
    
    if (!fs.existsSync(SQLITE_DB_PATH)) {
      console.log('[WARN] SQLite database not found at:', SQLITE_DB_PATH);
      console.log('[INFO] Skipping SQLite comparison');
      const pgCounts = await verifyPostgresCounts(getPostgresPool());
      console.log('\nPostgreSQL counts:');
      console.log(JSON.stringify(pgCounts, null, 2));
      await closePostgres();
      process.exit(0);
    }
    
    const sqliteDb = new Database(SQLITE_DB_PATH);
    sqliteDb.pragma('journal_mode = WAL');
    
    const sqliteCounts = await getRowCounts(sqliteDb);
    console.log('\nSQLite counts:');
    console.log(JSON.stringify(sqliteCounts, null, 2));
    
    const pgCounts = await verifyPostgresCounts(getPostgresPool());
    console.log('\nPostgreSQL counts:');
    console.log(JSON.stringify(pgCounts, null, 2));
    
    console.log('\nVerification:');
    console.log('-'.repeat(40));
    
    const results = [];
    for (const table of Object.keys(sqliteCounts)) {
      const sqlite = sqliteCounts[table];
      const pg = pgCounts[table];
      const match = sqlite === pg;
      results.push({ table, sqlite, postgres: pg, match });
      console.log(`  ${table}: SQLite=${sqlite}, PostgreSQL=${pg} ${match ? '✓' : '⚠ MISMATCH'}`);
    }
    
    sqliteDb.close();
    await closePostgres();
    
    console.log('\n' + '='.repeat(60));
    
    const allMatch = results.every(r => r.match);
    if (allMatch) {
      console.log('RESULT: All row counts match! ✓');
    } else {
      console.log('RESULT: Some row counts do not match');
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('[ERROR]', error.message);
    process.exit(1);
  }
}

runVerification().catch(console.error);