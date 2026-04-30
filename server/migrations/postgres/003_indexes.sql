-- Additional PostgreSQL indexes for performance
-- Run after initial schema and migration

-- Composite indexes for message queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    created_at
);

-- Index for reading messages between two users efficiently
CREATE INDEX IF NOT EXISTS idx_messages_delivered ON messages(
    receiver_id,
    is_read,
    deleted_at
);

-- Index for user search
CREATE INDEX IF NOT EXISTS idx_users_search ON users(
    username,
    name,
    email
) USING gin(to_tsvector('english', COALESCE(username, '') || ' ' || COALESCE(name, '') || ' ' || COALESCE(email, '')));

-- Index for admin user queries
CREATE INDEX IF NOT EXISTS idx_users_admin_search ON users(
    role,
    is_banned,
    created_at
);

-- Index for reports by status
CREATE INDEX IF NOT EXISTS idx_message_reports_resolved ON message_reports(
    status,
    created_at
);

-- Index for call history by participants
CREATE INDEX IF NOT EXISTS idx_call_history_participants_full ON call_history(
    caller_id,
    started_at
);

CREATE INDEX IF NOT EXISTS idx_call_history_receiver_full ON call_history(
    receiver_id,
    started_at
);

-- Index for call history by status
CREATE INDEX IF NOT EXISTS idx_call_history_status_dates ON call_history(
    status,
    started_at,
    ended_at
);

-- Index for recent activity
CREATE INDEX IF NOT EXISTS idx_users_recent ON users(
    last_seen
) WHERE last_seen IS NOT NULL;

-- Index for banned users
CREATE INDEX IF NOT EXISTS idx_users_banned_lookup ON users(
    is_banned,
    banned_at
) WHERE is_banned = true;

-- Index for online visibility
CREATE INDEX IF NOT EXISTS idx_users_online ON users(
    online_visibility,
    last_seen
) WHERE online_visibility = true;

-- Partial indexes for unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(
    receiver_id,
    created_at
) WHERE is_read = false AND deleted_at IS NULL;

-- Index for blocked users by blocker
CREATE INDEX IF NOT EXISTS idx_blocked_users_by_blocker ON blocked_users(
    blocker_id,
    created_at
);

-- Index for audit logs by admin
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_action ON admin_audit_logs(
    admin_id,
    created_at
);

-- Index for audit logs by target
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON admin_audit_logs(
    target_user_id,
    created_at
);