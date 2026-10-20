# Board Wars API

Backend API for **Board Wars**, a multiplayer quiz strategy game with hidden teams and board movement.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Jayward Godalle (JaywardGodalle), BSCS 3-2
- Group and game concept: Team 11

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

Game concept: Players on hidden teams answer simultaneous questions. A correct answer grants one movement opportunity on a 15 x 15 board, moving to one of eight adjacent tiles. A player is finished when reaching the opposing edge, and the first team with all 15 players finished wins.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone [repository-url]
cd [folder-name]
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | your_game_slug | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

## What "completed" means in my game

A player is finished when they reach the opposing edge of the 15 x 15 board. The game ends when the first team has all 15 players finished.

## Schema note

The PDF's logical tables are hosts, question_sets, questions, choices, sessions, session_players, and answers. Week 10 Design Change Notice 01 requires reconciling hosts with a users table that has a role and enforcing the one-seat rule during the migration step. Migrations and seed data are not yet complete; do not claim them as finished.

## Tables

Migration tables will be listed here once migrations are written.

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:migrate:undo | Undoes the last migration |
| npm run db:seed | Loads the seed data |
| npm run db:seed:undo | Undoes all seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |
