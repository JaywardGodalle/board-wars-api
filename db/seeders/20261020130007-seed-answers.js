'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    const now = new Date();

    const sessionIds = {};
    for (const code of ['BW0001', 'BW0002']) {
      const [s] = await queryInterface.sequelize.query(
        `SELECT session_id FROM sessions WHERE session_code = $1`,
        { bind: [code], type: QueryTypes.SELECT }
      );
      if (!s) throw new Error(`Session ${code} must be seeded before answers`);
      sessionIds[code] = s.session_id;
    }

    const playerIds = {};
    for (const key of ['BW0001-Alpha', 'BW0001-Beta', 'BW0001-Gamma']) {
      const [sessionCode, nickname] = key.split('-');
      const [sp] = await queryInterface.sequelize.query(
        `SELECT session_player_id FROM session_players WHERE session_id = $1 AND nickname = $2`,
        { bind: [sessionIds[sessionCode], nickname], type: QueryTypes.SELECT }
      );
      if (!sp) throw new Error(`Session player ${key} must be seeded before answers`);
      playerIds[key] = sp.session_player_id;
    }

    const [qs] = await queryInterface.sequelize.query(
      `SELECT question_set_id FROM question_sets WHERE title = $1`,
      { bind: ['Board Wars Quiz Set 1'], type: QueryTypes.SELECT }
    );
    if (!qs) throw new Error('Question set must be seeded before answers');

    const questionIds = {};
    for (const qtext of ['What is the capital of France?', 'The Earth is flat.', '2 + 2 equals?']) {
      const [q] = await queryInterface.sequelize.query(
        `SELECT question_id FROM questions WHERE question_set_id = $1 AND question_text = $2`,
        { bind: [qs.question_set_id, qtext], type: QueryTypes.SELECT }
      );
      if (!q) throw new Error(`Question ${qtext} must be seeded before answers`);
      questionIds[qtext] = q.question_id;
    }

    const choiceIds = {};
    for (const [qtext, ctext] of [
      ['What is the capital of France?', 'Paris'],
      ['What is the capital of France?', 'London'],
      ['The Earth is flat.', 'True'],
      ['The Earth is flat.', 'False'],
      ['2 + 2 equals?', '3'],
      ['2 + 2 equals?', '4'],
    ]) {
      const [c] = await queryInterface.sequelize.query(
        `SELECT choice_id FROM choices WHERE question_id = $1 AND choice_text = $2`,
        { bind: [questionIds[qtext], ctext], type: QueryTypes.SELECT }
      );
      if (!c) throw new Error(`Choice ${qtext}/${ctext} must be seeded before answers`);
      choiceIds[`${qtext}|${ctext}`] = c.choice_id;
    }

    const answers = [
      // Alpha: all correct
      { session_player: 'BW0001-Alpha', question: 'What is the capital of France?', choice: 'Paris', is_correct: true },
      { session_player: 'BW0001-Alpha', question: 'The Earth is flat.', choice: 'False', is_correct: true },
      { session_player: 'BW0001-Alpha', question: '2 + 2 equals?', choice: '4', is_correct: true },
      // Beta: all wrong (awkward case: zero correct answers)
      { session_player: 'BW0001-Beta', question: 'What is the capital of France?', choice: 'London', is_correct: false },
      { session_player: 'BW0001-Beta', question: 'The Earth is flat.', choice: 'True', is_correct: false },
      { session_player: 'BW0001-Beta', question: '2 + 2 equals?', choice: '3', is_correct: false },
      // Gamma: mixed
      { session_player: 'BW0001-Gamma', question: 'What is the capital of France?', choice: 'Paris', is_correct: true },
      { session_player: 'BW0001-Gamma', question: 'The Earth is flat.', choice: 'True', is_correct: false },
      { session_player: 'BW0001-Gamma', question: '2 + 2 equals?', choice: '3', is_correct: false },
    ];

    for (const a of answers) {
      await queryInterface.sequelize.query(
        `INSERT INTO answers (session_player_id, question_id, choice_id, is_correct, answered_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (session_player_id, question_id) DO NOTHING`,
        {
          bind: [
            playerIds[a.session_player],
            questionIds[a.question],
            choiceIds[`${a.question}|${a.choice}`],
            a.is_correct,
            now,
            now,
            now,
          ],
          type: QueryTypes.INSERT,
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const { QueryTypes } = queryInterface.sequelize;
    const sessionIds = {};
    for (const code of ['BW0001']) {
      const [s] = await queryInterface.sequelize.query(
        `SELECT session_id FROM sessions WHERE session_code = $1`,
        { bind: [code], type: QueryTypes.SELECT }
      );
      if (s) sessionIds[code] = s.session_id;
    }

    if (sessionIds['BW0001']) {
      const players = await queryInterface.sequelize.query(
        `SELECT session_player_id FROM session_players WHERE session_id = $1`,
        { bind: [sessionIds['BW0001']], type: QueryTypes.SELECT }
      );
      if (players.length) {
        const ids = players.map((p) => p.session_player_id);
        await queryInterface.sequelize.query(
          `DELETE FROM answers WHERE session_player_id = ANY($1)`,
          { bind: [ids], type: QueryTypes.DELETE }
        );
      }
    }
  },
};
