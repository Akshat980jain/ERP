const express = require('express');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, read } = req.query;
    
    let query = {
      $or: [
        { targetRoles: req.user.role },
        { targetUsers: req.user._id }
      ],
      isActive: true
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    const notifications = await Notification.find(query)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    // Filter by read status if specified
    let filteredNotifications = notifications;
    if (read === 'false') {
      filteredNotifications = notifications.filter(notification => 
        !notification.readBy.some(read => read.user.toString() === req.user._id.toString())
      );
    }

    // Add read status to each notification
    const notificationsWithReadStatus = filteredNotifications.map(notification => {
      const isRead = notification.readBy.some(read => 
        read.user.toString() === req.user._id.toString()
      );
      return {
        ...notification.toObject(),
        read: isRead
      };
    });

    res.json({
      success: true,
      notifications: notificationsWithReadStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications
// @desc    Create notification (admin/faculty only)
// @access  Private
router.post('/', auth, authorize('admin', 'faculty', 'library', 'placement'), async (req, res) => {
  try {
    const { title, message, type, category, targetRoles, targetUsers } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      category,
      targetRoles,
      targetUsers,
      createdBy: req.user._id
    });

    await notification.save();

    res.status(201).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if already read by user
    const alreadyRead = notification.readBy.some(read => 
      read.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({
        user: req.user._id,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read for current user
// @access  Private
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { targetRoles: req.user.role },
        { targetUsers: req.user._id }
      ],
      isActive: true
    });

    for (let notification of notifications) {
      const alreadyRead = notification.readBy.some(read => 
        read.user.toString() === req.user._id.toString()
      );

      if (!alreadyRead) {
        notification.readBy.push({
          user: req.user._id,
          readAt: new Date()
        });
        await notification.save();
      }
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;