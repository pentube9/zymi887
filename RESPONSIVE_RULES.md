# RESPONSIVE_RULES — Cross-Device Rules

## Main Requirement
QiBo must be responsive across Android, iPhone, desktop browser, tablet, and future PWA/mobile app shells.

## Layout Rules
- Desktop: sidebar + main panel.
- Mobile: one screen at a time.
- Tablet: adaptive split view.
- Chat composer must never hide behind browser UI.
- Call controls must remain reachable with thumb on mobile.

## CSS Rules
Use:
- `clamp()` for scalable text
- `minmax()` for grid
- `%`, `fr`, `rem`
- safe-area insets
- max-width containers

Avoid:
- fixed large widths
- desktop-only absolute positioning
- hover-only features
- tiny tap targets

## Tap Targets
Minimum recommended touch size:
- 44px × 44px

## Mobile Header
Must include:
- Back button
- Selected user avatar
- User name
- Audio call button
- Video call button

## Testing Sizes
Test at:
- 320 × 568
- 375 × 812
- 390 × 844
- 768 × 1024
- 1366 × 768
- 1920 × 1080
