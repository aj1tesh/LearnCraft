const express = require('express');
const { StudentProgress, Lecture, Course, User } = require('../models');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Get student's progress for all courses
router.get('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all courses with their lectures
    const courses = await Course.findAll({
      include: [
        {
          model: Lecture,
          as: 'lectures',
          attributes: ['id', 'title', 'type', 'order'],
          order: [['order', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get all student progress records
    const progress = await StudentProgress.findAll({
      where: { studentId }
    });

    // Create a map of progress by lecture ID
    const progressMap = {};
    progress.forEach(item => {
      progressMap[item.lectureId] = item;
    });

    // Build progress data for each course
    const progressByCourse = {};
    
    for (const course of courses) {
      const lecturesWithProgress = course.lectures.map(lecture => ({
        ...lecture.toJSON(),
        progress: progressMap[lecture.id] || {
          isCompleted: false,
          quizScore: null,
          quizAttempts: 0
        }
      }));

      const completedCount = lecturesWithProgress.filter(l => l.progress.isCompleted).length;
      const totalCount = lecturesWithProgress.length;

      progressByCourse[course.id] = {
        course: {
          id: course.id,
          title: course.title,
          description: course.description
        },
        lectures: lecturesWithProgress,
        completedCount,
        totalCount
      };
    }

    res.json({
      success: true,
      data: { progressByCourse }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get student's progress for a specific course
router.get('/course/:courseId', authenticateToken, requireStudent, async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    // Get all lectures for the course
    const lectures = await Lecture.findAll({
      where: { courseId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description']
        }
      ],
      order: [['order', 'ASC']]
    });

    // Get student's progress for these lectures
    const progress = await StudentProgress.findAll({
      where: { 
        studentId,
        lectureId: lectures.map(l => l.id)
      }
    });

    // Create a map of progress by lecture ID
    const progressMap = {};
    progress.forEach(item => {
      progressMap[item.lectureId] = item;
    });

    // Combine lectures with progress
    const lecturesWithProgress = lectures.map(lecture => ({
      ...lecture.toJSON(),
      progress: progressMap[lecture.id] || {
        isCompleted: false,
        quizScore: null,
        quizAttempts: 0
      }
    }));

    const completedCount = lecturesWithProgress.filter(l => l.progress.isCompleted).length;
    const totalCount = lectures.length;

    res.json({
      success: true,
      data: {
        course: lectures[0]?.course,
        lectures: lecturesWithProgress,
        progress: {
          completedCount,
          totalCount,
          percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
