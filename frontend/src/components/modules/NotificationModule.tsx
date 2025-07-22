import React, { useState } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info, X, Calendar, User, BookOpen, CreditCard, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'academic' | 'finance' | 'library' | 'placement' | 'general';
  read: boolean;
  createdAt: string;
  targetRole?: string[];
}

export function NotificationModule() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'academic' | 'finance' | 'library' | 'placement'>('all');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Fee Payment Due',
      message: 'Your semester fee payment is due on January 30, 2024. Please pay to avoid late fees.',
      type: 'warning',
      category: 'finance',
      read: false,
      createdAt: '2024-01-25T10:00:00Z',
      targetRole: ['student']
    },
    {
      id: '2',
      title: 'New Assignment Posted',
      message: 'Data Structures assignment has been posted. Due date: February 5, 2024.',
      type: 'info',
      category: 'academic',
      read: false,
      createdAt: '2024-01-24T14:30:00Z',
      targetRole: ['student']
    },
    {
      id: '3',
      title: 'Library Book Overdue',
      message: 'The book "Introduction to Algorithms" is overdue. Please return it to avoid fine.',
      type: 'error',
      category: 'library',
      read: true,
      createdAt: '2024-01-23T09:15:00Z',
      targetRole: ['student']
    },
    {
      id: '4',
      title: 'Placement Drive Scheduled',
      message: 'Microsoft campus placement drive scheduled for February 15, 2024. Register now!',
      type: 'success',
      category: 'placement',
      read: false,
      createdAt: '2024-01-22T16:45:00Z',
      targetRole: ['student']
    },
    {
      id: '5',
      title: 'Attendance Alert',
      message: 'Your attendance in Database Systems is below 75%. Please attend classes regularly.',
      type: 'warning',
      category: 'academic',
      read: false,
      createdAt: '2024-01-21T11:20:00Z',
      targetRole: ['student']
    },
    {
      id: '6',
      title: 'Grade Submission Reminder',
      message: 'Please submit grades for Data Structures course by January 28, 2024.',
      type: 'warning',
      category: 'academic',
      read: false,
      createdAt: '2024-01-25T08:00:00Z',
      targetRole: ['faculty']
    },
    {
      id: '7',
      title: 'System Maintenance',
      message: 'Scheduled system maintenance on January 27, 2024 from 2:00 AM to 4:00 AM.',
      type: 'info',
      category: 'general',
      read: true,
      createdAt: '2024-01-20T12:00:00Z',
      targetRole: ['student', 'faculty', 'admin']
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (!notification.targetRole?.includes(user?.role || '')) return false;
    
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'academic':
      case 'finance':
      case 'library':
      case 'placement':
        return notification.category === filter;
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <BookOpen className="w-4 h-4" />;
      case 'finance':
        return <CreditCard className="w-4 h-4" />;
      case 'library':
        return <BookOpen className="w-4 h-4" />;
      case 'placement':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read && n.targetRole?.includes(user?.role || '')).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Button onClick={markAllAsRead} variant="outline" size="sm">
          Mark All as Read
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'unread', 'academic', 'finance', 'library', 'placement'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getTypeIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-1 text-gray-500">
                          {getCategoryIcon(notification.category)}
                          <span className="text-xs capitalize">{notification.category}</span>
                        </div>
                      </div>
                      <p className={`text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                        <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <Button
                        onClick={() => markAsRead(notification.id)}
                        variant="outline"
                        size="sm"
                      >
                        Mark as Read
                      </Button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}