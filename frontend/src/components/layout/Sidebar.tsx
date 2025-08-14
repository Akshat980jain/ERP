import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  UserCheck,
  ChevronRight,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  LogOut,
  HelpCircle,
  MessageCircle,
  Shield,
  Wifi,
  WifiOff,
  Menu,
  ChevronLeft,
  Bus,
  Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeType?: 'default' | 'success' | 'warning' | 'error' | 'info';
  isNew?: boolean;
  children?: MenuItem[];
  accessCount?: number;
  category?: string;
  description?: string;
  isHidden?: boolean;
  permissions?: string[];
  color?: string;
  gradient?: boolean;
  priority?: 'high' | 'medium' | 'low';
  isExperimental?: boolean;
}

export function Sidebar({ 
  activeTab, 
  onTabChange, 
  collapsed = false, 
  onCollapseChange,
  theme = 'light',
  onThemeChange 
}: SidebarProps) {
  const { user, logout } = useAuth();
  
  // Enhanced state management
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['main']);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [accessStats, setAccessStats] = useState<Record<string, { count: number }>>({});
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [animateItems, setAnimateItems] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState<string | null>(null);

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedExpanded = localStorage.getItem('sidebar-expanded');
    const savedAccessStats = localStorage.getItem('sidebar-access-stats');
    
    if (savedExpanded) setExpandedCategories(JSON.parse(savedExpanded));
    if (savedAccessStats) setAccessStats(JSON.parse(savedAccessStats));
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enhanced menu items with modern design
  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: Home, 
        category: 'main',
        description: 'Overview and analytics',
        color: 'blue',
        gradient: true,
        priority: 'high'
      },
      { 
        id: 'notifications', 
        label: 'Notifications', 
        icon: Bell,
        category: 'main',
        description: 'Stay updated with alerts',
        color: 'orange'
      },
    ];

    const getRoleSpecificItems = (): MenuItem[] => {
      switch (user?.role) {
        case 'student':
          return [
            { 
              id: 'academic', 
              label: 'Academic', 
              icon: GraduationCap,
              category: 'academics',
              description: 'Courses, grades & progress',
              color: 'purple',
              gradient: true,
              priority: 'high',
            },
            { 
              id: 'schedule', 
              label: 'Schedule', 
              icon: Calendar,
              category: 'academics',
              description: 'Class schedules',
              color: 'indigo'
            },
            { 
              id: 'exams', 
              label: 'Exams', 
              icon: FileCheck,
              category: 'academics',
              description: 'View and take scheduled exams',
              color: 'red',
              priority: 'high'
            },
            { 
              id: 'assignments', 
              label: 'Assignments', 
              icon: FileText,
              category: 'academics',
              description: 'Submit and track assignments',
              color: 'orange',
              priority: 'high',
              badge: 'New',
              badgeType: 'info'
            },
            { 
              id: 'finance', 
              label: 'Finance', 
              icon: CreditCard,
              category: 'services',
              description: 'Fee payments & receipts',
              color: 'green',
              priority: 'medium'
            },
            { 
              id: 'library', 
              label: 'Library', 
              icon: Library,
              category: 'services',
              description: 'Books & digital resources',
              color: 'teal'
            },
            { 
              id: 'placement', 
              label: 'Placement', 
              icon: Briefcase,
              category: 'career',
              isNew: true,
              description: 'Career opportunities',
              color: 'emerald',
              gradient: true,
              isExperimental: true
            },
            { 
              id: 'services', 
              label: 'Services', 
              icon: FileCheck,
              category: 'services',
              description: 'Student support services',
              color: 'cyan'
            },
            { 
              id: 'transport', 
              label: 'Transport', 
              icon: Bus,
              category: 'services',
              description: 'Routes & subscriptions',
              color: 'blue'
            },
          ];
        
        case 'faculty':
          return [
            { 
              id: 'courses', 
              label: 'My Courses', 
              icon: Book,
              category: 'teaching',
              description: 'Course management',
              color: 'blue',
              gradient: true,
              badge: 4,
              badgeType: 'info'
            },
            { 
              id: 'exams', 
              label: 'Exams', 
              icon: FileCheck,
              category: 'teaching',
              description: 'Create and conduct exams',
              color: 'red'
            },
            { 
              id: 'feedback', 
              label: 'Feedback', 
              icon: MessageCircle,
              category: 'management',
              description: 'Course feedback summary',
              color: 'purple'
            },
            { 
              id: 'calendar', 
              label: 'Calendar', 
              icon: Calendar,
              category: 'management',
              description: 'Academic calendar',
              color: 'indigo'
            },
            { 
              id: 'assignments', 
              label: 'Assignments', 
              icon: FileText,
              category: 'teaching',
              description: 'Create and grade assignments',
              color: 'orange',
              priority: 'high',
              badge: 'Active',
              badgeType: 'success'
            },
            { 
              id: 'attendance', 
              label: 'Attendance', 
              icon: UserCheck,
              category: 'teaching',
              description: 'Track student attendance',
              color: 'green'
            },
            { 
              id: 'marks', 
              label: 'Marks & Grades', 
              icon: Award,
              category: 'teaching',
              description: 'Grade submissions',
              color: 'yellow',
              badge: 'Pending',
              badgeType: 'warning'
            },
            { 
              id: 'students', 
              label: 'Students', 
              icon: Users,
              category: 'management',
              description: 'Student management',
              color: 'purple',
              badge: 156,
              badgeType: 'default'
            },
            { 
              id: 'schedule', 
              label: 'Schedule', 
              icon: Calendar,
              category: 'management',
              description: 'Class schedules',
              color: 'indigo'
            },
          ];
        
        case 'admin':
          return [
            { 
              id: 'analytics', 
              label: 'Analytics', 
              icon: BarChart3,
              category: 'management',
              description: 'System insights',
              color: 'blue',
              gradient: true,
              priority: 'high',
              isExperimental: true
            },
            { 
              id: 'users', 
              label: 'Users', 
              icon: Users,
              category: 'management',
              description: 'User management',
              color: 'purple',
              badge: 1250,
              badgeType: 'info'
            },
            { 
              id: 'courses', 
              label: 'Courses', 
              icon: Book,
              category: 'academics',
              description: 'Course administration',
              color: 'indigo'
            },
            { 
              id: 'finance', 
              label: 'Finance', 
              icon: CreditCard,
              category: 'financial',
              description: 'Financial oversight',
              color: 'green',
              gradient: true
            },
            { 
              id: 'reports', 
              label: 'Reports', 
              icon: FileText,
              category: 'reports',
              description: 'System reports',
              color: 'gray'
            },
            { 
              id: 'security', 
              label: 'Security', 
              icon: Shield,
              category: 'system',
              description: 'Security settings',
              color: 'red'
            },
            { 
              id: 'hostel', 
              label: 'Hostel', 
              icon: Building2,
              category: 'management',
              description: 'Rooms & allocations',
              color: 'purple'
            },
            { 
              id: 'transport', 
              label: 'Transport', 
              icon: Bus,
              category: 'management',
              description: 'Routes & GPS',
              color: 'blue'
            },
          ];
        
        default:
          return [];
      }
    };

    const profileItem: MenuItem = {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      category: 'system',
      description: 'Account & preferences',
      color: 'gray'
    };

    return [...commonItems, ...getRoleSpecificItems(), profileItem];
  };

  const menuItems = useMemo(() => {
    const items = getMenuItems();
    return items.map(item => ({
      ...item,
      accessCount: accessStats[item.id]?.count || 0
    }));
  }, [accessStats]);

  // Enhanced filtering - now just returns all menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems;
  }, [menuItems]);

  // Group items by category with enhanced sorting
  const groupedMenuItems = useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    
    filteredMenuItems.forEach(item => {
      const category = item.category || 'other';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    // Enhanced sorting logic
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        // Priority sorting
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'low'];
        const bPriority = priorityOrder[b.priority || 'low'];
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        if ((a.accessCount || 0) !== (b.accessCount || 0)) {
          return (b.accessCount || 0) - (a.accessCount || 0);
        }
        return a.label.localeCompare(b.label);
      });
    });

    return grouped;
  }, [filteredMenuItems]);

  // Handle tab change with enhanced analytics
  const handleTabChange = (tabId: string) => {
    const newStats = {
      ...accessStats,
      [tabId]: {
        count: (accessStats[tabId]?.count || 0) + 1
      }
    };
    setAccessStats(newStats);
    localStorage.setItem('sidebar-access-stats', JSON.stringify(newStats));

    // Animate item selection
    setAnimateItems(true);
    setTimeout(() => setAnimateItems(false), 300);

    onTabChange(tabId);
  };

  // Get color classes for items
  const getColorClasses = (item: MenuItem, isActive: boolean) => {
    const colorMap = {
      blue: isActive ? 'bg-blue-500 text-white' : 'text-blue-600 hover:bg-blue-50',
      purple: isActive ? 'bg-purple-500 text-white' : 'text-purple-600 hover:bg-purple-50',
      green: isActive ? 'bg-green-500 text-white' : 'text-green-600 hover:bg-green-50',
      yellow: isActive ? 'bg-yellow-500 text-white' : 'text-yellow-600 hover:bg-yellow-50',
      red: isActive ? 'bg-red-500 text-white' : 'text-red-600 hover:bg-red-50',
      indigo: isActive ? 'bg-indigo-500 text-white' : 'text-indigo-600 hover:bg-indigo-50',
      teal: isActive ? 'bg-teal-500 text-white' : 'text-teal-600 hover:bg-teal-50',
      orange: isActive ? 'bg-orange-500 text-white' : 'text-orange-600 hover:bg-orange-50',
      cyan: isActive ? 'bg-cyan-500 text-white' : 'text-cyan-600 hover:bg-cyan-50',
      emerald: isActive ? 'bg-emerald-500 text-white' : 'text-emerald-600 hover:bg-emerald-50',
      gray: isActive ? 'bg-gray-500 text-white' : 'text-gray-600 hover:bg-gray-50'
    };

    if (item.gradient && isActive) {
      const gradientMap = {
        blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
        purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
        green: 'bg-gradient-to-r from-green-500 to-green-600',
        emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600'
      };
      return `${gradientMap[item.color as keyof typeof gradientMap]} text-white`;
    }

    return colorMap[item.color as keyof typeof colorMap] || (isActive ? 'bg-gray-500 text-white' : 'text-gray-600 hover:bg-gray-50');
  };

  // Get badge classes
  const getBadgeClasses = (badgeType: string = 'default') => {
    const badgeMap = {
      default: 'bg-gray-100 text-gray-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    };
    return badgeMap[badgeType as keyof typeof badgeMap] || badgeMap.default;
  };

  // Render enhanced menu item
  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedCategories.includes(item.id);
    const isHovered = hoveredItem === item.id;

    return (
      <div key={item.id} className="relative">
        <div
          className="relative group"
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={() => hasChildren ? toggleCategory(item.id) : handleTabChange(item.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowContextMenu(item.id);
            }}
            className={clsx(
              'w-full flex items-center text-left transition-all duration-200',
              'group relative hover:shadow-lg transform',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
              getColorClasses(item, isActive),
              {
                'shadow-lg scale-[1.02]': isActive,
                'ml-4': level > 0,
                'animate-pulse': animateItems && isActive,
                // Collapsed styles
                'px-3 py-3 rounded-xl justify-center': collapsed,
                'px-4 py-3 rounded-xl space-x-3 hover:scale-[1.02]': !collapsed,
              }
            )}
            title={collapsed ? item.label : undefined}
          >
            {/* Active indicator */}
            {isActive && !collapsed && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
            )}

            {collapsed ? (
              // Collapsed view - just icon
              <div className="relative flex items-center justify-center">
                <div className={clsx(
                  'p-2 rounded-lg transition-all duration-200',
                  {
                    'bg-white bg-opacity-20': isActive,
                    'bg-gray-100': !isActive,
                    'scale-110': isHovered
                  }
                )}>
                  <Icon className={clsx('w-5 h-5', {
                    'text-white': isActive,
                    [`text-${item.color}-600`]: !isActive && item.color
                  })} />
                </div>
                
                {/* Badge for collapsed state */}
                {item.badge && (
                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">
                      {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                    </span>
                  </div>
                )}
                
                {/* Status indicators for collapsed state */}
                {item.isNew && !item.badge && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ) : (
              // Expanded view - full layout
              <div className="flex items-center space-x-3 flex-1">
                {/* Icon with enhanced styling */}
                <div className="relative">
                  <div className={clsx(
                    'p-2 rounded-lg transition-all duration-200',
                    {
                      'bg-white bg-opacity-20': isActive,
                      'bg-gray-100': !isActive,
                      'scale-110': isHovered
                    }
                  )}>
                    <Icon className={clsx('w-5 h-5', {
                      'text-white': isActive,
                      [`text-${item.color}-600`]: !isActive && item.color
                    })} />
                  </div>
                  
                  {/* Status indicators */}
                  {item.isNew && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                  
                  {item.isExperimental && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center text-white text-xs">
                      Beta
                    </span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold truncate">{item.label}</span>
                    {item.isExperimental && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded-full">
                        Beta
                      </span>
                    )}
                  </div>
                  {item.description && !isActive && (
                    <p className="text-xs opacity-70 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Badge */}
                  {item.badge && (
                    <span className={clsx(
                      'px-2 py-1 text-xs font-semibold rounded-full',
                      getBadgeClasses(item.badgeType)
                    )}>
                      {item.badge}
                    </span>
                  )}

                  {/* Expand indicator */}
                  {hasChildren && (
                    <div className={clsx('transition-transform duration-200', {
                      'rotate-90': isExpanded
                    })}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </button>

          {/* Tooltip for collapsed state */}
          {collapsed && isHovered && (
            <div className="fixed left-20 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm z-50 pointer-events-none whitespace-nowrap">
              {item.label}
              {item.badge && (
                <span className="ml-2 px-2 py-0.5 bg-blue-500 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-6 mt-2 space-y-1 border-l-2 border-gray-200 pl-4">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}

        {/* Context menu */}
        {showContextMenu === item.id && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border z-50">
            <div className="py-1">
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center space-x-2">
                <span>Add to bookmarks</span>
              </button>
              <button className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center space-x-2">
                <span>Hide from sidebar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowContextMenu(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleCategory = (category: string) => {
    const newExpanded = expandedCategories.includes(category)
      ? expandedCategories.filter(cat => cat !== category)
      : [...expandedCategories, category];
    
    setExpandedCategories(newExpanded);
    localStorage.setItem('sidebar-expanded', JSON.stringify(newExpanded));
  };

  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      main: 'Main Navigation',
      academics: 'Academic Hub',
      teaching: 'Teaching Tools',
      services: 'Student Services',
      career: 'Career Center',
      management: 'Management',
      financial: 'Financial',
      reports: 'Reports & Analytics',
      system: 'System & Settings'
    };
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <>
      {/* Responsive sidebar container */}
      <div className={clsx(
        'h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-xl relative',
        'backdrop-blur-sm bg-white/95',
        'md:static md:translate-x-0 fixed top-0 left-0 z-40',
        {
          'w-80': !collapsed,
          'w-20': collapsed,
        }
      )}>
        {/* Enhanced Header - Fixed height */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-xl font-bold">EduConnect</h1>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-blue-100 capitalize">{user?.role} Portal</p>
                    <div className="flex items-center space-x-1">
                      {isOnline ? (
                        <Wifi className="w-3 h-3 text-green-300" />
                      ) : (
                        <WifiOff className="w-3 h-3 text-red-300" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {!collapsed && (
                <button
                  onClick={() => onThemeChange?.(theme === 'light' ? 'dark' : 'light')}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  title="Toggle theme"
                >
                  {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </button>
              )}
              
              {/* Toggle button - always visible and prominent when collapsed */}
              <button
                onClick={() => onCollapseChange?.(!collapsed)}
                className={clsx(
                  'p-2 rounded-lg transition-all duration-200',
                  {
                    'hover:bg-white hover:bg-opacity-20': !collapsed,
                    // Make it more prominent when collapsed
                    'bg-white bg-opacity-20 hover:bg-opacity-30 shadow-lg': collapsed,
                  }
                )}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Expand Button - Only shown when collapsed */}
        {collapsed && (
          <div className="absolute top-1/2 -right-4 z-50">
            <button
              onClick={() => onCollapseChange?.(false)}
              className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Enhanced Navigation - Flexible height with proper scrolling */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar min-h-0">
          {/* Grouped Menu Items */}
          {Object.entries(groupedMenuItems).map(([category, items]) => {
            const isExpanded = expandedCategories.includes(category);
            
            return (
              <div key={category} className="space-y-2">
                {!collapsed && items.length > 0 && (
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-2 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{getCategoryDisplayName(category)}</span>
                    </div>
                    <div className={clsx('transition-transform duration-200', {
                      'rotate-90': isExpanded
                    })}>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                )}
                
                {(collapsed || isExpanded) && (
                  <div className={clsx('space-y-2', {
                    'space-y-3': collapsed // More spacing when collapsed
                  })}>
                    {items.map(item => renderMenuItem(item))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Enhanced Footer - Fixed height */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
          {/* User Profile */}
          <div className={clsx('p-4', {'px-2': collapsed
          })}>
            <div className={clsx('flex items-center space-x-3', {
              'justify-center': collapsed
            })}>
              {collapsed ? (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate capitalize">
                      {user?.role} • {user?.department || 'General'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {/* {!collapsed && (
            <div className="px-4 pb-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Quick Actions
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Help & Support"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )} */}

          {collapsed && (
            <div className="px-2 pb-2">
              <button
                onClick={logout}
                className="w-full p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 mx-auto" />
              </button>
            </div>
          )}

          {/* Quick Actions Dropdown */}
          {/* {showQuickActions && !collapsed && (
            <div className="mx-4 mb-4 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex flex-col items-center space-y-1">
                  <Bell className="w-4 h-4" />
                  <span>Alerts</span>
                </button>
                <button className="p-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex flex-col items-center space-y-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>Messages</span>
                </button>
                <button className="p-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex flex-col items-center space-y-1">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
                <button className="p-2 text-xs text-gray-600 hover:bg-gray-50 rounded flex flex-col items-center space-y-1">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          )} */}
        </div>

        {/* Resize handle for desktop */}
        <div className="absolute top-0 right-0 w-1 h-full hover:bg-blue-200 cursor-col-resize transition-colors hidden md:block" />
      </div>

      {/* Mobile overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => onCollapseChange?.(true)}
        />
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </>
  );
}