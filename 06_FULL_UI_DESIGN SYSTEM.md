# 06_FULL_UI_DESIGN SYSTEM — QiBo / ZYMI UI Design System

## Visual Identity
QiBo uses a premium dark glassmorphism interface with neon accents.

## Color Tokens
```css
:root {
  --bg-main: #0f172a;
  --bg-deep: #020617;
  --panel: rgba(30, 41, 59, 0.72);
  --panel-solid: #1e293b;
  --border-soft: rgba(148, 163, 184, 0.18);
  --text-main: #e5e7eb;
  --text-muted: #94a3b8;
  --primary: #06b6d4;
  --secondary: #8b5cf6;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
}
```

## Typography
- Primary font: Segoe UI, Inter, system-ui, sans-serif
- Heading weight: 700
- Body weight: 400–500
- Button weight: 600

## Layout
Desktop:
- Left sidebar: 280–340px
- Main content: flexible
- Chat header fixed
- Composer fixed bottom

Mobile:
- Contact list full screen
- Chat screen full screen
- Back button required
- Bottom composer safe-area aware

## Components
- Glass panel
- Avatar
- User row
- Chat bubble
- Message composer
- Call modal
- Video tile
- Icon button
- Admin card
- Empty state

## Empty State
Display:
- Floating chat bubble icon
- Gradient title: `Welcome to QiBo`
- Subtitle: `Select a user to start messaging or calling`

## Effects
- Soft shadows
- Blur panels
- Smooth hover states
- Subtle scale on buttons
- Neon gradient text

## Accessibility
- Minimum contrast must be readable.
- Buttons need aria-label.
- Focus states must be visible.
- Do not rely only on color for status.
