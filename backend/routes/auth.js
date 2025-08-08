const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RoleRequest = require('../models/RoleRequest');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course');
const Fee = require('../models/Fee');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
    
    console.log('Generating token with:', { 
      id, 
      secret: secret.substring(0, 10) + '...',
      expiresIn 
    });
    
    return jwt.sign({ id }, secret, {
      expiresIn,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    throw error;
  }
};

// @route   POST /api/auth/register
// @desc    Direct registration (should be restricted or removed in production)
// @access  Public (consider making this admin-only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, profile, department } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password, 
      role: role || 'student', 
      profile, 
      department,
      isVerified: true // Direct registration auto-verifies
    });
    
    await user.save();
    const token = generateToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ success: true, token, user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/request-registration
// @desc    Request new user registration (for non-registered users)
// @access  Public
router.post('/request-registration', async (req, res) => {
  console.log('Received registration request with body:', req.body);
  try {
    const { name, email, password, confirmPassword, requestedRole, branch, course, program } = req.body;
    
    // Base field validation
    if (!name || !email || !password || !confirmPassword || !requestedRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'All required fields must be provided' 
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please enter a valid email address' 
      });
    }

    // Password confirmation validation
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Passwords do not match' 
      });
    }

    // Password strength validation
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Role-specific field validation
    const needsBranchCourse = ['student', 'faculty', 'placement'].includes(requestedRole);
    if (needsBranchCourse && (!branch || !course)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Branch and course are required for the selected role' 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Check for existing pending request
    const existingPendingRequest = await RoleRequest.findOne({ 
      email: email.toLowerCase(), 
      status: 'pending' 
    });
    if (existingPendingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration request already pending for this email' 
      });
    }

    // Check for existing approved request
    const existingApprovedRequest = await RoleRequest.findOne({ 
      email: email.toLowerCase(), 
      status: 'approved' 
    });
    if (existingApprovedRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration request already approved for this email. You can now login.' 
      });
    }

    // Check for existing rejected request - allow resubmission
    const existingRejectedRequest = await RoleRequest.findOne({ 
      email: email.toLowerCase(), 
      status: 'rejected' 
    });
    if (existingRejectedRequest) {
      // Update the rejected request instead of creating a new one
      existingRejectedRequest.name = name.trim();
      existingRejectedRequest.password = password;
      existingRejectedRequest.requestedRole = requestedRole;
      existingRejectedRequest.branch = branch ? branch.trim() : null;
      existingRejectedRequest.course = course ? course.trim() : null;
      existingRejectedRequest.program = program ? program.trim() : (course ? course.trim() : null);
      existingRejectedRequest.status = 'pending';
      existingRejectedRequest.reviewedBy = null;
      existingRejectedRequest.reviewedAt = null;
      existingRejectedRequest.remarks = null;
      
      await existingRejectedRequest.save();
      
      console.log('✅ Rejected request updated and resubmitted:', {
        name: existingRejectedRequest.name,
        email: existingRejectedRequest.email,
        requestedRole: existingRejectedRequest.requestedRole
      });
      
      res.json({ 
        success: true, 
        message: 'Registration request resubmitted successfully. Please wait for admin approval.' 
      });
      return;
    }

    // Store plain password in role request (will be hashed when user is created)
    const roleRequestData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password, // Store plain password
      requestedRole,
      branch: branch ? branch.trim() : null,
      course: course ? course.trim() : null,
      program: program ? program.trim() : (course ? course.trim() : null),
      currentRole: 'none',
      reason: 'New user registration request'
    };

    const roleRequest = new RoleRequest(roleRequestData);
    await roleRequest.save();
    
    console.log('✅ Registration request created successfully:', {
      name: roleRequest.name,
      email: roleRequest.email,
      requestedRole: roleRequest.requestedRole,
      hasPassword: !!roleRequest.password
    });
    
    res.json({ 
      success: true, 
      message: 'Registration request submitted successfully. Please wait for admin approval.' 
    });
  } catch (error) {
    console.error('Registration request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received:', { 
      body: req.body, 
      headers: req.headers['content-type'] 
    });

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Please enter a valid email address' 
      });
    }

    console.log('Looking for user with email:', email.toLowerCase());

    // Find user by email (case-insensitive) and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('User found:', {
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      hasPassword: !!user.password
    });

    // Check if user is verified
    if (!user.isVerified) {
      console.log('User not verified:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Account not verified. Please contact administrator.' 
      });
    }

    console.log('Attempting password comparison...');

    // Compare password using the model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('Password match successful');

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log('Generating JWT token...');

    // Generate token
    const token = generateToken(user._id);
    
    console.log('Token generated successfully');

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('Login successful for user:', email);

    res.json({ 
      success: true, 
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error('Login error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Server error. Please try again later.' 
    });
  }
});

// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('courses').select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/auth/profile
// @access  Private
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
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('Profile update - Current user email:', user.email);
    console.log('Profile update - Requested email:', email);

    // Update basic fields with validation
    if (name && name.trim()) {
      user.name = name.trim();
    }
    
    // Handle email update with proper validation
    if (email && email !== user.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please enter a valid email address' 
        });
      }

      console.log('Email is being changed from', user.email, 'to', email);
      
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already exists' 
        });
      }
      user.email = email.toLowerCase().trim();
    }

    // Initialize profile object if it doesn't exist
    if (!user.profile) {
      user.profile = {};
    }

    // Update profile fields only if provided
    if (phone !== undefined) user.profile.phone = phone;
    if (address !== undefined) user.profile.address = address;
    if (studentId !== undefined) user.profile.studentId = studentId;
    if (employeeId !== undefined) user.profile.employeeId = employeeId;
    if (semester !== undefined) user.profile.semester = semester;
    if (section !== undefined) user.profile.section = section;
    if (department !== undefined) user.department = department;

    console.log('Saving user with updated data');
    await user.save();

    // Return updated user data without password
    const updatedUser = await User.findById(req.user.id)
      .populate('courses')
      .select('-password');
    
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
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

// @route   POST /api/auth/request-verification
// @desc    Request role change for existing users
// @access  Private
router.post('/request-verification', auth, async (req, res) => {
  try {
    const { requestedRole, reason, program } = req.body;
    
    if (!requestedRole || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Requested role and reason are required' 
      });
    }

    if (req.user.role === requestedRole) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have this role' 
      });
    }

    // Check for existing pending request
    const existing = await RoleRequest.findOne({ 
      user: req.user._id, 
      status: 'pending' 
    });
    
    if (existing) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending role change request' 
      });
    }

    const request = new RoleRequest({
      user: req.user._id,
      requestedRole,
      currentRole: req.user.role,
      reason: reason.trim(),
      program: program ? program.trim() : null
    });
    
    await request.save();
    
    res.json({ 
      success: true, 
      message: 'Role change request submitted successfully',
      request 
    });
  } catch (error) {
    console.error('Role change request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/verification-requests
// @desc    Get pending verification requests based on user role
// @access  Private (admin/faculty)
router.get('/verification-requests', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    let query = { status: 'pending' };
    const { role, adminPrograms } = req.user;

    const isProgramAdmin = role === 'admin' && Array.isArray(adminPrograms) && adminPrograms.length > 0;
    const isSuperAdmin = role === 'admin' && (!adminPrograms || adminPrograms.length === 0);

    if (role === 'faculty') {
      // Faculty can only see student requests
      query.requestedRole = 'student';
    } else if (isProgramAdmin) {
      // Program Admins see student and faculty requests for their programs
      query.$and = [
        { requestedRole: { $in: ['student', 'faculty'] } },
        { $or: [
          { program: { $in: adminPrograms } },
          { program: { $in: [null, ''] } } // Include requests without program
        ]}
      ];
    } else if (isSuperAdmin) {
      // Super Admins see all admin, library, placement requests,
      // and student requests without specific programs
      query.$or = [
        { requestedRole: { $in: ['admin', 'library', 'placement'] } },
        { requestedRole: 'student', $or: [
          { program: { $in: [null, ''] } },
          { program: { $exists: false } }
        ]}
      ];
    }

    const requests = await RoleRequest.find(query)
      .populate('user', 'name email role')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, requests });
  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/verification-requests/:id/decision
// @desc    Approve or reject verification requests with guaranteed user creation
// @access  Private (admin/faculty)
router.post('/verification-requests/:id/decision', auth, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    console.log(`\n🔄 Processing verification request decision:`, {
      requestId: req.params.id,
      status,
      reviewer: req.user.email,
      reviewerRole: req.user.role
    });
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be "approved" or "rejected"' 
      });
    }

    const request = await RoleRequest.findById(req.params.id).populate('user');
    if (!request) {
      console.log('❌ Request not found:', req.params.id);
      return res.status(404).json({ 
        success: false, 
        message: 'Request not found' 
      });
    }

    console.log('📋 Request details:', {
      name: request.name,
      email: request.email,
      requestedRole: request.requestedRole,
      currentStatus: request.status,
      hasUser: !!request.user
    });

    if (request.status !== 'pending') {
      console.log('❌ Request already processed:', request.status);
      return res.status(400).json({ 
        success: false, 
        message: 'Request already processed' 
      });
    }

    // Authorization check for faculty
    if (req.user.role === 'faculty' && request.requestedRole !== 'student') {
      console.log('❌ Faculty cannot approve non-student requests');
      return res.status(403).json({ 
        success: false, 
        message: 'Faculty can only approve student requests' 
      });
    }

    // Process approval with guaranteed user creation
    if (status === 'approved') {
      console.log('✅ Processing approval...');
      
      if (request.user) {
        // Existing user role change
        console.log('🔄 Updating existing user role...');
        const updateData = { role: request.requestedRole };
        
        if (request.requestedRole === 'admin' && request.program) {
          updateData.$addToSet = { adminPrograms: request.program };
        }
        
        await User.findByIdAndUpdate(request.user._id, updateData);
        console.log('✅ Existing user updated successfully');
      } else {
        // New user registration - GUARANTEED CREATION
        console.log('🆕 Creating new user from approved request...');
        
        // Validate required data
        if (!request.name || !request.email || !request.password) {
          console.log('❌ Missing required user data:', {
            hasName: !!request.name,
            hasEmail: !!request.email,
            hasPassword: !!request.password
          });
          return res.status(400).json({ 
            success: false, 
            message: 'Cannot approve request: missing required user data' 
          });
        }

        // Check if user already exists (double-check)
        const existingUser = await User.findOne({ email: request.email.toLowerCase() });
        if (existingUser) {
          console.log('⚠️ User already exists, updating instead of creating');
          existingUser.role = request.requestedRole;
          existingUser.isVerified = true;
          existingUser.branch = request.branch;
          existingUser.program = request.program;
          existingUser.profile = {
            course: request.course,
            branch: request.branch
          };
          
          if (request.requestedRole === 'admin' && request.program) {
            existingUser.adminPrograms = [request.program];
          }
          
          await existingUser.save();
          request.user = existingUser._id;
          console.log('✅ Existing user updated successfully');
        } else {
          // Create new user with comprehensive data
          console.log('🆕 Creating new user with data:', {
          name: request.name,
          email: request.email,
            requestedRole: request.requestedRole,
          branch: request.branch,
          program: request.program,
            course: request.course
          });

          const newUser = new User({
            name: request.name.trim(),
            email: request.email.toLowerCase().trim(),
            password: request.password, // Will be hashed by pre-save middleware
            role: request.requestedRole,
            branch: request.branch ? request.branch.trim() : null,
            program: request.program ? request.program.trim() : null,
          profile: {
              course: request.course ? request.course.trim() : null,
              branch: request.branch ? request.branch.trim() : null
          },
          isVerified: true,
            createdBy: req.user._id,
            createdAt: new Date()
          });

          // Add adminPrograms if needed
        if (request.requestedRole === 'admin' && request.program) {
            newUser.adminPrograms = [request.program];
          }

          // GUARANTEED USER CREATION with retry logic
          let userCreated = false;
          let retryCount = 0;
          const maxRetries = 3;

          while (!userCreated && retryCount < maxRetries) {
            try {
        await newUser.save();
              userCreated = true;
              console.log('✅ New user created successfully:', newUser.email);
              
              // Update the request to reference the new user
        request.user = newUser._id;
              
              // Verify user was actually created
              const verifyUser = await User.findById(newUser._id);
              if (!verifyUser) {
                throw new Error('User creation verification failed');
              }
              console.log('✅ User creation verified in database');
              
            } catch (error) {
              retryCount++;
              console.error(`❌ User creation attempt ${retryCount} failed:`, error.message);
              
              if (retryCount >= maxRetries) {
                console.error('❌ All user creation attempts failed');
                return res.status(500).json({ 
                  success: false, 
                  message: 'Failed to create user after multiple attempts. Please try again.' 
                });
              }
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      }
    }

    // Update request status with comprehensive logging
    console.log('📝 Updating request status...');
    request.status = status;
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    if (remarks) {
      request.remarks = remarks.trim();
    }
    
    await request.save();
    console.log('✅ Request status updated successfully');
    
    // Final verification - ensure user exists if approved
    if (status === 'approved' && request.user) {
      const finalUserCheck = await User.findById(request.user);
      if (!finalUserCheck) {
        console.error('❌ CRITICAL: User not found after approval process');
        return res.status(500).json({ 
          success: false, 
          message: 'User creation verification failed. Please contact administrator.' 
        });
      }
      console.log('✅ Final user verification passed');
    }
    
    console.log('🎉 Verification process completed successfully');
    
    res.json({ 
      success: true, 
      message: `Request ${status} successfully. ${status === 'approved' ? 'User has been created and can now login.' : ''}`, 
      request 
    });
  } catch (error) {
    console.error('❌ Error processing verification request:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during verification process' 
    });
  }
});

