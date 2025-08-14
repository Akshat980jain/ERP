const mongoose = require('mongoose');

const attendancePolicySchema = new mongoose.Schema({
  weights: {
    present: { type: Number, default: 1 },
    late: { type: Number, default: 0.5 },
    absent: { type: Number, default: 0 },
    dutyLeave: { type: Number, default: 1 },
    medicalLeave: { type: Number, default: 1 },
  },
  graceRules: {
    lateGraceMinutes: { type: Number, default: 0 },
    maxLatePerSemester: { type: Number, default: 0 },
  },
  perCourseOverrides: [{
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    weights: {
      present: Number,
      late: Number,
      absent: Number,
      dutyLeave: Number,
      medicalLeave: Number,
    },
  }],
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  attendancePolicy: { type: attendancePolicySchema, default: () => ({}) },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);


