const express = require('express');
const { Lecture, QuizQuestion, StudentProgress, Course } = require('../models');
const { authenticateToken, requireStudent, requireInstructor } = require('../middleware/auth');
const { validateQuizSubmission, validateLectureCreation, validateQuizQuestion } = require('../middleware/validation');

const router = express.Router();

// Update lecture (instructors only)
router.put('/:lectureId', authenticateToken, requireInstructor, validateLectureCreation, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, content } = req.body;
    const instructorId = req.user.id;

    // Find the lecture and verify ownership
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
        message: 'Lecture not found or you do not have permission to modify it'
      });
    }

    // Update lecture
    await lecture.update({
      title,
      content: lecture.type === 'reading' ? content : lecture.content
    });

    res.json({
      success: true,
      message: 'Lecture updated successfully',
      data: { lecture }
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update quiz questions (instructors only)
router.put('/:lectureId/questions', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { questions } = req.body;
    const instructorId = req.user.id;

    // Find the lecture and verify ownership
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
        message: 'Lecture not found or you do not have permission to modify it'
      });
    }

    if (lecture.type !== 'quiz') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for quiz lectures'
      });
    }

    // Delete existing questions
    await QuizQuestion.destroy({
      where: { lectureId }
    });

    // Create new questions
    const createdQuestions = [];
    for (const question of questions) {
      if (question.questionText.trim() && question.options.some(opt => opt.trim())) {
        const createdQuestion = await QuizQuestion.create({
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          lectureId
        });
        createdQuestions.push(createdQuestion);
      }
    }

    res.json({
      success: true,
      message: 'Quiz questions updated successfully',
      data: { questions: createdQuestions }
    });
  } catch (error) {
    console.error('Update quiz questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get lecture details (students only)
router.get('/:lectureId', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const studentId = req.user.id;

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

    // Get student's progress for this lecture
    const progress = await StudentProgress.findOne({
      where: { studentId, lectureId }
    });

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

// Update lecture (instructors only)
router.put('/:lectureId', authenticateToken, requireInstructor, validateLectureCreation, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { title, content } = req.body;
    const instructorId = req.user.id;

    // Find the lecture and verify ownership
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
        message: 'Lecture not found or you do not have permission to modify it'
      });
    }

    // Update lecture
    await lecture.update({
      title,
      content: lecture.type === 'reading' ? content : lecture.content
    });

    res.json({
      success: true,
      message: 'Lecture updated successfully',
      data: { lecture }
    });
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update quiz questions (instructors only)
router.put('/:lectureId/questions', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { questions } = req.body;
    const instructorId = req.user.id;

    // Find the lecture and verify ownership
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
        message: 'Lecture not found or you do not have permission to modify it'
      });
    }

    if (lecture.type !== 'quiz') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for quiz lectures'
      });
    }

    // Delete existing questions
    await QuizQuestion.destroy({
      where: { lectureId }
    });

    // Create new questions
    const createdQuestions = [];
    for (const question of questions) {
      if (question.questionText.trim() && question.options.some(opt => opt.trim())) {
        const createdQuestion = await QuizQuestion.create({
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          lectureId
        });
        createdQuestions.push(createdQuestion);
      }
    }

    res.json({
      success: true,
      message: 'Quiz questions updated successfully',
      data: { questions: createdQuestions }
    });
  } catch (error) {
    console.error('Update quiz questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark reading lecture as completed (students only)
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

    if (lecture.type !== 'reading') {
      return res.status(400).json({
        success: false,
        message: 'This endpoint is only for reading lectures'
      });
    }

    // Check if already completed
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

    // Mark as completed
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

// Submit quiz (students only)
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

    // Validate answers array length
    if (answers.length !== questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Number of answers must match number of questions'
      });
    }

    // Grade the quiz
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
    const passed = score >= 70; // 70% passing grade

    // Get or create progress record
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