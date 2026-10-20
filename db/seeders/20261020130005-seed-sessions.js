'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    const now = new Date();

    const [qs] = await queryInterface.sequelize.query(
      `SELECT question_set_id FROM question_sets WHERE title = $1`,
      { bind: ['Board Wars Quiz Set 1'], type: QueryTypes.SELECT }
    );

    if (!qs) {
      throw new Error('Question set must be seeded before sessions');
    }

    const [host] = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email = $1`,
      { bind: ['host@test.test'], type: QueryTypes.SELECT }
    );

    if (!host) {
      throw new Error('Host user must be seeded before sessions');
    }

    const sessions = [
      { session_code: 'BW0001', status: 'ended' },
      { session_code: 'BW0002', status: 'waiting' },
    ];

    for (const s of sessions) {
      await queryInterface.sequelize.query(
        `INSERT INTO sessions (session_code, question_set_id, host_id, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (session_code) DO NOTHING`,
        {
          bind: [s.session_code, qs.question_set_id, host.user_id, s.status, now, now],
          type: QueryTypes.INSERT,
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    await queryInterface.sequelize.query(
      `DELETE FROM sessions WHERE session_code = ANY($1)`,
      { bind: [['BW0001', 'BW0002']], type: QueryTypes.DELETE }
    );
  },
};
