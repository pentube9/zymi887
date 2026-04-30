# Security Environment Configuration

## Environment Variables

### JWT Configuration

```bash
# JWT Authentication
# Generate a strong 64-character random secret:
#   openssl rand -hex 32
JWT_SECRET=replace_this_with_64_char_random_secret_in_production

# Token expiration
JWT_EXPIRES_IN=7d
```

### Required in Production

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | Secret key for JWT | (64+ random chars) |
| `CLIENT_ORIGIN` | Allowed origin | `https://your-domain.com` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `JWT_EXPIRES_IN` | 7d | Token TTL |
| `DATABASE_URL` | none | PostgreSQL connection |
| `REDIS_URL` | none | Redis connection |

## Security Rules

1. **Never commit JWT_SECRET** to version control
2. **Generate new secrets** for each environment
3. **Rotate secrets** periodically
4. **Use HTTPS** in production
5. **Validate origins** in production

## Token Versioning

When a user changes their password, `token_version` is incremented. This invalidates all existing tokens.

```javascript
// Database schema
ALTER TABLE users ADD COLUMN token_version INTEGER DEFAULT 1;

// On password change
UPDATE users SET token_version = token_version + 1 WHERE id = ?;
```

## Socket.io JWT Verification

In production, JWT verification is enabled on Socket.io connections:

```javascript
// Server - token passed in auth object
io('server-url', {
  auth: { token: 'jwt-token-here' }
});

// Server - verifies during handshake
socket.handshake.auth.token
```

## CORS Configuration

Development:
```javascript
origin: '*'
```

Production:
```javascript
origin: 'https://your-domain.com'  // Must match CLIENT_ORIGIN
```