'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    const now = new Date();

    const [host] = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email = $1`,
      { bind: ['host@test.test'], type: QueryTypes.SELECT }
    );

    if (!host) {
      throw new Error('Host user must be seeded before question_sets');
    }

    const [existing] = await queryInterface.sequelize.query(
      `SELECT question_set_id FROM question_sets WHERE title = $1`,
      { bind: ['Board Wars Quiz Set 1'], type: QueryTypes.SELECT }
    );

    if (!existing) {
      await queryInterface.sequelize.query(
        `INSERT INTO question_sets (title, description, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        {
          bind: ['Board Wars Quiz Set 1', 'Practice questions for Board Wars', host.user_id, now, now],
          type: QueryTypes.INSERT,
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    await queryInterface.sequelize.query(
      `DELETE FROM question_sets WHERE title = $1`,
      { bind: ['Board Wars Quiz Set 1'], type: QueryTypes.DELETE }
    );
  },
};
