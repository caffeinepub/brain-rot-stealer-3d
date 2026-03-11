# Brain Rot Stealer 3D

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- 3D interactive game/experience called "Brain Rot Stealer 3D"
- A fun 3D scene featuring brain rot internet meme characters (Skibidi Toilet, Tralalero Tralala, Bombardiro Crocodillo, etc.)
- Player can "steal" brain rot characters by clicking on them in the 3D scene
- Score/collection tracker showing how many brain rot characters have been stolen
- Leaderboard of top stealers
- Admin panel (login-protected) for managing characters: add, remove, edit characters and view all player stats

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - Player identity and score tracking
   - Character registry (name, description, point value)
   - Steal action: record steals per player, accumulate score
   - Leaderboard query (top N players by score)
   - Admin functions: add/remove/update characters, reset scores, view all player data
   - Simple admin auth via hardcoded principal or password

2. Frontend:
   - Landing/game page with Three.js 3D scene
   - Floating brain rot characters in 3D space that can be clicked
   - Click a character -> "steal" animation -> score increases
   - HUD showing current score and stolen count
   - Leaderboard modal/panel
   - Admin panel page (login with password) with character management table and player stats
