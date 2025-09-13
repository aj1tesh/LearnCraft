const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizQuestion = sequelize.define('QuizQuestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidOptions(value) {
        if (!Array.isArray(value) || value.length < 2) {
          throw new Error('Options must be an array with at least 2 items');
        }
      }
    }
  },
  correctAnswer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isValidAnswer(value) {
        if (value < 0 || value >= this.options.length) {
          throw new Error('Correct answer must be a valid option index');
        }
      }
    }
  },
  lectureId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'lectures',
      key: 'id'
    }
  }
}, {
  tableName: 'quiz_questions'
});

module.exports = QuizQuestion;
