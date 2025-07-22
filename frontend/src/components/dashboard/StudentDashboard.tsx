import React from 'react';
import { Calendar, BookOpen, CreditCard, Trophy, FileText, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StudentDashboard() {
  const attendanceData = [
    { name: 'Present', value: 85, color: '#10B981' },
    { name: 'Absent', value: 15, color: '#EF4444' },
  ];

  const marksData = [
    { subject: 'Data Structures', marks: 85 },
    { subject: 'Algorithms', marks: 92 },
    { subject: 'Database Systems', marks: 78 },
    { subject: 'Web Development', marks: 88 },
    { subject: 'Operating Systems', marks: 82 },
  ];

  const upcomingEvents = [
    { title: 'Data Structures Quiz', date: '2024-01-25', type: 'exam' },
    { title: 'Web Development Assignment Due', date: '2024-01-28', type: 'assignment' },
    { title: 'Career Fair', date: '2024-02-01', type: 'event' },
    { title: 'Mid-term Exams Begin', date: '2024-02-05', type: 'exam' },
  ];

  const quickStats = [
    { title: 'Overall Attendance', value: '85%', icon: Clock, color: 'text-green-600' },
    { title: 'CGPA', value: '8.4', icon: Trophy, color: 'text-blue-600' },
    { title: 'Pending Fees', value: '₹0', icon: CreditCard, color: 'text-green-600' },
    { title: 'Library Books', value: '2', icon: BookOpen, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {attendanceData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Marks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marksData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="marks" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'exam' ? 'bg-red-500' : 
                      event.type === 'assignment' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <FileText className="w-6 h-6 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">Apply for Certificate</p>
                <p className="text-sm text-gray-500">Bonafide, No Dues</p>
              </button>
              <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <CreditCard className="w-6 h-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">Pay Fees</p>
                <p className="text-sm text-gray-500">Online Payment</p>
              </button>
              <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                <BookOpen className="w-6 h-6 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900">Library</p>
                <p className="text-sm text-gray-500">Search & Issue Books</p>
              </button>
              <button className="p-4 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                <Trophy className="w-6 h-6 text-orange-600 mb-2" />
                <p className="font-medium text-gray-900">Placements</p>
                <p className="text-sm text-gray-500">Job Opportunities</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}