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
      throw new Error('Question set must be seeded before questions');
    }

    const questions = [
      { question_text: 'What is the capital of France?', points: 10 },
      { question_text: 'The Earth is flat.', points: 10 },
      { question_text: '2 + 2 equals?', points: 10 },
    ];

    for (const q of questions) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT question_id FROM questions WHERE question_set_id = $1 AND question_text = $2`,
        { bind: [qs.question_set_id, q.question_text], type: QueryTypes.SELECT }
      );

      if (!existing) {
        await queryInterface.sequelize.query(
          `INSERT INTO questions (question_set_id, question_text, points, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)`,
          {
            bind: [qs.question_set_id, q.question_text, q.points, now, now],
            type: QueryTypes.INSERT,
          }
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    const [qs] = await queryInterface.sequelize.query(
      `SELECT question_set_id FROM question_sets WHERE title = $1`,
      { bind: ['Board Wars Quiz Set 1'], type: QueryTypes.SELECT }
    );

    if (!qs) return;

    await queryInterface.sequelize.query(
      `DELETE FROM questions WHERE question_set_id = $1 AND question_text = ANY($2)`,
      {
        bind: [
          qs.question_set_id,
          ['What is the capital of France?', 'The Earth is flat.', '2 + 2 equals?'],
        ],
        type: QueryTypes.DELETE,
      }
    );
  },
};
