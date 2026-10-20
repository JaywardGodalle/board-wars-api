'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('answers', {
      answer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      session_player_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'session_players', key: 'session_player_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'questions', key: 'question_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      choice_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'choices', key: 'choice_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      answered_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.sequelize.query(`
      ALTER TABLE answers
      ADD CONSTRAINT answers_player_question_unique
      UNIQUE (session_player_id, question_id)
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('answers');
  },
};
