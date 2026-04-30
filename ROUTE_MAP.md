# ROUTE_MAP — Application Routes

## Public Routes
| Route | Purpose |
|---|---|
| `/login` | User login |
| `/register` | User registration |
| `/forgot-password` | Optional future password recovery |

## Protected User Routes
| Route | Purpose |
|---|---|
| `/` | Redirect to dashboard |
| `/dashboard` | Main chat dashboard |
| `/chat/:userId` | Direct chat route for mobile/deep link |
| `/call/:callId` | Active call screen |
| `/profile` | User profile |
| `/settings` | User settings |

## Admin Routes
| Route | Purpose |
|---|---|
| `/admin` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/gamification` | Points and badges |
| `/admin/reports` | Reported content |
| `/admin/audit` | Admin audit log |
| `/admin/settings` | System settings |

## API Routes
| Route | Purpose |
|---|---|
| `POST /api/auth/register` | Register |
| `POST /api/auth/login` | Login |
| `GET /api/users` | User list |
| `GET /api/messages/:userId` | Message history |
| `POST /api/messages` | Send/store message |
| `GET /api/admin/users` | Admin user list |
| `POST /api/admin/gamification` | Manage gamification |

## Socket Namespace
Default:
- `/`

Future optional namespaces:
- `/chat`
- `/call`
- `/admin`

## Rule
Routes should be predictable, protected, and mobile deep-link friendly.
