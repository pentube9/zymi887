# Query Compatibility Audit

## SQLite to PostgreSQL Conversion Rules

### Parameter Placeholders

| SQLite | PostgreSQL |
|--------|-----------|
| `?` | `$1`, `$2`, `$3`... |
| `?1` | `$1` |
| `?2` | `$2` |

**Example:**
```sql
-- SQLite
SELECT * FROM users WHERE id = ?

-- PostgreSQL
SELECT * FROM users WHERE id = $1
```

### Boolean Values

| SQLite | PostgreSQL |
|--------|-----------|
| `0` | `false` |
| `1` | `true` |

### Timestamps

| SQLite | PostgreSQL |
|--------|-----------|
| `CURRENT_TIMESTAMP` | `CURRENT_TIMESTAMP` |
| `DATETIME` | `TIMESTAMP` |

### Auto-Increment

| SQLite | PostgreSQL |
|--------|-----------|
| `AUTOINCREMENT` | `SERIAL` |
| `lastInsertRowid` | `RETURNING id` |

**Example:**
```sql
-- SQLite
INSERT INTO users (username, password) VALUES (?, ?)

-- PostgreSQL
INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id
```

### UPSERT (Insert or Update)

| SQLite | PostgreSQL |
|--------|-----------|
| `INSERT OR REPLACE` | `INSERT ... ON CONFLICT DO UPDATE` |
| `INSERT OR IGNORE` | `INSERT ... ON CONFLICT DO NOTHING` |

### JSON Data Type

SQLite stores JSON as TEXT. PostgreSQL has native JSONB:
```sql
-- PostgreSQL
ALTER TABLE messages ADD COLUMN reactions JSONB;
```

### Array Handling

PostgreSQL supports arrays natively:
```sql
-- PostgreSQL
SELECT * FROM users WHERE $1 = ANY(tags);
```

## Common Queries Converted

### User Creation
```sql
-- SQLite
INSERT INTO users (username, password, role) VALUES (?, ?, ?)

-- PostgreSQL
INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id
```

### Message Insert
```sql
-- SQLite
INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)

-- PostgreSQL
INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING id
```

### Get Messages
```sql
-- SQLite
SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)

-- PostgreSQL
SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $3 AND receiver_id = $4)
```

### Block User
```sql
-- SQLite
INSERT OR IGNORE INTO blocked_users (blocker_id, blocked_user_id) VALUES (?, ?)

-- PostgreSQL
INSERT INTO blocked_users (blocker_id, blocked_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
```

### Update Metric
```sql
-- SQLite
INSERT INTO metrics (key, value) VALUES (?, 1) ON CONFLICT(key) DO UPDATE SET value = value + 1

-- PostgreSQL
INSERT INTO metrics (key, value) VALUES ($1, 1) ON CONFLICT(key) DO UPDATE SET value = value + 1
```