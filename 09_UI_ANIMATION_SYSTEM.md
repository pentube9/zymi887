# 09_UI_ANIMATION_SYSTEM — Motion & Interaction Rules

## Purpose
Animations should make the app feel premium without slowing down communication.

## Animation Principles
- Fast
- Smooth
- Subtle
- Non-distracting
- Respect reduced motion

## Timing
- Micro interaction: 120–180ms
- Modal entrance: 180–260ms
- Page transition: 220–320ms
- Loading shimmer: 900–1400ms loop

## Easing
```css
--ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
```

## Recommended Animations
- Button hover: slight lift
- User row hover: background glow
- Message bubble: fade + translateY
- Incoming call modal: scale + fade
- Empty state icon: slow floating animation
- Online dot: soft pulse

## CSS Example
```css
.button {
  transition: transform 160ms var(--ease-soft), background 160ms var(--ease-soft);
}
.button:hover {
  transform: translateY(-1px);
}
```

## Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

## Rule
Never animate layout in a way that breaks chat readability or call controls.
