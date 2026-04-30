# 08_RESPONSIVE_LAYOUT_SYSTEM — Responsive Layout Rules

## Supported Screens
- Small mobile: 320px+
- Large mobile: 390px+
- Tablet: 768px+
- Desktop: 1024px+
- Large desktop: 1440px+

## Breakpoints
```css
:root {
  --bp-sm: 480px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
}
```

## Desktop Layout
- Sidebar visible permanently.
- Main chat/call area visible beside sidebar.
- Empty state centered when no chat selected.

## Tablet Layout
- Sidebar can be 280px.
- Main panel stays flexible.
- Call screen uses two-column video when possible.

## Mobile Layout
- Sidebar and chat should not appear side by side.
- Contact list becomes first screen.
- Selecting a user opens chat screen.
- Chat header includes back button.
- Composer sticks to bottom.
- Use safe-area padding for iPhone:
```css
padding-bottom: env(safe-area-inset-bottom);
```

## Browser Compatibility
Must work on:
- Chrome
- Edge
- Firefox
- Safari
- Android WebView
- iOS Safari

## Rule
Never design only for desktop. Every feature must include mobile behavior.
