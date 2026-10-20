'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    const now = new Date();

    const userIds = {};
    for (const email of ['alice@test.test', 'bob@test.test', 'carol@test.test']) {
      const [u] = await queryInterface.sequelize.query(
        `SELECT user_id FROM users WHERE email = $1`,
        { bind: [email], type: QueryTypes.SELECT }
      );
      if (!u) throw new Error(`User ${email} must be seeded before session_players`);
      userIds[email] = u.user_id;
    }

    const sessionIds = {};
    for (const code of ['BW0001', 'BW0002']) {
      const [s] = await queryInterface.sequelize.query(
        `SELECT session_id FROM sessions WHERE session_code = $1`,
        { bind: [code], type: QueryTypes.SELECT }
      );
      if (!s) throw new Error(`Session ${code} must be seeded before session_players`);
      sessionIds[code] = s.session_id;
    }

    const players = [
      { session_code: 'BW0001', email: 'alice@test.test', nickname: 'Alpha', score: 10, completed: true },
      { session_code: 'BW0001', email: 'bob@test.test', nickname: 'Beta', score: 15, completed: true },
      { session_code: 'BW0001', email: 'carol@test.test', nickname: 'Gamma', score: 5, completed: true },
      { session_code: 'BW0002', email: 'alice@test.test', nickname: 'Delta', score: 0, completed: false },
    ];

    for (const p of players) {
      await queryInterface.sequelize.query(
        `INSERT INTO session_players (session_id, user_id, nickname, score, completed, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (session_id, nickname) DO NOTHING`,
        {
          bind: [sessionIds[p.session_code], userIds[p.email], p.nickname, p.score, p.completed, now, now],
          type: QueryTypes.INSERT,
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    await queryInterface.sequelize.query(
      `DELETE FROM session_players WHERE nickname = ANY($1)`,
      { bind: [['Alpha', 'Beta', 'Gamma', 'Delta']], type: QueryTypes.DELETE }
    );
  },
};
