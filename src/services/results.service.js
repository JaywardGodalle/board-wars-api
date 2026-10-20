// Hub Contract rule 7: builds the results of finished games in the shared format.
// The internal session_code (for example BW0001) is not contract-compatible:
// the Hub Contract requires a six-digit numeric string starting with 1-9.
// Derive the contract session_code from the internal code without changing
// the database value. The internal session_code is UNIQUE, so the numeric
// suffix extraction below is injective for distinct seeded codes.
const resultsRepository = require('../repositories/results.repository');

// Derive a contract-compatible six-digit numeric session code from the
// internal session code (for example BW0001 -> 100001).
function toContractSessionCode(code) {
  const match = String(code).match(/(\d+)$/);
  const numeric = match ? parseInt(match[1], 10) : 0;
  return String(100000 + numeric);
}

// Ranks completed players by score. Equal scores share a rank: 1, 1, 3 ...
function rankPlayers(players) {
  const sorted = [...players].sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname));
  let rank = 0;
  let previous = null;
  let seen = 0;
  return sorted.map((player) => {
    if (player.completed) {
      seen += 1;
      if (player.score !== previous) rank = seen;
      previous = player.score;
    }
    return { ...player, rank: player.completed ? rank : null };
  });
}

async function listFinishedGames(since) {
  const rows = await resultsRepository.findFinishedGamePlayers(since);

  // One entry per finished game, in the order the games ended.
  const games = new Map();
  for (const row of rows) {
    if (!games.has(row.session_code)) {
      games.set(row.session_code, {
        session_code: toContractSessionCode(row.session_code),
        started_at: row.started_at ? new Date(row.started_at).toISOString() : null,
        ended_at: new Date(row.ended_at).toISOString(),
        players: [],
      });
    }
    games.get(row.session_code).players.push({
      school_id: String(row.school_id),
      nickname: String(row.nickname),
      score: Number(row.score),
      completed: Boolean(row.completed),
    });
  }

  return [...games.values()]
    .sort((a, b) => a.ended_at.localeCompare(b.ended_at))
    .map((game) => {
      const players = rankPlayers(game.players);
      const podium = players
        .filter((p) => p.rank !== null && p.rank <= 3)
        .map(({ rank, school_id: schoolId, nickname, score }) => ({ rank, school_id: schoolId, nickname, score }));
      return { ...game, players, podium };
    });
}

module.exports = { listFinishedGames, rankPlayers };
