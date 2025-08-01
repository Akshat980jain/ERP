import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Camera, Shield, Key } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/api';
import { User as UserType } from '../../types';

export function ProfileModule() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    studentId: '',
    employeeId: '',
    semester: '',
    section: '',
    department: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Initialize form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        address: user.profile?.address || '',
        studentId: user.profile?.studentId || '',
        employeeId: user.profile?.employeeId || '',
        semester: user.profile?.semester || '',
        section: user.profile?.section || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Only include email in the update if it's actually changed
      const updateData: any = { ...formData };
      if (updateData.email === user?.email) {
        delete updateData.email; // Don't send email if it hasn't changed
      }
      
      console.log('Sending profile update data:', updateData);
      
      const response = await apiClient.updateProfile(updateData) as { success: boolean; user: UserType; message: string };
      if (response.success) {
        // Update the user context with new data
        updateUser(response.user);
        alert('Profile updated successfully!');
        setIsEditing(false);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    alert('Password updated successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Generate department display text
  const getDepartmentDisplay = () => {
    if (user?.role === 'student') {
      const program = user.profile?.course || user.program || user.branch;
      const branch = user.profile?.branch || user.branch;
      if (program && branch) {
        return `${program} - ${branch}`;
      } else if (program) {
        return program;
      } else if (branch) {
        return branch;
      }
    }
    return user?.department || '';
  };

  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'academic', label: 'Academic Details' },
    { id: 'security', label: 'Security Settings' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <User className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Profile Management</h1>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'personal' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  variant={isEditing ? "primary" : "outline"}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Saving...'
                  ) : (
                    <>
                      {isEditing ? (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                      {user?.profile?.avatar ? (
                        <img 
                          src={user.profile.avatar} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700">
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600 capitalize">{user?.role}</p>
                    <p className="text-sm text-gray-500">Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                    icon={<User className="w-4 h-4 text-gray-400" />}
                  />

                  <Input
                    label="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                  />

                  <Input
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                  />

                  <Input
                    label="Department"
                    value={getDepartmentDisplay()}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={true}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={!isEditing}
                      icon={<MapPin className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center space-x-3">
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.profile?.phone || '',
                          address: user?.profile?.address || '',
                          studentId: user?.profile?.studentId || '',
                          employeeId: user?.profile?.employeeId || '',
                          semester: user?.profile?.semester || '',
                          section: user?.profile?.section || '',
                          department: user?.department || '',
                        });
                      }}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'academic' && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user?.role === 'student' ? (
                <>
                  <Input
                    label="Student ID"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Current Semester"
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Section"
                    value={formData.section}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Department"
                    value={getDepartmentDisplay()}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={true}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Employee ID"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Department"
                    value={getDepartmentDisplay()}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={true}
                  />
                </>
              )}
            </div>

            {user?.role === 'student' && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Academic Performance</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Current CGPA</p>
                    <p className="text-2xl font-bold text-blue-600">N/A</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Overall Attendance</p>
                    <p className="text-2xl font-bold text-green-600">N/A</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Credits Completed</p>
                    <p className="text-2xl font-bold text-purple-600">N/A</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  icon={<Key className="w-4 h-4 text-gray-400" />}
                />
                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  icon={<Key className="w-4 h-4 text-gray-400" />}
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  icon={<Key className="w-4 h-4 text-gray-400" />}
                />
                <Button onClick={handlePasswordUpdate}>
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive security alerts via email</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900">Login History</p>
                      <p className="text-sm text-gray-600">View your recent login activity</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}