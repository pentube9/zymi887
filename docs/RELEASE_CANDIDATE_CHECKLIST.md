# RELEASE_CANDIDATE_CHECKLIST.md

# Release Candidate Checklist

## Date: 2026-04-26

## Pre-Release Checks

### Build

- [x] Client build passes
- [x] Server syntax check passes
- [ ] Docker build passes

### Configuration

- [ ] PORT=5000 configured
- [ ] CLIENT_ORIGIN set
- [ ] JWT_SECRET generated
- [ ] Production .env created

### Core Security

- [ ] JWT socket auth enabled in production
- [ ] Rate limiting active
- [ ] Admin export secured
- [ ] CORS locked to production origin

### Database

- [ ] PostgreSQL migration completed
- [ ] Row counts verified
- [ ] SQLite backup preserved

### Real-Time

- [ ] Socket.io connections work
- [ ] private-message works
- [ ] typing works
- [ ] call-user works
- [ ] WebRTC flow works

### Docker

- [ ] docker-compose up works
- [ ] All services healthy
- [ ] Health endpoints respond

### Monitoring

- [ ] Health dashboard accessible
- [ ] Error logging works

## Release Checklist

| Category | Item | Status |
|----------|------|--------|
| **Build** | Client | PASS |
| **Build** | Server | PASS |
| **Build** | Docker | |
| **Security** | JWT auth | PASS |
| **Security** | Rate limit | PASS |
| **Security** | Admin export | PASS |
| **Database** | PostgreSQL | |
| **Database** | Migration | |
| **Database** | Row counts | |
| **Real-Time** | Chat | |
| **Real-Time** | Calls | |
| **Real-Time** | Redis scale | |
| **Docker** | Health | |
| **Docker** | Logs | |
| **Mobile** | Layout | |
| **Design** | Tokens | |

## Blocking Issues

None identified.

## Ready for Release

- [ ] All pre-release checks pass
- [ ] No blocking issues
- [ ] Documentation complete
- [ ] Rollback plan documented