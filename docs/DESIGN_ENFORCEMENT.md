# ZYMI Design Enforcement

## Overview
This document outlines the design system enforcement rules for the ZYMI chat application.

## Design Tokens

### Colors
All colors must be defined as CSS variables in `tokens.css`:
- `--neon-primary`: #06b6d4 (Cyan)
- `--neon-secondary`: #8b5cf6 (Purple)
- `--neon-success`: #10b981 (Green)
- `--neon-danger`: #ef4444 (Red)
- `--neon-warning`: #f59e0b (Orange)

### Typography
- Font: System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
- No random font sizes
- Follow consistent scale: 12px, 13px, 14px, 16px, 20px, 24px, 28px, 36px

### Spacing
- Use consistent spacing units: 4px, 8px, 12px, 16px, 20px, 24px, 32px

### Border Radius
- `--radius-sm`: 6px
- `--radius-md`: 10px
- `--radius-lg`: 16px
- `--radius-full`: 9999px

### Shadows
- `--shadow-sm`: 0 2px 8px rgba(0, 0, 0, 0.3)
- `--shadow-md`: 0 4px 16px rgba(0, 0, 0, 0.4)
- `--shadow-lg`: 0 8px 32px rgba(0, 0, 0, 0.5)

## Rules

### DO
1. Use CSS variables for all colors
2. Use shared component classes (.btn, .card, .badge, .input)
3. Use design tokens from tokens.css
4. Use consistent border radius
5. Follow spacing scale

### DON'T
1. Use random hex colors
2. Use inline styles
3. Hardcode colors
4. Create one-off component styles
5. Use inconsistent spacing

## Component Classes

### Buttons
```css
.btn { /* Base button styles */ }
.btn-primary { /* Gradient cyan to purple */ }
.btn-secondary { /* Glass effect */ }
.btn-danger { /* Red tint */ }
.btn-success { /* Green tint */ }
```

### Cards
```css
.card { /* Glass background */ }
.card-hover { /* Hover lift effect */ }
```

### Badges
```css
.badge { /* Inline badge */ }
.badge-primary { /* Cyan tint */ }
.badge-secondary { /* Purple tint */ }
.badge-success { /* Green tint */ }
.badge-danger { /* Red tint */ }
.badge-warning { /* Orange tint */ }
```

### Inputs
```css
.input { /* Glass input */ }
```

## Animations
```css
.animate-fadeIn { /* Fade in 0.3s */ }
.animate-slideIn { /* Slide in 0.3s */ }
.animate-pulse { /* Pulse 2s infinite */ }
```

## File Structure
```
client/src/styles/
├── tokens.css     # CSS variables and reset
└── components.css # Shared component classes
```