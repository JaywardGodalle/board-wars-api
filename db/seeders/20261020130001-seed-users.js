'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    const now = new Date();

    const users = [
      { email: 'host@test.test', school_id: '20990001', full_name: 'Jayward Godalle', role: 'HOST' },
      { email: 'alice@test.test', school_id: '20990002', full_name: 'Alice Test', role: 'PLAYER' },
      { email: 'bob@test.test', school_id: '20990003', full_name: 'Bob Test', role: 'PLAYER' },
      { email: 'carol@test.test', school_id: '20990004', full_name: 'Carol Test', role: 'PLAYER' },
    ];

    for (const u of users) {
      await queryInterface.sequelize.query(
        `INSERT INTO users (school_id, full_name, email, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        {
          bind: [u.school_id, u.full_name, u.email, u.role, now, now],
          type: QueryTypes.INSERT,
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email = ANY($1)`,
      {
        bind: [['host@test.test', 'alice@test.test', 'bob@test.test', 'carol@test.test']],
        type: QueryTypes.DELETE,
      }
    );
  },
};
