-- PostgreSQL Initial Schema Migration
-- Phase 5-compatible schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(255),
    name VARCHAR(255),
    avatar TEXT,
    role VARCHAR(50) DEFAULT 'user',
    is_banned BOOLEAN DEFAULT false,
    banned_at TIMESTAMP,
    token_version INTEGER DEFAULT 1,
    notification_sound BOOLEAN DEFAULT true,
    call_ringtone BOOLEAN DEFAULT true,
    theme VARCHAR(50) DEFAULT 'dark',
    online_visibility BOOLEAN DEFAULT true,
    read_receipt BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by INTEGER REFERENCES users(id),
    edited_at TIMESTAMP,
    previous_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blocked users table
CREATE TABLE IF NOT EXISTS blocked_users (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER NOT NULL REFERENCES users(id),
    blocked_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_user_id)
);

-- Message reports table
CREATE TABLE IF NOT EXISTS message_reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id),
    message_id INTEGER NOT NULL REFERENCES messages(id),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Call history table
CREATE TABLE IF NOT EXISTS call_history (
    id SERIAL PRIMARY KEY,
    caller_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    call_type VARCHAR(50) DEFAULT 'audio',
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0
);

-- Admin audit logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    target_user_id INTEGER REFERENCES users(id),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QA test runs table
CREATE TABLE IF NOT EXISTS qa_test_runs (
    id SERIAL PRIMARY KEY,
    test_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    passed BOOLEAN DEFAULT false,
    error_message TEXT,
    run_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
    key VARCHAR(255) PRIMARY KEY,
    value INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin seed
INSERT INTO users (username, password, role, is_banned) 
SELECT 'admin', '$2a$10$TEST_PLACEHOLDER', 'super_admin', false
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'super_admin');

-- Phase 6: Add QA columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS qa_phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS qa_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qa_verified_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qa_notes TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS qa_test_mode BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS qa_test_ref VARCHAR(255);
ALTER TABLE call_history ADD COLUMN IF NOT EXISTS qa_test_ref VARCHAR(255);

-- Phase 6: Add last_seen tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP;

-- Phase 6: Add message reactions support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reactions JSONB;

-- Phase 6: Add message attachments
ALTER TABLE messages ADD COLUMN IF NOT EXISTS attachments JSONB;

-- Phase 6: Add call quality metrics
ALTER TABLE call_history ADD COLUMN IF NOT EXISTS quality_score INTEGER;
ALTER TABLE call_history ADD COLUMN IF NOT EXISTS connection_type VARCHAR(50);

-- Phase 6: Add user preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50) DEFAULT 'any';
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'UTC';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';

-- Phase 6: Add privacy settings
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_last_seen BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_read_receipt BOOLEAN DEFAULT true;

-- Phase 6: Add advanced call features
ALTER TABLE call_history ADD COLUMN IF NOT EXISTS ringing_duration INTEGER DEFAULT 0;
ALTER TABLE call_history ADD COLUMN IF NOT EXISTS call_attempt_count INTEGER DEFAULT 0;
ALTER TABLE call_history ADD COLUMN IF NOT EXISTS p2p_mode BOOLEAN DEFAULT true;

-- Phase 6: Add analytics
ALTER TABLE messages ADD COLUMN IF NOT EXISTS qa_client_timestamp TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS qa_server_processing_time INTEGER;

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id, blocked_user_id);
CREATE INDEX IF NOT EXISTS idx_message_reports_status ON message_reports(status);
CREATE INDEX IF NOT EXISTS idx_call_history_participants ON call_history(caller_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_call_history_started ON call_history(started_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON admin_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_metrics_key ON metrics(key);