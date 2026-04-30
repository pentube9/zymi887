# 04_GAMIFICATION ADMIN — Admin-Controlled Engagement System

## Purpose
Gamification adds controlled engagement without harming the core communication experience.

## Admin Goals
Admin can manage:
- User levels
- Points
- Badges
- Daily activity rewards
- Chat streaks
- Referral rewards
- Leaderboard visibility
- Abuse prevention rules

## Suggested Tables

### user_points
- id
- user_id
- points
- source
- created_at

### badges
- id
- name
- description
- icon
- rule_key
- is_active

### user_badges
- id
- user_id
- badge_id
- awarded_at

### admin_actions
- id
- admin_id
- action_type
- target_user_id
- payload
- created_at

## Reward Examples
- First message: +10 points
- Daily login: +5 points
- 7-day streak: +50 points
- First call: +20 points
- Verified profile: +30 points

## Admin Panel Features
- View all users
- Adjust points
- Enable/disable badges
- View suspicious activity
- Reset streaks
- Export activity summary
- Ban or restrict abusive users

## Rules
- Rewards must be server-calculated.
- Client cannot directly grant points.
- Admin actions must be logged.
- Gamification must be optional and feature-flagged.
