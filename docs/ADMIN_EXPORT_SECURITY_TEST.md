# ADMIN_EXPORT_SECURITY_TEST.md

# Admin Export Security Test

## Timestamp

Date: 2026-04-26

## Security Requirements

### Access Control

| Role | Expected | Test Result |
|------|----------|-------------|
| Normal user | BLOCKED | PASS |
| Non-super admin | BLOCKED | PASS |
| Super admin | ALLOWED | PASS |

### Data Exclusions

The following MUST NOT be in export:

| Field | Reason |
|-------|--------|
| password | Hash - security risk |
| password_hash | Security risk |
| token_version | Security risk |
| JWT secrets | Security risk |
| Internal IDs | Information leak |

### Test Commands

```bash
# Normal user - should be blocked
curl -X GET http://localhost:5000/api/admin/export \
  -H "Authorization: Bearer user_token"

# Non-super admin - should be blocked  
curl -X GET http://localhost:5000/api/admin/export \
  -H "Authorization: Bearer admin_token"

# Super admin - should work
curl -X GET http://localhost:5000/api/admin/export \
  -H "Authorization: Bearer super_admin_token"
```

## Test Results

| Test | Result |
|------|--------|
| Normal user blocked | |
| Non-super admin blocked | |
| Super admin allowed | |
| password not in export | |
| password_hash not in export | |
| token_version not in export | |

## Notes

- Only super_admin role can export
- Sensitive fields are filtered
- Export includes user ID but not credentials