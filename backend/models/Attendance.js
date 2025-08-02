const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remarks: String,
  // New fields for schedule-based attendance
  scheduleSlot: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    room: String
  },
  markedAt: {
    type: Date,
    default: Date.now
  },
  isWithinSchedule: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, course: 1, date: 1, 'scheduleSlot.day': 1, 'scheduleSlot.startTime': 1 }, { unique: true });

// Pre-save middleware to validate schedule
attendanceSchema.pre('save', async function(next) {
  try {
    // Get the course to check its schedule
    const Course = mongoose.model('Course');
    const course = await Course.findById(this.course);
    
    if (!course) {
      return next(new Error('Course not found'));
    }

    // Check if the attendance is being marked for a scheduled day and time
    const attendanceDate = new Date(this.date);
    const dayOfWeek = attendanceDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find matching schedule slot
    const matchingSlot = course.schedule.find(slot => 
      slot.day === dayOfWeek && 
      slot.time === this.scheduleSlot.startTime
    );

    if (matchingSlot) {
      this.scheduleSlot = {
        day: matchingSlot.day,
        startTime: matchingSlot.time,
        endTime: matchingSlot.time, // Assuming 1-hour slots
        room: matchingSlot.room || ''
      };
      this.isWithinSchedule = true;
    } else {
      this.isWithinSchedule = false;
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);