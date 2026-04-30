# ADMIN_ACCESS — Admin Access & Permission System

## Purpose
Admin access controls moderation, user management, gamification, and system configuration.

## Admin Roles
Recommended roles:
- `super_admin`
- `admin`
- `moderator`
- `support`

## Permissions
| Permission | Description |
|---|---|
| `users.read` | View users |
| `users.update` | Edit user status |
| `users.ban` | Ban/restrict users |
| `messages.moderate` | Moderate reported messages |
| `gamification.manage` | Manage points/badges |
| `settings.manage` | Update system settings |
| `audit.read` | View admin logs |

## Security Rules
- Admin role must be verified server-side.
- Never trust role from localStorage only.
- Admin routes require authentication middleware.
- Sensitive actions require audit log.
- Super admin actions should be limited.

## Suggested Middleware
```js
function requireAdmin(permission) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!req.user.permissions?.includes(permission)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
```

## Admin UI
- Separate admin route: `/admin`
- Show dashboard stats
- User management table
- Gamification controls
- Audit logs
- Reported content review
