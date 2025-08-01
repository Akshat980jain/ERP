import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { FacultyDashboard } from './components/dashboard/FacultyDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { AcademicModule } from './components/modules/AcademicModule';
import { CourseModule } from './components/modules/CourseModule'; // Add this import
import UserManagement from './components/modules/UserManagement';
import RequestVerificationPage from './components/auth/RequestVerificationPage';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { MarksModule } from './components/modules/MarksModule';
import { StudentModule } from './components/modules/StudentModule';
import { ScheduleModule } from './components/modules/ScheduleModule';
import { NotificationModule } from './components/modules/NotificationModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { LibraryModule } from './components/modules/LibraryModule';
import { PlacementModule } from './components/modules/PlacementModule';
import { ProfileModule } from './components/modules/ProfileModule';
import { StudentServices } from './components/modules/StudentServices';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const unreadNotificationCount = 5;
  
  const handleNotificationClick = () => {
    setActiveTab('notifications');
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/request-verification" element={<RequestVerificationPage />} />
      <Route path="/*" element={
        !user ? <LoginForm /> : (
          <div className="min-h-screen bg-gray-100 flex">
            {/* Fixed Sidebar */}
            <div className="fixed left-0 top-0 h-full z-30">
              <Sidebar 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                collapsed={sidebarCollapsed}
                onCollapseChange={handleSidebarCollapse}
              />
            </div>
            
            {/* Main Content Area with dynamic left margin */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
              <Header 
                onNotificationClick={handleNotificationClick}
                unreadCount={unreadNotificationCount}
              />
              <main className="flex-1 p-6 overflow-y-auto">
                {(() => {
                  switch (activeTab) {
                    case 'dashboard':
                      switch (user.role) {
                        case 'student':
                          return <StudentDashboard />;
                        case 'faculty':
                          return <FacultyDashboard />;
                        case 'admin':
                          return <AdminDashboard />;
                        default:
                          return <StudentDashboard />;
                      }
                    case 'academic':
                      return <AcademicModule />;
                    case 'courses': // Faculty: My Courses, Admin: Course Management
                      return <CourseModule />;
                    case 'attendance': // Faculty only
                      return <AttendanceModule />;
                    case 'marks': // Faculty only
                      return <MarksModule />;
                    case 'students': // Faculty only
                      return <StudentModule />;
                    case 'schedule': // Faculty only
                      return <ScheduleModule />;
                    case 'notifications':
                      return <NotificationModule />;
                    case 'finance':
                      return <FinanceModule />;
                    case 'library':
                      return <LibraryModule />;
                    case 'placement':
                      return <PlacementModule />;
                    case 'profile':
                      return <ProfileModule />;
                    case 'services':
                      return <StudentServices />;
                    case 'analytics': // Admin only
                      // TODO: Replace with AnalyticsModule if available
                      return (
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Analytics</h2>
                          <p className="text-gray-600">This module is under development...</p>
                        </div>
                      );
                    case 'users': // Admin: User Management
                      return <UserManagement />;
                    case 'reports': // Admin only
                      // TODO: Replace with ReportsModule if available
                      return (
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reports</h2>
                          <p className="text-gray-600">This module is under development...</p>
                        </div>
                      );
                    case 'settings': // Admin only
                      // TODO: Replace with SettingsModule if available
                      return (
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Settings</h2>
                          <p className="text-gray-600">This module is under development...</p>
                        </div>
                      );
                    default:
                      return (
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                          <p className="text-gray-600">This module is under development...</p>
                        </div>
                      );
                  }
                })()}
              </main>
            </div>
          </div>
        )
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
