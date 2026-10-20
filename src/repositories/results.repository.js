// Hub Contract rule 7: returns one row per player per FINISHED game.
//
// A game is finished when sessions.status = 'ended' and it has at least
// three session_players with completed = true. Columns returned:
//   session_code  the session code (sessions.session_code)
//   started_at    sessions.created_at (may be null)
//   ended_at      sessions.updated_at (when the game ended)
//   school_id     from users.school_id
//   nickname      from session_players.nickname
//   score         from session_players.score
//   completed     from session_players.completed
const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

async function findFinishedGamePlayers(since) {
  const sql = `
    SELECT s.session_code AS session_code,
           s.created_at AS started_at,
           s.updated_at AS ended_at,
           u.school_id AS school_id,
           sp.nickname AS nickname,
           sp.score AS score,
           sp.completed AS completed
      FROM sessions s
      JOIN session_players sp ON sp.session_id = s.session_id
      JOIN users u ON u.user_id = sp.user_id
     WHERE s.status = 'ended'
       AND ($1::timestamptz IS NULL OR s.updated_at > $1::timestamptz)
     ORDER BY s.updated_at, sp.score DESC
  `;

  return sequelize.query(sql, {
    type: QueryTypes.SELECT,
    bind: [since ? since.toISOString() : null],
  });
}

module.exports = { findFinishedGamePlayers };
