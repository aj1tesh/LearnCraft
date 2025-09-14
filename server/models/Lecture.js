const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lecture = sequelize.define('Lecture', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  type: {
    type: DataTypes.ENUM('reading', 'quiz', 'text-document'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true // For reading lectures
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true // For text documents
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [] // Array of file objects with filename, originalName, mimetype, size
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  }
}, {
  tableName: 'lectures'
});

module.exports = Lecture;
