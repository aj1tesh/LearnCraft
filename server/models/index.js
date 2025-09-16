const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Lecture = require('./Lecture');
const QuizQuestion = require('./QuizQuestion');
const StudentProgress = require('./StudentProgress');

User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

Course.hasMany(Lecture, { foreignKey: 'courseId', as: 'lectures' });
Lecture.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Lecture.hasMany(QuizQuestion, { foreignKey: 'lectureId', as: 'questions' });
QuizQuestion.belongsTo(Lecture, { foreignKey: 'lectureId', as: 'lecture' });

User.hasMany(StudentProgress, { foreignKey: 'studentId', as: 'progress' });
StudentProgress.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Lecture.hasMany(StudentProgress, { foreignKey: 'lectureId', as: 'studentProgress' });
StudentProgress.belongsTo(Lecture, { foreignKey: 'lectureId', as: 'lecture' });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Course,
  Lecture,
  QuizQuestion,
  StudentProgress,
  syncDatabase
};
