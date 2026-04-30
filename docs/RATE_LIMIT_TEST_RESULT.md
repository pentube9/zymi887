# RATE_LIMIT_TEST_RESULT.md

# Rate Limit Test Result

## Timestamp

Date: 2026-04-26

## Rate Limit Configuration

| Route | Limit | Window |
|-------|-------|--------|
| /api/login | 5 | 15 minutes |
| /api/admin/login | 5 | 15 minutes |
| /api/upload/avatar | 10 | 1 hour |
| /api/report | 5 | 1 hour |
| /api/admin/export | 3 | 1 hour |

## Test Commands

### Login Brute-Force Protection

```bash
# Try 6+ logins quickly
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}'
done
```

Expected after 5 attempts: HTTP 429 Too Many Requests

### Admin Login Protection

```bash
# Same test for /api/admin/login
```

Expected after 5 attempts: HTTP 429

### Upload Protection

```bash
# Try 11+ uploads quickly
```

Expected after 10 attempts: HTTP 429

### Report Protection

```bash
# Try 6+ reports quickly
```

Expected after 5 attempts: HTTP 429

### Export Protection

```bash
# Try 4+ exports quickly
```

Expected after 3 attempts: HTTP 429

## Test Results

| Test | Result |
|------|-------|
| Login brute-force blocked | |
| Admin brute-force blocked | |
| Upload spam blocked | |
| Report spam blocked | |
| Export spam blocked | |

## Notes

- Rate limits use in-memory tracking
- Reset after window expires
- Response includes retry information