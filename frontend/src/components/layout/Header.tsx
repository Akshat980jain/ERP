import React from 'react';
import { Bell, Search, LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onNotificationClick: () => void;
  unreadCount: number;
  onMenuClick?: () => void;
}

export function Header({ onNotificationClick, unreadCount, onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            Welcome back, {user?.name}
          </h2>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg w-48 sm:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notification button only if unreadCount is available and > 0 */}
          {typeof unreadCount === 'number' && unreadCount > 0 && (
          <button 
            onClick={onNotificationClick}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </button>
            )}

          {/* Theme toggle moved to Sidebar */}

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
              {user?.profile?.avatar ? (
                <img 
                  src={user.profile.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              )}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>

          <Button variant="ghost" onClick={logout} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}