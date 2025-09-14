const express = require('express');
const { Course, Lecture, QuizQuestion, User } = require('../models');
const { authenticateToken, requireInstructor, requireStudent } = require('../middleware/auth');
const { validateCourseCreation, validateLectureCreation, validateQuizQuestion } = require('../middleware/validation');
const { upload, handleUploadErrors } = require('../middleware/upload');

const router = express.Router();

// GET / - List all courses with instructor and lecture info
router.get('/', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Lecture,
          as: 'lectures',
          attributes: ['id', 'title', 'type', 'order'],
          order: [['order', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /:id - Get course details with lectures
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Lecture,
          as: 'lectures',
          include: [
            {
              model: QuizQuestion,
              as: 'questions',
              attributes: ['id', 'questionText', 'options']
            }
          ],
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: { course }
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST / - Create new course (instructor only)
router.post('/', authenticateToken, requireInstructor, validateCourseCreation, async (req, res) => {
  try {
    const { title, description } = req.body;
    const instructorId = req.user.id;

    const course = await Course.create({
      title,
      description,
      instructorId
    });

    // Return course with instructor details
    const createdCourse = await Course.findByPk(course.id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course: createdCourse }
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /instructor/my-courses - Get instructor's courses
router.get('/instructor/my-courses', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const instructorId = req.user.id;

    const courses = await Course.findAll({
      where: { instructorId },
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

    res.json({
      success: true,
      data: { courses }
    });
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add lecture to course (instructors only)
router.post('/:courseId/lectures', 
  authenticateToken, 
  requireInstructor, 
  upload.array('files', 5), 
  handleUploadErrors,
  async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, type, content, description, order } = req.body;

    // Check if course exists and belongs to the instructor
    const course = await Course.findOne({
      where: { id: courseId, instructorId: req.user.id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to modify it'
      });
    }

    // Process uploaded files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
      }));
    }

    // Create lecture
    const lecture = await Lecture.create({
      title,
      type,
      content: (type === 'reading' || type === 'text-document') ? content : null,
      description: type === 'text-document' ? description : null,
      attachments: attachments.length > 0 ? attachments : null,
      order: order || 0,
      courseId
    });

    res.status(201).json({
      success: true,
      message: 'Lecture created successfully',
      data: { lecture }
    });
  } catch (error) {
    console.error('Create lecture error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add quiz questions to lecture (instructors only)
router.post('/:courseId/lectures/:lectureId/questions', authenticateToken, requireInstructor, validateQuizQuestion, async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { questionText, options, correctAnswer } = req.body;

    // Verify course and lecture ownership
    const course = await Course.findOne({
      where: { id: courseId, instructorId: req.user.id },
      include: [
        {
          model: Lecture,
          as: 'lectures',
          where: { id: lectureId }
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course or lecture not found or you do not have permission to modify it'
      });
    }

    // Validate correct answer index
    if (correctAnswer >= options.length || correctAnswer < 0) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer index is invalid'
      });
    }

    // Create quiz question
    const question = await QuizQuestion.create({
      questionText,
      options,
      correctAnswer,
      lectureId
    });

    res.status(201).json({
      success: true,
      message: 'Quiz question created successfully',
      data: { question }
    });
  } catch (error) {
    console.error('Create quiz question error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /:id - Delete course (instructor only)
router.delete('/:id', authenticateToken, requireInstructor, async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.user.id;

    // Find the course and verify ownership
    const course = await Course.findOne({
      where: { id, instructorId },
      include: [
        {
          model: Lecture,
          as: 'lectures',
          include: [
            {
              model: QuizQuestion,
              as: 'questions'
            }
          ]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission to delete it'
      });
    }

    // Delete all quiz questions first
    for (const lecture of course.lectures) {
      if (lecture.questions && lecture.questions.length > 0) {
        await QuizQuestion.destroy({
          where: { lectureId: lecture.id }
        });
      }
    }

    // Delete all lectures
    await Lecture.destroy({
      where: { courseId: id }
    });

    // Delete the course
    await Course.destroy({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Course and all associated data deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
