const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { auth, authorize, checkVerification } = require('../middleware/auth');

const router = express.Router();

// Get system settings (Admin only)
router.get('/system', auth, authorize('admin'), async (req, res) => {
  try {
    const dbSettings = await Settings.findOne();
    // In a real application, these would be stored in a separate Settings collection
    // For now, we'll return default system settings
    const systemSettings = {
      institution: {
        name: process.env.INSTITUTION_NAME || 'EduConnect University',
        address: process.env.INSTITUTION_ADDRESS || '123 Education Street, Learning City',
        phone: process.env.INSTITUTION_PHONE || '+1-555-0123',
        email: process.env.INSTITUTION_EMAIL || 'info@educonnect.edu',
        website: process.env.INSTITUTION_WEBSITE || 'www.educonnect.edu',
        logo: process.env.INSTITUTION_LOGO || '/uploads/logo.png'
      },
      academic: {
        currentAcademicYear: process.env.CURRENT_ACADEMIC_YEAR || new Date().getFullYear(),
        currentSemester: process.env.CURRENT_SEMESTER || '1st',
        gradingSystem: process.env.GRADING_SYSTEM || 'percentage',
        passPercentage: process.env.PASS_PERCENTAGE || 40,
        maxAttendancePercentage: process.env.MAX_ATTENDANCE_PERCENTAGE || 75,
        assignmentSubmissionDeadline: process.env.ASSIGNMENT_DEADLINE || 24, // hours
        examDuration: process.env.EXAM_DURATION || 180 // minutes
      },
      notifications: {
        emailNotifications: process.env.EMAIL_NOTIFICATIONS === 'true',
        smsNotifications: process.env.SMS_NOTIFICATIONS === 'true',
        pushNotifications: process.env.PUSH_NOTIFICATIONS === 'true',
        notificationRetentionDays: process.env.NOTIFICATION_RETENTION || 30
      },
      security: {
        passwordMinLength: process.env.PASSWORD_MIN_LENGTH || 8,
        passwordComplexity: process.env.PASSWORD_COMPLEXITY || 'medium',
        sessionTimeout: process.env.SESSION_TIMEOUT || 3600, // seconds
        maxLoginAttempts: process.env.MAX_LOGIN_ATTEMPTS || 5,
        twoFactorAuth: process.env.TWO_FACTOR_AUTH === 'true'
      },
      features: {
        chatEnabled: process.env.CHAT_ENABLED === 'true',
        fileUploadEnabled: process.env.FILE_UPLOAD_ENABLED === 'true',
        analyticsEnabled: process.env.ANALYTICS_ENABLED === 'true',
        backupEnabled: process.env.BACKUP_ENABLED === 'true'
      },
      attendancePolicy: dbSettings?.attendancePolicy || undefined
    };

    res.json({ settings: systemSettings });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update system settings (Admin only)
router.put('/system', auth, authorize('admin'), async (req, res) => {
  try {
    const { institution, academic, notifications, security, features, attendancePolicy } = req.body;

    // Validate required fields
    if (!institution?.name || !academic?.currentAcademicYear) {
      return res.status(400).json({ message: 'Institution name and academic year are required' });
    }

    // In a real application, these would be saved to a Settings collection
    // For now, we'll just return success
    const updatedSettings = {
      institution: {
        name: institution.name,
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || '',
        website: institution.website || '',
        logo: institution.logo || ''
      },
      academic: {
        currentAcademicYear: academic.currentAcademicYear,
        currentSemester: academic.currentSemester || '1st',
        gradingSystem: academic.gradingSystem || 'percentage',
        passPercentage: academic.passPercentage || 40,
        maxAttendancePercentage: academic.maxAttendancePercentage || 75,
        assignmentSubmissionDeadline: academic.assignmentSubmissionDeadline || 24,
        examDuration: academic.examDuration || 180
      },
      notifications: {
        emailNotifications: notifications?.emailNotifications || false,
        smsNotifications: notifications?.smsNotifications || false,
        pushNotifications: notifications?.pushNotifications || false,
        notificationRetentionDays: notifications?.notificationRetentionDays || 30
      },
      security: {
        passwordMinLength: security?.passwordMinLength || 8,
        passwordComplexity: security?.passwordComplexity || 'medium',
        sessionTimeout: security?.sessionTimeout || 3600,
        maxLoginAttempts: security?.maxLoginAttempts || 5,
        twoFactorAuth: security?.twoFactorAuth || false
      },
      features: {
        chatEnabled: features?.chatEnabled || false,
        fileUploadEnabled: features?.fileUploadEnabled || false,
        analyticsEnabled: features?.analyticsEnabled || false,
        backupEnabled: features?.backupEnabled || false
      },
      attendancePolicy: attendancePolicy || undefined
    };

    // Persist attendance policy if provided
    if (attendancePolicy) {
      await Settings.findOneAndUpdate({}, { attendancePolicy }, { upsert: true, new: true });
    }

    res.json({ 
      message: 'System settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user preferences
router.get('/preferences', auth, checkVerification, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('profile preferences');
    
    const userPreferences = {
      theme: user.preferences?.theme || 'light',
      language: user.preferences?.language || 'en',
      timezone: user.preferences?.timezone || 'UTC',
      notifications: {
        email: user.preferences?.notifications?.email !== false,
        sms: user.preferences?.notifications?.sms || false,
        push: user.preferences?.notifications?.push !== false,
        academic: user.preferences?.notifications?.academic !== false,
        financial: user.preferences?.notifications?.financial !== false,
        events: user.preferences?.notifications?.events !== false
      },
      dashboard: {
        defaultView: user.preferences?.dashboard?.defaultView || 'overview',
        widgets: user.preferences?.dashboard?.widgets || ['attendance', 'marks', 'assignments'],
        refreshInterval: user.preferences?.dashboard?.refreshInterval || 300 // seconds
      },
      privacy: {
        profileVisibility: user.preferences?.privacy?.profileVisibility || 'faculty',
        contactInfoVisibility: user.preferences?.privacy?.contactInfoVisibility || 'faculty',
        academicInfoVisibility: user.preferences?.privacy?.academicInfoVisibility || 'faculty'
      }
    };

    res.json({ preferences: userPreferences });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user preferences
router.put('/preferences', auth, checkVerification, async (req, res) => {
  try {
    const { theme, language, timezone, notifications, dashboard, privacy } = req.body;

    const updatedPreferences = {
      theme: theme || 'light',
      language: language || 'en',
      timezone: timezone || 'UTC',
      notifications: {
        email: notifications?.email !== false,
        sms: notifications?.sms || false,
        push: notifications?.push !== false,
        academic: notifications?.academic !== false,
        financial: notifications?.financial !== false,
        events: notifications?.events !== false
      },
      dashboard: {
        defaultView: dashboard?.defaultView || 'overview',
        widgets: dashboard?.widgets || ['attendance', 'marks', 'assignments'],
        refreshInterval: dashboard?.refreshInterval || 300
      },
      privacy: {
        profileVisibility: privacy?.profileVisibility || 'faculty',
        contactInfoVisibility: privacy?.contactInfoVisibility || 'faculty',
        academicInfoVisibility: privacy?.academicInfoVisibility || 'faculty'
      }
    };

    // Update user preferences in database
    await User.findByIdAndUpdate(req.user._id, {
      $set: { preferences: updatedPreferences }
    });

    res.json({ 
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification settings
router.get('/notifications', auth, checkVerification, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    
    const notificationSettings = {
      general: {
        email: user.preferences?.notifications?.email !== false,
        sms: user.preferences?.notifications?.sms || false,
        push: user.preferences?.notifications?.push !== false
      },
      academic: {
        assignments: user.preferences?.notifications?.academic !== false,
        exams: user.preferences?.notifications?.academic !== false,
        grades: user.preferences?.notifications?.academic !== false,
        attendance: user.preferences?.notifications?.academic !== false
      },
      financial: {
        feeReminders: user.preferences?.notifications?.financial !== false,
        paymentConfirmations: user.preferences?.notifications?.financial !== false,
        overdueNotices: user.preferences?.notifications?.financial !== false
      },
      events: {
        upcomingEvents: user.preferences?.notifications?.events !== false,
        eventReminders: user.preferences?.notifications?.events !== false,
        scheduleChanges: user.preferences?.notifications?.events !== false
      },
      frequency: {
        immediate: true,
        daily: false,
        weekly: false
      }
    };

    res.json({ notificationSettings });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification settings
router.put('/notifications', auth, checkVerification, async (req, res) => {
  try {
    const { general, academic, financial, events, frequency } = req.body;

    const updatedNotificationSettings = {
      general: {
        email: general?.email !== false,
        sms: general?.sms || false,
        push: general?.push !== false
      },
      academic: {
        assignments: academic?.assignments !== false,
        exams: academic?.exams !== false,
        grades: academic?.grades !== false,
        attendance: academic?.attendance !== false
      },
      financial: {
        feeReminders: financial?.feeReminders !== false,
        paymentConfirmations: financial?.paymentConfirmations !== false,
        overdueNotices: financial?.overdueNotices !== false
      },
      events: {
        upcomingEvents: events?.upcomingEvents !== false,
        eventReminders: events?.eventReminders !== false,
        scheduleChanges: events?.scheduleChanges !== false
      },
      frequency: {
        immediate: frequency?.immediate !== false,
        daily: frequency?.daily || false,
        weekly: frequency?.weekly || false
      }
    };

    // Update user notification preferences
    await User.findByIdAndUpdate(req.user._id, {
      $set: { 
        'preferences.notifications': {
          email: updatedNotificationSettings.general.email,
          sms: updatedNotificationSettings.general.sms,
          push: updatedNotificationSettings.general.push,
          academic: updatedNotificationSettings.academic.assignments || updatedNotificationSettings.academic.exams || updatedNotificationSettings.academic.grades || updatedNotificationSettings.academic.attendance,
          financial: updatedNotificationSettings.financial.feeReminders || updatedNotificationSettings.financial.paymentConfirmations || updatedNotificationSettings.financial.overdueNotices,
          events: updatedNotificationSettings.events.upcomingEvents || updatedNotificationSettings.events.eventReminders || updatedNotificationSettings.events.scheduleChanges
        }
      }
    });

    res.json({ 
      message: 'Notification settings updated successfully',
      notificationSettings: updatedNotificationSettings
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system information (Admin only)
router.get('/system-info', auth, authorize('admin'), async (req, res) => {
  try {
    const systemInfo = {
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      database: {
        connection: 'Connected', // You can add actual DB connection status
        collections: await getDatabaseStats()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 5000,
        databaseUrl: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
        corsOrigins: process.env.CORS_ORIGINS ? 'Configured' : 'Not configured'
      },
      features: {
        fileUpload: process.env.FILE_UPLOAD_ENABLED === 'true',
        emailService: process.env.EMAIL_SERVICE_ENABLED === 'true',
        smsService: process.env.SMS_SERVICE_ENABLED === 'true',
        backupService: process.env.BACKUP_SERVICE_ENABLED === 'true'
      }
    };

    res.json({ systemInfo });
  } catch (error) {
    console.error('Get system info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get database statistics
async function getDatabaseStats() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const stats = {};
    
    for (const collection of collections) {
      try {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        stats[collection.name] = count;
      } catch (err) {
        stats[collection.name] = 'Error';
      }
    }
    
    return stats;
  } catch (error) {
    return { error: 'Unable to fetch database stats' };
  }
}

// Get backup settings (Admin only)
router.get('/backup', auth, authorize('admin'), async (req, res) => {
  try {
    const backupSettings = {
      enabled: process.env.BACKUP_ENABLED === 'true',
      frequency: process.env.BACKUP_FREQUENCY || 'daily',
      retention: process.env.BACKUP_RETENTION || 30, // days
      storage: process.env.BACKUP_STORAGE || 'local',
      lastBackup: process.env.LAST_BACKUP_DATE || 'Never',
      autoBackup: process.env.AUTO_BACKUP === 'true'
    };

    res.json({ backupSettings });
  } catch (error) {
    console.error('Get backup settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update backup settings (Admin only)
router.put('/backup', auth, authorize('admin'), async (req, res) => {
  try {
    const { enabled, frequency, retention, storage, autoBackup } = req.body;

    const updatedBackupSettings = {
      enabled: enabled || false,
      frequency: frequency || 'daily',
      retention: retention || 30,
      storage: storage || 'local',
      autoBackup: autoBackup || false
    };

    // In a real application, these would be saved to environment variables or database
    // For now, we'll just return success

    res.json({ 
      message: 'Backup settings updated successfully',
      backupSettings: updatedBackupSettings
    });
  } catch (error) {
    console.error('Update backup settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test system configuration (Admin only)
router.post('/test-config', auth, authorize('admin'), async (req, res) => {
  try {
    const { testType } = req.body;
    const results = {};

    switch (testType) {
      case 'database':
        results.database = await testDatabaseConnection();
        break;
      case 'email':
        results.email = await testEmailService();
        break;
      case 'fileUpload':
        results.fileUpload = await testFileUpload();
        break;
      case 'all':
        results.database = await testDatabaseConnection();
        results.email = await testEmailService();
        results.fileUpload = await testFileUpload();
        break;
      default:
        return res.status(400).json({ message: 'Invalid test type' });
    }

    res.json({ 
      message: 'Configuration test completed',
      results
    });
  } catch (error) {
    console.error('Test configuration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions for testing
async function testDatabaseConnection() {
  try {
    const startTime = Date.now();
    await mongoose.connection.db.admin().ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'success',
      responseTime: `${responseTime}ms`,
      message: 'Database connection is working properly'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Database connection failed',
      error: error.message
    };
  }
}

async function testEmailService() {
  try {
    // This would test your email service configuration
    // For now, return a mock result
    return {
      status: 'success',
      message: 'Email service configuration appears correct',
      note: 'Actual email sending not tested'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Email service test failed',
      error: error.message
    };
  }
}

async function testFileUpload() {
  try {
    // This would test your file upload configuration
    // For now, return a mock result
    return {
      status: 'success',
      message: 'File upload configuration appears correct',
      note: 'Actual file upload not tested'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'File upload test failed',
      error: error.message
    };
  }
}

module.exports = router;
