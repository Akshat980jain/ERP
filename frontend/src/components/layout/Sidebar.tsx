import React from 'react';
import { 
  Book, 
  Calendar, 
  FileText, 
  GraduationCap, 
  Home, 
  Library, 
  Settings, 
  Users,
  CreditCard,
  Briefcase,
  Bell,
  Award,
  FileCheck,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    switch (user?.role) {
      case 'student':
        return [
          ...commonItems,
          { id: 'academic', label: 'Academic', icon: GraduationCap },
          { id: 'finance', label: 'Finance', icon: CreditCard },
          { id: 'library', label: 'Library', icon: Library },
          { id: 'placement', label: 'Placement', icon: Briefcase },
          { id: 'services', label: 'Student Services', icon: FileCheck },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      
      case 'faculty':
        return [
          ...commonItems,
          { id: 'courses', label: 'My Courses', icon: Book },
          { id: 'attendance', label: 'Attendance', icon: UserCheck },
          { id: 'marks', label: 'Marks & Grades', icon: Award },
          { id: 'students', label: 'Students', icon: Users },
          { id: 'schedule', label: 'Schedule', icon: Calendar },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      
      case 'admin':
        return [
          ...commonItems,
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'courses', label: 'Course Management', icon: Book },
          { id: 'finance', label: 'Finance Management', icon: CreditCard },
          { id: 'reports', label: 'Reports', icon: FileText },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ];
      
      case 'library':
        return [
          ...commonItems,
          { id: 'books', label: 'Book Management', icon: Library },
          { id: 'issues', label: 'Issue/Return', icon: FileCheck },
          { id: 'requests', label: 'Book Requests', icon: FileText },
          { id: 'reports', label: 'Library Reports', icon: BarChart3 },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      
      case 'placement':
        return [
          ...commonItems,
          { id: 'jobs', label: 'Job Postings', icon: Briefcase },
          { id: 'applications', label: 'Applications', icon: FileText },
          { id: 'students', label: 'Student Database', icon: Users },
          { id: 'reports', label: 'Placement Reports', icon: BarChart3 },
          { id: 'profile', label: 'Profile', icon: Settings },
        ];
      
      default:
        return commonItems;
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white h-full border-r border-gray-200 w-64 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EduConnect</h1>
            <p className="text-sm text-gray-500 capitalize">{user?.role} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                {
                  'bg-blue-50 text-blue-700 border-r-2 border-blue-600': activeTab === item.id,
                  'text-gray-600 hover:bg-gray-50 hover:text-gray-900': activeTab !== item.id,
                }
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}