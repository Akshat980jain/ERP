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
import { StudentServices } from './components/modules/StudentServices';
import { NotificationModule } from './components/modules/NotificationModule';
import { FinanceModule } from './components/modules/FinanceModule';
import { LibraryModule } from './components/modules/LibraryModule';
import { PlacementModule } from './components/modules/PlacementModule';
import { ProfileModule } from './components/modules/ProfileModule';
import UserManagement from './components/modules/UserManagement';
import RequestVerificationPage from './components/auth/RequestVerificationPage';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const unreadNotificationCount = 5;
  const handleNotificationClick = () => {
    setActiveTab('notifications');
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
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 flex flex-col">
              <Header 
                onNotificationClick={handleNotificationClick}
                unreadCount={unreadNotificationCount}
              />
              <main className="flex-1 p-6">
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
                    case 'finance':
                      return <FinanceModule />;
                    case 'library':
                      return <LibraryModule />;
                    case 'placement':
                      return <PlacementModule />;
                    case 'services':
                      return <StudentServices />;
                    case 'profile':
                      return <ProfileModule />;
                    case 'notifications':
                      return <NotificationModule />;
                    case 'users':
                      return <UserManagement />;
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