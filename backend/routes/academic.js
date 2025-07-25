const express = require('express');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/academic/courses
// @desc    Get courses for current user
// @access  Private
router.get('/courses', auth, async (req, res) => {
  try {
    let courses;
    
    if (req.user.role === 'student') {
      courses = await Course.find({ enrolledStudents: req.user._id })
        .populate('faculty', 'name email');
    } else if (req.user.role === 'faculty') {
      courses = await Course.find({ faculty: req.user._id })
        .populate('enrolledStudents', 'name profile.studentId');
    } else {
      courses = await Course.find()
        .populate('faculty', 'name email')
        .populate('enrolledStudents', 'name profile.studentId');
    }

    res.json({
      success: true,
      courses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/academic/attendance
// @desc    Get attendance for current user
// @access  Private
router.get('/attendance', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }
    
    if (courseId) {
      query.course = courseId;
    }

    const attendance = await Attendance.find(query)
      .populate('course', 'name code')
      .populate('student', 'name profile.studentId')
      .sort({ date: -1 });

    // Calculate attendance percentage by course
    const attendanceStats = {};
    attendance.forEach(record => {
      const courseId = record.course._id.toString();
      if (!attendanceStats[courseId]) {
        attendanceStats[courseId] = {
          course: record.course,
          total: 0,
          present: 0,
          percentage: 0
        };
      }
      attendanceStats[courseId].total++;
      if (record.status === 'present') {
        attendanceStats[courseId].present++;
      }
    });

    // Calculate percentages
    Object.keys(attendanceStats).forEach(courseId => {
      const stats = attendanceStats[courseId];
      stats.percentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
    });

    res.json({
      success: true,
      attendance,
      stats: Object.values(attendanceStats)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/academic/attendance
// @desc    Mark attendance (faculty only)
// @access  Private
router.post('/attendance', auth, authorize('faculty', 'admin'), async (req, res) => {
  try {
    const { courseId, studentId, date, status, remarks } = req.body;
    const course = await Course.findById(courseId);
    console.log('[ATTENDANCE] User:', req.user && req.user._id, 'Role:', req.user && req.user.role, 'Course faculty:', course && course.faculty);

    // Check if the faculty owns the course or is admin
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: `You are not authorized to mark attendance for this course. Your user ID: ${req.user._id}, course faculty: ${course.faculty}` });
    }

    // Check if attendance already exists
    const existingAttendance = await Attendance.findOne({
      student: studentId,
      course: courseId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    const attendance = new Attendance({
      student: studentId,
      course: courseId,
      date: new Date(date),
      status,
      markedBy: req.user._id,
      remarks
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/academic/marks
// @desc    Get marks for current user
// @access  Private
router.get('/marks', auth, async (req, res) => {
  try {
    const { courseId } = req.query;
    
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }
    
    if (courseId) {
      query.course = courseId;
    }

    const marks = await Marks.find(query)
      .populate('course', 'name code')
      .populate('student', 'name profile.studentId')
      .sort({ examDate: -1 });

    res.json({
      success: true,
      marks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/academic/marks
// @desc    Add marks (faculty only)
// @access  Private
router.post('/marks', auth, authorize('faculty'), async (req, res) => {
  try {
    const { studentId, courseId, type, title, marksObtained, totalMarks, examDate, remarks } = req.body;

    const marks = new Marks({
      student: studentId,
      course: courseId,
      type,
      title,
      marksObtained,
      totalMarks,
      examDate: new Date(examDate),
      uploadedBy: req.user._id,
      remarks
    });

    await marks.save();

    res.status(201).json({
      success: true,
      marks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;