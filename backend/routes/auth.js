const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RoleRequest = require('../models/RoleRequest');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const Fee = require('../models/Fee');

const router = express.Router();

// NOTE: This is a combination of your original auth.js and the routes from the combined file.
// Please review for any logic that needs to be merged from your original User model (e.g., password hashing).

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @route   POST /api/auth/register (Direct registration - might need to be adjusted or removed)
// This was in your original auth.js. It's different from request-registration.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, profile, department } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ name, email, password, role, profile, department });
    await user.save();
    const token = generateToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/request-registration
// @desc    Request new user registration (for non-registered users)
router.post('/request-registration', async (req, res) => {
    console.log('Received registration request with body:', req.body);
    try {
        const { name, email, password, confirmPassword, requestedRole, branch, course, program } = req.body;
        
        // --- Corrected Validation Logic ---
        // 1. Base field validation
        if (!name || !email || !password || !confirmPassword || !requestedRole) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // 2. Conditional validation for branch and course
        const needsBranchCourse = ['student', 'faculty', 'placement'].includes(requestedRole);
        if (needsBranchCourse && (!branch || !course)) {
            return res.status(400).json({ message: 'Branch and course are required for the selected role' });
        }
        // --- End of Corrected Validation ---

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const existingRequest = await RoleRequest.findOne({ email: email.toLowerCase(), status: 'pending' });
        if (existingRequest) {
            return res.status(400).json({ message: 'Registration request already pending for this email' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const roleRequestData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            requestedRole,
            branch,
            program: program || course, // Use explicit program if provided, else fallback to course
            currentRole: 'none',
            reason: 'New user registration request'
        };
        const roleRequest = new RoleRequest(roleRequestData);
        await roleRequest.save();
        res.json({ success: true, message: 'Registration request submitted successfully' });
    } catch (error) {
        console.error('Registration request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Assuming you have a comparePassword method on your User model
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('courses');
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      studentId,
      employeeId,
      semester,
      section,
      department
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Current user email:', user.email);
    console.log('Requested email:', email);
    console.log('User ID:', req.user.id);

    // Update basic fields
    if (name) user.name = name;
    
    // Handle email update with proper validation
    if (email !== undefined && email !== user.email) {
      console.log('Email is being changed from', user.email, 'to', email);
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: req.user.id } 
      });
      
      console.log('Existing user with same email:', existingUser);
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      user.email = email;
    }

    // Update profile fields
    if (!user.profile) user.profile = {};
    if (phone !== undefined) user.profile.phone = phone;
    if (address !== undefined) user.profile.address = address;
    if (studentId !== undefined) user.profile.studentId = studentId;
    if (employeeId !== undefined) user.profile.employeeId = employeeId;
    if (semester !== undefined) user.profile.semester = semester;
    if (section !== undefined) user.profile.section = section;
    if (department !== undefined) user.department = department;

    console.log('Saving user with data:', {
      name: user.name,
      email: user.email,
      profile: user.profile,
      department: user.department
    });

    await user.save();

    // Return updated user data
    const updatedUser = await User.findById(req.user.id).populate('courses');
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle MongoDB duplicate key error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// @route   POST /api/auth/request-verification (For existing users to change role)
router.post('/request-verification', auth, async (req, res) => {
  try {
    const { requestedRole, reason, program } = req.body;
    if (!requestedRole || !reason) {
      return res.status(400).json({ message: 'Requested role and reason are required' });
    }
    if (req.user.role === requestedRole) {
      return res.status(400).json({ message: 'You already have this role.' });
    }
    const existing = await RoleRequest.findOne({ user: req.user._id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request for this role.' });
    }
    const request = new RoleRequest({
      user: req.user._id,
      requestedRole,
      currentRole: req.user.role,
      reason: reason.trim(),
      program
    });
    await request.save();
    res.json({ success: true, request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/verification-requests (Admin/Faculty view requests)
router.get('/verification-requests', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    let query = { status: 'pending' };
    const { role, adminPrograms } = req.user;

    const isProgramAdmin = role === 'admin' && Array.isArray(adminPrograms) && adminPrograms.length > 0;
    const isSuperAdmin = role === 'admin' && !isProgramAdmin;

    if (role === 'faculty') {
      // Faculty see all student requests for now.
      query.requestedRole = 'student';
    } else if (isProgramAdmin) {
      // Program Admins see student and faculty requests for their programs.
      query.requestedRole = { $in: ['student', 'faculty'] };
      query.program = { $in: adminPrograms };
    } else if (isSuperAdmin) {
      // Super Admins see requests for other admins, library, placement,
      // and any student request WITHOUT a program.
      query.$or = [
        { requestedRole: { $in: ['admin', 'library', 'placement'] } },
        { requestedRole: 'student', program: { $in: [null, ''] } }
      ];
    } else {
        // Fallback for any other case, should not happen with authorize middleware
        return res.json({ success: true, requests: [] });
    }

    const requests = await RoleRequest.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/verification-requests/:id/decision (Admin/Faculty approve/reject)
router.post('/verification-requests/:id/decision', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const request = await RoleRequest.findById(req.params.id).populate('user');
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }
    if (req.user.role === 'faculty' && request.requestedRole !== 'student') {
      return res.status(403).json({ message: 'Faculty can only approve student requests' });
    }

    if (status === 'approved') {
      if (request.user) {
        // This is a role change for an existing user
        if (request.requestedRole === 'admin' && request.program) {
          // Add program to adminPrograms array if not already present
          await User.findByIdAndUpdate(request.user._id, {
            role: request.requestedRole,
            $addToSet: { adminPrograms: request.program }
          });
        } else {
          await User.findByIdAndUpdate(request.user._id, { role: request.requestedRole });
        }
      } else {
        // This is a new user registration request
        if (!request.name || !request.email || !request.password) {
            return res.status(400).json({ message: 'Cannot approve request: missing required user data.' });
        }
        const newUserData = {
          name: request.name,
          email: request.email,
          password: request.password, // This should be hashed
          role: request.requestedRole,
          branch: request.branch, // Renamed from department for consistency
          program: request.program, // Transfer the program field
          profile: {
            course: request.course, // Keep original course if needed
            branch: request.branch
          },
          isVerified: true,
          createdBy: req.user._id
        };
        if (request.requestedRole === 'admin' && request.program) {
          newUserData.adminPrograms = [request.program];
        }
        const newUser = new User(newUserData);
        await newUser.save();
        request.user = newUser._id; // Link the request to the new user
      }
    }

    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (remarks) request.remarks = remarks;
    await request.save();
    
    res.json({ success: true, message: `Request ${status} successfully`, request });
  } catch (error) {
    console.error('Error processing verification request:', error);
    res.status(500).json({ message: error.message || 'Server error', error });
  }
});

// @route   GET /api/auth/admin-stats
// @desc    Get admin dashboard statistics
// @access  Private (admin only)
router.get('/admin-stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    
    // Correctly count distinct programs as "Active Courses"
    const activePrograms = await User.distinct('program', { program: { $ne: null, $ne: '' } });
    const totalCourses = activePrograms.length;

    let totalRevenue = 0;
    try {
      const paidFees = await Fee.find({ status: 'paid' });
      totalRevenue = paidFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    } catch {}
    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/department-enrollment
// @desc    Get department-wise student enrollment
// @access  Private (admin only)
router.get('/department-enrollment', auth, authorize('admin'), async (req, res) => {
  try {
    // Group students by branch/department
    const pipeline = [
      { $match: { role: 'student' } },
      { $group: { _id: '$branch', students: { $sum: 1 } } },
      { $project: { department: '$_id', students: 1, _id: 0 } },
      { $sort: { students: -1 } }
    ];
    const departments = await User.aggregate(pipeline);
    res.json({ success: true, departments });
  } catch (error) {
    console.error('Department enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/monthly-revenue
// @desc    Get monthly revenue trend
// @access  Private (admin only)
router.get('/monthly-revenue', auth, authorize('admin'), async (req, res) => {
  try {
    // Group paid fees by month
    const pipeline = [
      { $match: { status: 'paid' } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
        amount: { $sum: '$amount' }
      } },
      { $sort: { '_id': 1 } }
    ];
    const revenueRaw = await Fee.aggregate(pipeline);
    // Format for chart
    const revenue = revenueRaw.map(r => ({
      month: r._id,
      amount: r.amount
    }));
    res.json({ success: true, revenue });
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/auth/admins-by-program
// @desc    Get all admins for a specific program
// @access  Private (admin only)
router.get('/admins-by-program', auth, authorize('admin'), async (req, res) => {
  try {
    const { program } = req.query;
    if (!program) {
      return res.status(400).json({ message: 'Program is required' });
    }
    const admins = await User.find({ role: 'admin', adminPrograms: program });
    res.json({ success: true, admins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
