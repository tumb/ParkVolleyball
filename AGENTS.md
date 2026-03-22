# ParkVolleyball – AI Agent Guidelines

## Purpose of This File
This document defines how AI agents (Codex) should understand, modify, and extend this codebase.

Follow these rules before making any changes.

---

## System Architecture

This project is an **ADMIN system**.

Responsibilities:
- Manage leagues, divisions, teams, players
- Create schedules
- Compute standings
- Create and manage playoff brackets
- Write all data to the database (Supabase)

A separate public site (parkvball.com):
- Reads this data
- Displays schedules, standings, and brackets
- Will be rewritten later

### Rule:
The admin system defines the data model.
The public site adapts to it.

---

## Core Domain Rules

### Division Value (Critical)
- Each division has a `divisionvalue`
- Higher divisions are worth more
- Used in:
  - standings
  - ranking
  - playoff seeding

### Match Context
- Matches must be evaluated using the **division assigned to the match**
- Teams may move divisions mid-season
- Same teams can play in different divisions → results count differently

---

## Regular Season

- Stored in `schedule`
- Matches can end in ties
- Standings are computed from schedule
- Standings must use **division-weighted results**

### Regular-Season Standings Rules (For Playoff Seeding)
- Standings are accumulated from `schedule` rows only.
- Use the **division assigned to each match row** (`schedule.divisionid`), not a team's current division.
- Per-match points:
  - team 1 points = `team1wins * divisionvalue`
  - team 2 points = `team2wins * divisionvalue`
- `1-1` is a tie and gives each team one win.
- Most matches total 2 wins (`2-0`, `1-1`, `0-2`), but exceptions are allowed.
- Never hardcode a rule that `team1wins + team2wins == 2`.
- Playoff seeding should be based on these accumulated weighted regular-season points.

### team_out
- Used only for regular season
- NOT used in playoffs

---

## Playoff System

### Core Rules
- Single elimination
- Fixed bracket (no reseeding)
- Admin-controlled seeding
- Deterministic structure
- No ties
- No score tracking needed (winner only)

### Playoff Division Assignment
- `team.divisionid` is the admin-controlled playoff division assignment.
- Admin may update `team.divisionid` during playoff setup.
- Playoff division assignment may differ from earlier regular-season grouping.
- This does **not** change regular-season standings rules.

---

## Bracket Identity

A bracket is uniquely defined by:
- `league_id`
- `division_id`

`bracketname` is display-only.

---

## Seeding

Stored in `seed`:
- `bracket_id`
- `team_id`
- `seed`

Rules:
- One seed per team per bracket
- Seeds are assigned by admin
- Seeds determine bracket structure

---

## Bracket Structure

### Power of 2
- 1 vs 8, 2 vs 7, etc.

### Non-Power-of-2
Use play-in round.

Example (10 teams):
- 7 vs 10
- 8 vs 9
- Seeds 1–6 get byes

---

## Playoff Match Model

Each match must support:

- `team_a_id` (nullable)
- `team_b_id` (nullable)
- `winner_team_id` (nullable)
- `is_completed` (boolean)
- `round_number`
- `position_in_round` (existing `location`, NOT a real-world location)
- `next_match_id`
- `next_slot` (A or B)

### Match State

Not played:
- winner is NULL
- is_completed = false

Completed:
- winner is set
- is_completed = true

---

## Match Progression

- Winners advance via:
  - `next_match_id`
  - `next_slot`
- Later rounds start with NULL teams
- Filled automatically

---

## Admin Workflow

Playoff setup is explicit and ordered:

1. Admin chooses number of playoff divisions/brackets for the league (2, 3, or 4).
2. Reuse existing divisions when possible.
3. Create missing divisions if needed.
4. Create one bracket per chosen playoff division.
5. Assign teams to playoff divisions (`team.divisionid`).
6. Save division assignments.
7. Work one playoff division/bracket at a time.
8. Assign and save seeds for that bracket.
9. Generate playoff matches for that bracket only after seeds are saved.
10. Enter playoff results; system advances winners.

Action boundaries must remain separate and deterministic:
- Create Brackets
- Save Division Assignments
- Save Seeds
- Generate Matches

---

## Design Constraints

### DO:
- Keep schema minimal and explicit
- Use deterministic logic
- Prefer database-driven truth
- Keep admin workflows simple and safe

### DO NOT:
- Add unnecessary UI complexity
- Assume playoff code is already working
- Mix regular-season and playoff logic
- Use `team_out` in playoffs
- Add score-based playoff logic

---

## UI Display Rules

### Public-Facing Pages
- Never display raw IDs (`leagueid`, `teamid`, `playerid`, etc.).
- Always display human-readable values (league day/year, division name, team name).

### Admin Pages
- IDs may be shown for debugging/admin purposes.
- IDs must be shown alongside readable values.
- Example format:
  - `Green Division (id 3)`
  - `Team Sharks (id 14)`

---

## Known Issues

- Type definitions may be out of sync with DB
- DB access is partially scattered
- Some tables contain legacy or duplicate data
- Existing playoff data is experimental

---

## Development Phase

Currently in:
**Schema and architecture validation**

Before implementing:
1. Confirm schema
2. Align DB + types
3. Then build features

---

## Final Principle

Keep everything:
- simple
- deterministic
- admin-controlled
- easy to reason about