// @route   GET /api/auth/verification-status
// @desc    Check verification status and user creation
// @access  Private (admin only)
router.get('/verification-status', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('🔍 Checking verification status...');
    
    // Get all approved requests
    const approvedRequests = await RoleRequest.find({ status: 'approved' });
    console.log(`Found ${approvedRequests.length} approved requests`);
    
    const verificationResults = [];
    
    for (const request of approvedRequests) {
      const user = await User.findOne({ email: request.email });
      const status = user ? '✅ User Created' : '❌ User Missing';
      
      verificationResults.push({
        requestId: request._id,
        name: request.name,
        email: request.email,
        requestedRole: request.requestedRole,
        status: status,
        userExists: !!user,
        userVerified: user ? user.isVerified : false,
        createdAt: request.createdAt,
        reviewedAt: request.reviewedAt
      });
      
      console.log(`${status} - ${request.email} (${request.requestedRole})`);
    }
    
    // Get all pending requests
    const pendingRequests = await RoleRequest.find({ status: 'pending' });
    console.log(`Found ${pendingRequests.length} pending requests`);
    
    // Get all rejected requests
    const rejectedRequests = await RoleRequest.find({ status: 'rejected' });
    console.log(`Found ${rejectedRequests.length} rejected requests`);
    
    res.json({
      success: true,
      summary: {
        totalApproved: approvedRequests.length,
        totalPending: pendingRequests.length,
        totalRejected: rejectedRequests.length,
        usersCreated: verificationResults.filter(r => r.userExists).length,
        usersMissing: verificationResults.filter(r => !r.userExists).length
      },
      approvedRequests: verificationResults,
      pendingRequests: pendingRequests.map(r => ({
        id: r._id,
        name: r.name,
        email: r.email,
        requestedRole: r.requestedRole,
        createdAt: r.createdAt
      })),
      rejectedRequests: rejectedRequests.map(r => ({
        id: r._id,
        name: r.name,
        email: r.email,
        requestedRole: r.requestedRole,
        remarks: r.remarks,
        reviewedAt: r.reviewedAt
      }))
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   POST /api/auth/fix-missing-users
// @desc    Fix missing users for approved requests
// @access  Private (admin only)
router.post('/fix-missing-users', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('🔧 Fixing missing users...');
    
    const approvedRequests = await RoleRequest.find({ status: 'approved' });
    const fixedUsers = [];
    const errors = [];
    
    for (const request of approvedRequests) {
      const existingUser = await User.findOne({ email: request.email });
      
      if (!existingUser) {
        try {
          console.log(`🔄 Creating missing user for ${request.email}...`);
          
          const newUser = new User({
            name: request.name.trim(),
            email: request.email.toLowerCase().trim(),
            password: request.password,
            role: request.requestedRole,
            branch: request.branch ? request.branch.trim() : null,
            program: request.program ? request.program.trim() : null,
            profile: {
              course: request.course ? request.course.trim() : null,
              branch: request.branch ? request.branch.trim() : null
            },
            isVerified: true,
            createdBy: req.user._id,
            createdAt: new Date()
          });

          if (request.requestedRole === 'admin' && request.program) {
            newUser.adminPrograms = [request.program];
          }

          await newUser.save();
          
          // Update request to reference the new user
          request.user = newUser._id;
          await request.save();
          
          fixedUsers.push({
            email: request.email,
            name: request.name,
            role: request.requestedRole
          });
          
          console.log(`✅ Fixed user for ${request.email}`);
          
        } catch (error) {
          console.error(`❌ Failed to fix user for ${request.email}:`, error.message);
          errors.push({
            email: request.email,
            error: error.message
          });
        }
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedUsers.length} missing users`,
      fixedUsers,
      errors
    });
    
  } catch (error) {
    console.error('Error fixing missing users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/all-users
// @desc    Get all users (for admin viewing)
// @access  Private (admin only)
router.get('/all-users', auth, authorize('admin'), async (req, res) => {
  try {
    console.log('🔍 Admin requesting all users...');
    
    const users = await User.find({})
      .select('-password') // Don't send passwords
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users`);
    
    res.json({
      success: true,
      totalUsers: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        branch: user.branch,
        program: user.program,
        profile: user.profile,
        adminPrograms: user.adminPrograms,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/users-by-role/:role
// @desc    Get users by specific role
// @access  Private (admin only)
router.get('/users-by-role/:role', auth, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.params;
    console.log(`🔍 Admin requesting users with role: ${role}`);
    
    const users = await User.find({ role })
      .select('-password')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${users.length} users with role: ${role}`);
    
    res.json({
      success: true,
      role: role,
      totalUsers: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        branch: user.branch,
        program: user.program,
        profile: user.profile,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/admin-stats
// @desc    Get admin dashboard statistics
// @access  Private (admin only)
router.get('/admin-stats', auth, authorize('admin'), async (req, res) => {
  try {
    const [totalStudents, totalFaculty, activePrograms, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' }),
      User.distinct('program', { 
        program: { $ne: null, $ne: '', $exists: true },
        role: { $in: ['student', 'faculty'] }
      }),
      Fee.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalCourses = activePrograms.length;
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalRevenue: revenue
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/department-enrollment
// @desc    Get department-wise student enrollment
// @access  Private (admin only)
router.get('/department-enrollment', auth, authorize('admin'), async (req, res) => {
  try {
    const pipeline = [
      { $match: { role: 'student' } },
      { $group: { 
        _id: '$branch', 
        students: { $sum: 1 } 
      }},
      { $project: { 
        department: { $ifNull: ['$_id', 'Unknown'] }, 
        students: 1, 
        _id: 0 
      }},
      { $sort: { students: -1 } }
    ];
    
    const departments = await User.aggregate(pipeline);
    res.json({ success: true, departments });
  } catch (error) {
    console.error('Department enrollment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/monthly-revenue
// @desc    Get monthly revenue trend
// @access  Private (admin only)
router.get('/monthly-revenue', auth, authorize('admin'), async (req, res) => {
  try {
    const pipeline = [
      { $match: { 
        status: 'paid',
        paidDate: { $exists: true, $ne: null }
      }},
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$paidDate' } },
        amount: { $sum: '$amount' }
      }},
      { $sort: { '_id': 1 } },
      { $project: {
        month: '$_id',
        amount: 1,
        _id: 0
      }}
    ];
    
    const revenue = await Fee.aggregate(pipeline);
    res.json({ success: true, revenue });
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// @route   GET /api/auth/admins-by-program
// @desc    Get all admins for a specific program
// @access  Private (admin only)
router.get('/admins-by-program', auth, authorize('admin'), async (req, res) => {
  try {
    const { program } = req.query;
    
    if (!program) {
      return res.status(400).json({ 
        success: false, 
        message: 'Program parameter is required' 
      });
    }

    const admins = await User.find({ 
      role: 'admin', 
      adminPrograms: program 
    }).select('-password');
    
    res.json({ success: true, admins });
  } catch (error) {
    console.error('Get admins by program error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;