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
      throw new Error('Question set must be seeded before choices');
    }

    const choices = [
      { question_text: 'What is the capital of France?', choice_text: 'Paris', is_correct: true },
      { question_text: 'What is the capital of France?', choice_text: 'London', is_correct: false },
      { question_text: 'The Earth is flat.', choice_text: 'True', is_correct: false },
      { question_text: 'The Earth is flat.', choice_text: 'False', is_correct: true },
      { question_text: '2 + 2 equals?', choice_text: '3', is_correct: false },
      { question_text: '2 + 2 equals?', choice_text: '4', is_correct: true },
    ];

    for (const c of choices) {
      const [q] = await queryInterface.sequelize.query(
        `SELECT question_id FROM questions WHERE question_set_id = $1 AND question_text = $2`,
        { bind: [qs.question_set_id, c.question_text], type: QueryTypes.SELECT }
      );

      if (!q) continue;

      const [existing] = await queryInterface.sequelize.query(
        `SELECT choice_id FROM choices WHERE question_id = $1 AND choice_text = $2`,
        { bind: [q.question_id, c.choice_text], type: QueryTypes.SELECT }
      );

      if (!existing) {
        await queryInterface.sequelize.query(
          `INSERT INTO choices (question_id, choice_text, is_correct, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)`,
          {
            bind: [q.question_id, c.choice_text, c.is_correct, now, now],
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
      `DELETE FROM choices WHERE question_id IN (
         SELECT question_id FROM questions WHERE question_set_id = $1
       )`,
      { bind: [qs.question_set_id], type: QueryTypes.DELETE }
    );
  },
};
