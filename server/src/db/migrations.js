import bcrypt from 'bcryptjs';
import { exec, get, all, run } from './database.js';

const tableExists = (tableName) => {
  const result = get("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", tableName);
  return !!result;
};

const columnExists = (tableName, columnName) => {
  if (!tableExists(tableName)) return false;
  const columns = all(`PRAGMA table_info(${tableName})`);
  return columns.some(col => col.name === columnName);
};

export const runMigrations = () => {
  console.log('[MIGRATION] Starting database migrations...');
  
  if (!tableExists('users')) {
    exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_banned INTEGER DEFAULT 0,
        banned_at DATETIME
      )
    `);
    console.log('[MIGRATION] Created users table');
  }
  
  if (!columnExists('users', 'role')) {
    exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
    console.log('[MIGRATION] Added role column to users');
  }
  
  if (!columnExists('users', 'is_banned')) {
    exec("ALTER TABLE users ADD COLUMN is_banned INTEGER DEFAULT 0");
    console.log('[MIGRATION] Added is_banned column to users');
  }
  
   if (!columnExists('users', 'banned_at')) {
     exec("ALTER TABLE users ADD COLUMN banned_at DATETIME");
     console.log('[MIGRATION] Added banned_at column to users');
   }

   if (!columnExists('users', 'avatar')) {
     exec("ALTER TABLE users ADD COLUMN avatar TEXT");
     console.log('[MIGRATION] Added avatar column to users');
   }

   if (!columnExists('users', 'token_version')) {
     exec("ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added token_version column to users');
   }

   if (!columnExists('users', 'notification_sound')) {
     exec("ALTER TABLE users ADD COLUMN notification_sound INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added notification_sound column to users');
   }

   if (!columnExists('users', 'call_ringtone')) {
     exec("ALTER TABLE users ADD COLUMN call_ringtone INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added call_ringtone column to users');
   }

   if (!columnExists('users', 'theme')) {
     exec("ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'dark'");
     console.log('[MIGRATION] Added theme column to users');
   }

   if (!columnExists('users', 'online_visibility')) {
     exec("ALTER TABLE users ADD COLUMN online_visibility INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added online_visibility column to users');
   }

   if (!columnExists('users', 'read_receipt')) {
     exec("ALTER TABLE users ADD COLUMN read_receipt INTEGER DEFAULT 1");
     console.log('[MIGRATION] Added read_receipt column to users');
   }

   if (!columnExists('users', 'country')) {
     exec("ALTER TABLE users ADD COLUMN country TEXT");
     console.log('[MIGRATION] Added country column to users');
   }

   if (!columnExists('users', 'city')) {
     exec("ALTER TABLE users ADD COLUMN city TEXT");
     console.log('[MIGRATION] Added city column to users');
   }
  
  if (!tableExists('messages')) {
    exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read INTEGER DEFAULT 0,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )
    `);
    console.log('[MIGRATION] Created messages table');
  }
  
   if (!columnExists('messages', 'is_read')) {
     exec("ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0");
     console.log('[MIGRATION] Added is_read column to messages');
   }

   if (!columnExists('messages', 'is_hidden')) {
     exec("ALTER TABLE messages ADD COLUMN is_hidden INTEGER DEFAULT 0");
     console.log('[MIGRATION] Added is_hidden column to messages');
   }

   if (!columnExists('messages', 'deleted_at')) {
     exec("ALTER TABLE messages ADD COLUMN deleted_at DATETIME");
     console.log('[MIGRATION] Added deleted_at column to messages');
   }

   if (!columnExists('messages', 'deleted_by')) {
     exec("ALTER TABLE messages ADD COLUMN deleted_by INTEGER");
     console.log('[MIGRATION] Added deleted_by column to messages');
   }

   if (!columnExists('messages', 'edited_at')) {
     exec("ALTER TABLE messages ADD COLUMN edited_at DATETIME");
     console.log('[MIGRATION] Added edited_at column to messages');
   }

