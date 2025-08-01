const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'faculty', 'library', 'placement', 'pending'],
    default: 'student'
  },
  branch: {
    type: String,
    // This logic is now handled in the route/service layer
  },
  department: {
    type: String,
    // For storing department information like "B.Tech - CS"
  },
  courses: [{
    type: String,
    trim: true
  }],
  subjects: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  profile: {
    course: String,
    branch: String,
    phone: String,
    address: String,
    studentId: String,
    employeeId: String,
    semester: String,
    section: String
  },
  adminPrograms: [{
    type: String,
    enum: ['B.Tech', 'M.Tech', 'B.Pharma', 'MCA', 'MBA']
  }]
});

// Password hashing and comparison methods from your original User model should be here
// (Assuming they are defined on the schema elsewhere or will be added)

module.exports = mongoose.model('User', userSchema);