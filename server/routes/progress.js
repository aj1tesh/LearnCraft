const express = require('express');
const { StudentProgress, Lecture, Course, User } = require('../models');
const { authenticateToken, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Get student's progress for all courses
router.get('/', authenticateToken, requireStudent, async (req, res) => {
  try {
    const studentId = req.user.id;

    const progress = await StudentProgress.findAll({
      where: { studentId },
      include: [
        {
          model: Lecture,
          as: 'lecture',
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title', 'description']
            }
          ]
        }
      ],
      order: [['completedAt', 'DESC']]
    });

    // Group progress by course
    const progressByCourse = {};
    progress.forEach(item => {
      const courseId = item.lecture.course.id;
      if (!progressByCourse[courseId]) {
        progressByCourse[courseId] = {
          course: item.lecture.course,
          lectures: [],
          completedCount: 0,
          totalCount: 0
        };
      }
      progressByCourse[courseId].lectures.push(item);
      if (item.isCompleted) {
        progressByCourse[courseId].completedCount++;
      }
    });

    // Get total lecture count for each course
    for (const courseId in progressByCourse) {
      const totalLectures = await Lecture.count({
        where: { courseId }
      });
      progressByCourse[courseId].totalCount = totalLectures;
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
