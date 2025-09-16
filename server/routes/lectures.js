const express = require('express');
const { Lecture, QuizQuestion, StudentProgress, Course } = require('../models');
const { authenticateToken, requireStudent, requireInstructor } = require('../middleware/auth');
const { validateQuizSubmission, validateLectureCreation, validateQuizQuestion } = require('../middleware/validation');

const router = express.Router();

router.get('/:lectureId', authenticateToken, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const lecture = await Lecture.findByPk(lectureId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'instructorId']
        },
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['id', 'questionText', 'options']
        }
      ]
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    if (userRole === 'instructor' && lecture.course.instructorId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this lecture'
      });
    }

    let progress = null;
    if (userRole === 'student') {
      progress = await StudentProgress.findOne({
        where: { studentId: userId, lectureId }
      });
    }

    res.json({
      success: true,
      data: {
        lecture,
        progress: progress || { isCompleted: false, quizScore: null, quizAttempts: 0 }
      }
    });
  } catch (error) {
    console.error('Get lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.delete('/:lectureId', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const instructorId = req.user.id;

    const lecture = await Lecture.findByPk(lectureId, {
      include: [
        {
          model: Course,
          as: 'course',
          where: { instructorId }
        }
      ]
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found or you do not have permission to delete it'
      });
    }

    await QuizQuestion.destroy({ where: { lectureId } });
    await StudentProgress.destroy({ where: { lectureId } });
    await lecture.destroy();

    res.json({
      success: true,
      message: 'Lecture deleted successfully'
    });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/:lectureId/complete', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const studentId = req.user.id;

    const lecture = await Lecture.findByPk(lectureId);
    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    if (lecture.type !== 'reading' && lecture.type !== 'text-document') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for reading and text-document lectures'
      });
    }

    const existingProgress = await StudentProgress.findOne({
      where: { studentId, lectureId }
    });

    if (existingProgress && existingProgress.isCompleted) {
      return res.json({
        success: true,
        message: 'Lecture already completed',
        data: { progress: existingProgress }
      });
    }

    const progress = await StudentProgress.upsert({
      studentId,
      lectureId,
      isCompleted: true,
      completedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Lecture marked as completed',
      data: { progress: progress[0] }
    });
  } catch (error) {
    console.error('Complete lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/:lectureId/quiz/submit', authenticateToken, requireStudent, validateQuizSubmission, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { answers } = req.body;
    const studentId = req.user.id;

    const lecture = await Lecture.findByPk(lectureId, {
      include: [
        {
          model: QuizQuestion,
          as: 'questions',
          attributes: ['id', 'questionText', 'options', 'correctAnswer']
        }
      ]
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found'
      });
    }

    if (lecture.type !== 'quiz') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for quiz lectures'
      });
    }

    const questions = lecture.questions;
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No questions found for this quiz'
      });
    }

    if (answers.length !== questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of answers must match number of questions'
      });
    }

    let correctAnswers = 0;
    const results = questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionId: question.id,
        questionText: question.questionText,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect
      };
    });

    const score = (correctAnswers / questions.length) * 100;
    const passed = score >= 70;

    const [progress] = await StudentProgress.upsert({
      studentId,
      lectureId,
      isCompleted: passed,
      completedAt: passed ? new Date() : null,
      quizScore: score,
      quizAttempts: 1 // This will be incremented properly in a real implementation
    });

    res.json({
      success: true,
      message: passed ? 'Quiz passed!' : 'Quiz failed. Try again.',
      data: {
        score,
        passed,
        correctAnswers,
        totalQuestions: questions.length,
        results,
        progress
      }
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;