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
import { AssignmentModule } from './components/modules/AssignmentModule';
import { ExamModule } from './components/modules/ExamModule';
import { FeedbackModule } from './components/modules/FeedbackModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { SettingsModule } from './components/modules/SettingsModule';
import { TransportModule } from './components/modules/TransportModule';
import { HostelModule } from './components/modules/HostelModule';
import { ParentPortal } from './components/modules/ParentPortal';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
            {/* Sidebar */}
            <div className={mobileMenuOpen ? 'block md:block' : 'hidden md:block'}>
              <div className="fixed left-0 top-0 h-full z-40 md:z-30">
                <Sidebar 
                  activeTab={activeTab} 
                  onTabChange={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }} 
                  collapsed={sidebarCollapsed}
                  onCollapseChange={handleSidebarCollapse}
                />
              </div>
            </div>
            
            {/* Main Content Area with dynamic left margin */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'} ml-0`}>
              <Header 
                onNotificationClick={handleNotificationClick}
                unreadCount={unreadNotificationCount}
                onMenuClick={() => setMobileMenuOpen(true)}
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
                    case 'assignments': // Faculty and Students
                      return <AssignmentModule />;
                    case 'exams':
                      return <ExamModule />;
                    case 'feedback':
                      return <FeedbackModule />;
                    case 'calendar':
                      return <CalendarModule />;
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
                    case 'transport':
                      return <TransportModule />;
                    case 'hostel':
                      return <HostelModule />;
                    case 'parent':
                      return <ParentPortal />;
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
                      return <ReportsModule />;
                    case 'settings': // Admin only
                      return <SettingsModule />;
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