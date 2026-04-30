# 07_UI COMPONENT_RULES — Component Standards

## Component Principles
- Components must be small and reusable.
- UI logic and business logic should be separated.
- Props must be clear and predictable.
- Avoid huge all-in-one components when possible.

## Required Components

### Layout
- `AppShell`
- `Sidebar`
- `MainPanel`
- `ResponsiveContainer`

### Auth
- `LoginForm`
- `RegisterForm`
- `AuthCard`

### Chat
- `UserList`
- `UserListItem`
- `ChatWindow`
- `ChatHeader`
- `MessageList`
- `MessageBubble`
- `MessageComposer`
- `TypingIndicator`
- `EmptyChatState`

### Call
- `IncomingCallModal`
- `CallScreen`
- `VideoTile`
- `CallControls`

### Admin
- `AdminLayout`
- `UserManagementTable`
- `BadgeManager`
- `PointsManager`
- `AuditLog`

## Styling Rules
- Use design tokens.
- No random colors outside design system.
- Avoid hardcoded pixel values when responsive values are needed.
- Use `rem`, `%`, `clamp`, and CSS variables.

## State Rules
- Auth state belongs in `AuthContext`.
- Socket state belongs in `SocketContext`.
- UI-only modal state stays local.
- Call peer state should be isolated in call service/hook.

## Naming Rules
- Component files use PascalCase.
- Hooks use `useSomething`.
- Services use camelCase.
- Socket events use kebab-case.
