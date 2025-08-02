// routes/schedule.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { auth } = require('../middleware/auth');

// GET schedule for the current user
router.get('/', auth, async (req, res) => {
  try {
    let courses;
    
    switch (req.user.role) {
      case 'admin':
        // Admin can see all courses
        courses = await Course.find()
          .populate('faculty', 'name email')
          .populate('students', 'name email');
        break;
      case 'faculty':
        // Faculty can see courses they teach
        courses = await Course.find({ faculty: req.user._id })
          .populate('faculty', 'name email')
          .populate('students', 'name email');
        break;
      case 'student':
        // Students can see courses they're enrolled in
        courses = await Course.find({ students: req.user._id })
          .populate('faculty', 'name email');
        break;
      default:
        courses = [];
    }
    
    // Transform courses into schedule items
    const schedule = [];
    courses.forEach(course => {
      if (course.schedule && course.schedule.length > 0) {
        course.schedule.forEach(slot => {
          schedule.push({
            _id: `${course._id}-${slot.day}-${slot.time}`,
            course: {
              _id: course._id,
              name: course.name,
              code: course.code
            },
            dayOfWeek: slot.day,
            startTime: slot.time,
            endTime: slot.time, // Assuming 1-hour slots for now
            room: slot.room || '',
            type: 'lecture',
            faculty: {
              _id: course.faculty._id,
              name: course.faculty.name
            }
          });
        });
      }
    });
    
    res.json({ success: true, schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule', error: error.message });
  }
});

// POST new schedule item (add to course)
router.post('/', auth, async (req, res) => {
  try {
    const { courseId, dayOfWeek, startTime, endTime, room, type } = req.body;
    
    if (!courseId || !dayOfWeek || !startTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if user has permission to modify this course
    const isAdmin = req.user.role === 'admin';
    const isCourseFaculty = course.faculty.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCourseFaculty) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Add schedule slot to course
    course.schedule.push({
      day: dayOfWeek,
      time: startTime,
      room: room || ''
    });
    
    await course.save();
    
    res.json({ success: true, message: 'Schedule item added successfully' });
  } catch (error) {
    console.error('Error adding schedule item:', error);
    res.status(500).json({ success: false, message: 'Failed to add schedule item', error: error.message });
  }
});

// PUT update schedule item
router.put('/:id', auth, async (req, res) => {
  try {
    const { courseId, dayOfWeek, startTime, endTime, room, type } = req.body;
    
    if (!courseId || !dayOfWeek || !startTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if user has permission to modify this course
    const isAdmin = req.user.role === 'admin';
    const isCourseFaculty = course.faculty.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCourseFaculty) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Update schedule slot in course
    const scheduleIndex = course.schedule.findIndex(slot => 
      slot.day === dayOfWeek && slot.time === startTime
    );
    
    if (scheduleIndex === -1) {
      return res.status(404).json({ success: false, message: 'Schedule item not found' });
    }
    
    course.schedule[scheduleIndex] = {
      day: dayOfWeek,
      time: startTime,
      room: room || ''
    };
    
    await course.save();
    
    res.json({ success: true, message: 'Schedule item updated successfully' });
  } catch (error) {
    console.error('Error updating schedule item:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule item', error: error.message });
  }
});

// DELETE schedule item
router.delete('/:id', auth, async (req, res) => {
  try {
    const { courseId, dayOfWeek, startTime } = req.body;
    
    if (!courseId || !dayOfWeek || !startTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    // Check if user has permission to modify this course
    const isAdmin = req.user.role === 'admin';
    const isCourseFaculty = course.faculty.toString() === req.user._id.toString();
    
    if (!isAdmin && !isCourseFaculty) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Remove schedule slot from course
    course.schedule = course.schedule.filter(slot => 
      !(slot.day === dayOfWeek && slot.time === startTime)
    );
    
    await course.save();
    
    res.json({ success: true, message: 'Schedule item deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    res.status(500).json({ success: false, message: 'Failed to delete schedule item', error: error.message });
  }
});

module.exports = router; 