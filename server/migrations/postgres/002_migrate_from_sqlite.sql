-- SQLite to PostgreSQL Migration Script
-- Run this script to migrate data from SQLite to PostgreSQL
-- Prerequisites:
-- 1. PostgreSQL must be running
-- 2. Schema must be created first using 001_initial_schema.sql

-- Migration will:
-- 1. Copy users (preserving IDs)
-- 2. Copy messages
-- 3. Copy blocked_users
-- 4. Copy message_reports
-- 5. Copy call_history
-- 6. Copy admin_audit_logs
-- 7. Copy metrics

-- NOTE: This is a one-way migration. Backup your SQLite database before running!

-- Users migration (preserve IDs)
INSERT INTO users (id, username, password, email, name, avatar, role, is_banned, banned_at, token_version, notification_sound, call_ringtone, theme, online_visibility, read_receipt, created_at, updated_at)
SELECT 
    id,
    username,
    password,
    email,
    name,
    avatar,
    COALESCE(role, 'user'),
    CASE WHEN is_banned = 1 THEN true ELSE false END,
    banned_at,
    COALESCE(token_version, 1),
    CASE WHEN notification_sound = 1 THEN true ELSE false END,
    CASE WHEN call_ringtone = 1 THEN true ELSE false END,
    COALESCE(theme, 'dark'),
    CASE WHEN online_visibility = 1 THEN true ELSE false END,
    CASE WHEN read_receipt = 1 THEN true ELSE false END,
    created_at,
    updated_at
FROM users
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    avatar = EXCLUDED.avatar,
    role = EXCLUDED.role,
    is_banned = EXCLUDED.is_banned,
    banned_at = EXCLUDED.banned_at,
    token_version = EXCLUDED.token_version,
    notification_sound = EXCLUDED.notification_sound,
    call_ringtone = EXCLUDED.call_ringtone,
    theme = EXCLUDED.theme,
    online_visibility = EXCLUDED.online_visibility,
    read_receipt = EXCLUDED.read_receipt;

-- Messages migration
INSERT INTO messages (id, sender_id, receiver_id, content, is_read, is_hidden, deleted_at, deleted_by, edited_at, previous_content, created_at, updated_at)
SELECT 
    id,
    sender_id,
    receiver_id,
    content,
    CASE WHEN is_read = 1 THEN true ELSE false END,
    CASE WHEN is_hidden = 1 THEN true ELSE false END,
    deleted_at,
    deleted_by,
    edited_at,
    previous_content,
    created_at,
    updated_at
FROM messages
ON CONFLICT (id) DO UPDATE SET
    content = EXCLUDED.content,
    is_read = EXCLUDED.is_read,
    is_hidden = EXCLUDED.is_hidden,
    deleted_at = EXCLUDED.deleted_at,
    deleted_by = EXCLUDED.deleted_by,
    edited_at = EXCLUDED.edited_at,
    previous_content = EXCLUDED.previous_content;

-- Blocked users migration
INSERT INTO blocked_users (blocker_id, blocked_user_id, created_at)
SELECT blocker_id, blocked_user_id, created_at
FROM blocked_users
ON CONFLICT (blocker_id, blocked_user_id) DO NOTHING;

-- Message reports migration
INSERT INTO message_reports (id, reporter_id, message_id, reason, status, resolved_at, created_at)
SELECT 
    id,
    reporter_id,
    message_id,
    reason,
    status,
    resolved_at,
    created_at
FROM message_reports
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    resolved_at = EXCLUDED.resolved_at;

-- Call history migration
INSERT INTO call_history (id, caller_id, receiver_id, call_type, status, started_at, answered_at, ended_at, duration_seconds)
SELECT 
    id,
    caller_id,
    receiver_id,
    COALESCE(call_type, 'audio'),
    COALESCE(status, 'pending'),
    started_at,
    answered_at,
    ended_at,
    COALESCE(duration_seconds, 0)
FROM call_history
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    answered_at = EXCLUDED.answered_at,
    ended_at = EXCLUDED.ended_at,
    duration_seconds = EXCLUDED.duration_seconds;

-- Admin audit logs migration
INSERT INTO admin_audit_logs (id, admin_id, action, target_user_id, details, ip_address, created_at)
SELECT 
    id,
    admin_id,
    action,
    target_user_id,
    details,
    ip_address,
    created_at
FROM admin_audit_logs
ON CONFLICT (id) DO UPDATE SET
    action = EXCLUDED.action,
    details = EXCLUDED.details;

-- Metrics migration
INSERT INTO metrics (key, value, updated_at)
SELECT key, value, updated_at
FROM metrics
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = EXCLUDED.updated_at;