if (!columnExists('messages', 'previous_content')) {
      exec("ALTER TABLE messages ADD COLUMN previous_content TEXT");
      console.log('[MIGRATION] Added previous_content column to messages');
    }

    if (!columnExists('messages', 'message_type')) {
      exec("ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text'");
      console.log('[MIGRATION] Added message_type column to messages');
    }

    if (!columnExists('messages', 'file_url')) {
      exec("ALTER TABLE messages ADD COLUMN file_url TEXT");
      console.log('[MIGRATION] Added file_url column to messages');
    }

    if (!columnExists('messages', 'file_name')) {
      exec("ALTER TABLE messages ADD COLUMN file_name TEXT");
      console.log('[MIGRATION] Added file_name column to messages');
    }

    if (!columnExists('messages', 'file_size')) {
      exec("ALTER TABLE messages ADD COLUMN file_size INTEGER");
      console.log('[MIGRATION] Added file_size column to messages');
    }

    if (!columnExists('messages', 'mime_type')) {
      exec("ALTER TABLE messages ADD COLUMN mime_type TEXT");
      console.log('[MIGRATION] Added mime_type column to messages');
    }

    if (!columnExists('messages', 'location_lat')) {
      exec("ALTER TABLE messages ADD COLUMN location_lat REAL");
      console.log('[MIGRATION] Added location_lat column to messages');
    }

    if (!columnExists('messages', 'location_lng')) {
      exec("ALTER TABLE messages ADD COLUMN location_lng REAL");
      console.log('[MIGRATION] Added location_lng column to messages');
    }
  
  if (!tableExists('admin_audit_logs')) {
    exec(`
      CREATE TABLE IF NOT EXISTS admin_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        target_user_id INTEGER,
        details TEXT,
        ip_address TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Created admin_audit_logs table');
  }

  if (!tableExists('feature_flags')) {
    exec(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_key TEXT UNIQUE NOT NULL,
        enabled INTEGER DEFAULT 0,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Created feature_flags table');
    
    // Seed initial flags
    const flags = [
      ['nearby_enabled', 0, 'Discover users in proximity'],
      ['file_sharing_enabled', 1, 'Allow users to send files'],
      ['video_call_enabled', 1, 'Real-time video communication'],
      ['audio_call_enabled', 1, 'Real-time voice communication'],
      ['location_sharing_enabled', 1, 'Share map pins in chat'],
      ['ai_analysis_enabled', 1, 'AI-powered chat insights'],
      ['report_system_enabled', 1, 'User complaint system']
    ];
    
    flags.forEach(([key, enabled, desc]) => {
      run("INSERT INTO feature_flags (feature_key, enabled, description) VALUES (?, ?, ?)", key, enabled, desc);
    });
  }

  if (!tableExists('feature_geo_rules')) {
    exec(`
      CREATE TABLE IF NOT EXISTS feature_geo_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_key TEXT NOT NULL,
        country_code TEXT,
        city_name TEXT,
        enabled INTEGER DEFAULT 1,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feature_key) REFERENCES feature_flags(feature_key)
      )
    `);
    console.log('[MIGRATION] Created feature_geo_rules table');
  }

  if (!tableExists('feature_user_rules')) {
    exec(`
      CREATE TABLE IF NOT EXISTS feature_user_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        feature_key TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        enabled INTEGER DEFAULT 1,
        reason TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (feature_key) REFERENCES feature_flags(feature_key)
      )
    `);
    console.log('[MIGRATION] Created feature_user_rules table');
  }

  if (!tableExists('user_reports')) {
    exec(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        target_user_id INTEGER NOT NULL,
        feature_key TEXT,
        country_code TEXT,
        city_name TEXT,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        admin_note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Created user_reports table');
  }

  if (!tableExists('user_location_preferences')) {
    exec(`
      CREATE TABLE IF NOT EXISTS user_location_preferences (
        user_id INTEGER PRIMARY KEY,
        discovery_enabled INTEGER DEFAULT 0,
        radius_km INTEGER DEFAULT 5,
        approximate_only INTEGER DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('[MIGRATION] Created user_location_preferences table');
  }

  if (!tableExists('nearby_visibility')) {
    exec(`
      CREATE TABLE IF NOT EXISTS nearby_visibility (
        user_id INTEGER PRIMARY KEY,
        lat REAL,
        lng REAL,
        country_code TEXT,
        city_name TEXT,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('[MIGRATION] Created nearby_visibility table');
  }

  if (!tableExists('nearby_reports')) {
    exec(`
      CREATE TABLE IF NOT EXISTS nearby_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id INTEGER NOT NULL,
        target_id INTEGER NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id),
        FOREIGN KEY (target_id) REFERENCES users(id)
      )
    `);
    console.log('[MIGRATION] Created nearby_reports table');
  }

  if (!tableExists('nearby_blocks')) {
    exec(`
      CREATE TABLE IF NOT EXISTS nearby_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        blocked_user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (blocked_user_id) REFERENCES users(id),
        UNIQUE(user_id, blocked_user_id)
      )
    `);
    console.log('[MIGRATION] Created nearby_blocks table');
  }

  if (!tableExists('nearby_global_settings')) {
    exec(`
      CREATE TABLE IF NOT EXISTS nearby_global_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        default_radius_km INTEGER DEFAULT 5,
        report_threshold INTEGER DEFAULT 3,
        approximate_only INTEGER DEFAULT 1,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    exec('INSERT OR IGNORE INTO nearby_global_settings (id, default_radius_km, report_threshold, approximate_only) VALUES (1, 5, 3, 1)');
    console.log('[MIGRATION] Created nearby_global_settings table');
  }

  // ZRCS - Ad Control Tables
  if (!tableExists('ad_global_settings')) {
    exec(`
      CREATE TABLE IF NOT EXISTS ad_global_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        ads_enabled INTEGER DEFAULT 1,
        test_mode INTEGER DEFAULT 0,
        active_network TEXT DEFAULT 'admob',
        fallback_network TEXT DEFAULT 'applovin',
        interstitial_gap_seconds INTEGER DEFAULT 1800,
        native_refresh_seconds INTEGER DEFAULT 60,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    exec("INSERT OR IGNORE INTO ad_global_settings (id, ads_enabled, test_mode, active_network) VALUES (1, 1, 0, 'admob')");
    console.log('[MIGRATION] Created ad_global_settings table');
  }

  if (!tableExists('ad_network_configs')) {
    exec(`
      CREATE TABLE IF NOT EXISTS ad_network_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        network_key TEXT UNIQUE NOT NULL,
        sdk_key TEXT,
        app_id TEXT,
        interstitial_id TEXT,
        native_id TEXT,
        rewarded_id TEXT,
        banner_id TEXT,
        is_active INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const networks = ['admob', 'meta', 'applovin', 'pangle', 'inmobi'];
    networks.forEach(net => {
      run("INSERT OR IGNORE INTO ad_network_configs (network_key) VALUES (?)", net);
    });
    console.log('[MIGRATION] Created ad_network_configs table');
  }

  if (!tableExists('ad_placements')) {
    exec(`
      CREATE TABLE IF NOT EXISTS ad_placements (
        placement_key TEXT PRIMARY KEY,
        enabled INTEGER DEFAULT 1,
        min_delay_seconds INTEGER DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    const placements = [
      ['app_open', 1],
      ['chat_list_native', 1],
      ['call_end_interstitial', 1],
      ['settings_banner', 0],
      ['rewarded_unlock', 1]
    ];
    placements.forEach(([key, enabled]) => {
      run("INSERT OR IGNORE INTO ad_placements (placement_key, enabled) VALUES (?, ?)", key, enabled);
    });
    console.log('[MIGRATION] Created ad_placements table');
  }

  if (!tableExists('ad_country_rules')) {
    exec(`
      CREATE TABLE IF NOT EXISTS ad_country_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        country_code TEXT NOT NULL,
        ads_enabled INTEGER DEFAULT 1,
        network_override TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Created ad_country_rules table');
  }

  if (!tableExists('ad_version_rules')) {
    exec(`
      CREATE TABLE IF NOT EXISTS ad_version_rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        app_version TEXT NOT NULL,
        ads_enabled INTEGER DEFAULT 1,
        force_update INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Created ad_version_rules table');
  }

  if (!tableExists('ad_config_audit_logs')) {
    exec(`
      CREATE TABLE IF NOT EXISTS ad_config_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER,
        action TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        changed_section TEXT,
        risk_level TEXT DEFAULT 'LOW',
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[MIGRATION] Created ad_config_audit_logs table');
  } else {
    // Add new columns if they don't exist
    if (!columnExists('ad_config_audit_logs', 'old_value')) {
      exec("ALTER TABLE ad_config_audit_logs ADD COLUMN old_value TEXT");
    }
    if (!columnExists('ad_config_audit_logs', 'new_value')) {
      exec("ALTER TABLE ad_config_audit_logs ADD COLUMN new_value TEXT");
    }
    if (!columnExists('ad_config_audit_logs', 'changed_section')) {
      exec("ALTER TABLE ad_config_audit_logs ADD COLUMN changed_section TEXT");
    }
    if (!columnExists('ad_config_audit_logs', 'risk_level')) {
      exec("ALTER TABLE ad_config_audit_logs ADD COLUMN risk_level TEXT DEFAULT 'LOW'");
    }
  }

  console.log('[MIGRATION] Database migrations complete');
};

export const getMigrationStatus = () => {
  const migrations = [];
  
  migrations.push({ name: 'users table', exists: tableExists('users') });
  migrations.push({ name: 'messages table', exists: tableExists('messages') });
  migrations.push({ name: 'admin_audit_logs table', exists: tableExists('admin_audit_logs') });
  migrations.push({ name: 'users.role column', exists: columnExists('users', 'role') });
  migrations.push({ name: 'users.is_banned column', exists: columnExists('users', 'is_banned') });
  migrations.push({ name: 'messages.is_read column', exists: columnExists('messages', 'is_read') });
  
  return migrations;
};