import React, { useState } from 'react';
import { Calendar, BookOpen, TrendingUp, Award, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

export function AcademicModule() {
  const [activeTab, setActiveTab] = useState('attendance');

  const courses = [
    { id: 'CS101', name: 'Data Structures', credits: 4, faculty: 'Dr. Smith', attendance: 85 },
    { id: 'CS102', name: 'Algorithms', credits: 3, faculty: 'Prof. Johnson', attendance: 92 },
    { id: 'CS103', name: 'Database Systems', credits: 4, faculty: 'Dr. Wilson', attendance: 78 },
    { id: 'CS104', name: 'Web Development', credits: 3, faculty: 'Prof. Brown', attendance: 88 },
  ];

  const marks = [
    { course: 'Data Structures', type: 'Mid-term', marks: 85, total: 100, date: '2024-01-15' },
    { course: 'Algorithms', type: 'Assignment 1', marks: 92, total: 100, date: '2024-01-12' },
    { course: 'Database Systems', type: 'Quiz 1', marks: 18, total: 20, date: '2024-01-10' },
    { course: 'Web Development', type: 'Project', marks: 88, total: 100, date: '2024-01-08' },
  ];

  const schedule = [
    { time: '9:00 AM', monday: 'Data Structures', tuesday: 'Algorithms', wednesday: 'Database', thursday: 'Web Dev', friday: 'Lab' },
    { time: '10:00 AM', monday: 'Math', tuesday: 'Physics', wednesday: 'Data Structures', thursday: 'Algorithms', friday: 'Lab' },
    { time: '11:00 AM', monday: 'Break', tuesday: 'Break', wednesday: 'Break', thursday: 'Break', friday: 'Break' },
    { time: '11:30 AM', monday: 'Database', tuesday: 'Web Dev', wednesday: 'Math', thursday: 'Physics', friday: 'Project' },
    { time: '12:30 PM', monday: 'Lab', tuesday: 'Lab', wednesday: 'Lab', thursday: 'Lab', friday: 'Project' },
  ];

  const tabs = [
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'marks', label: 'Marks & Grades', icon: Award },
    { id: 'schedule', label: 'Timetable', icon: Calendar },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{course.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Attendance</span>
                      <span className={`font-bold ${
                        course.attendance >= 85 ? 'text-green-600' : 
                        course.attendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {course.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          course.attendance >= 85 ? 'bg-green-500' : 
                          course.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${course.attendance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => {
                      const totalClasses = Math.floor(course.attendance / 0.85);
                      const presentClasses = Math.floor(totalClasses * (course.attendance / 100));
                      return (
                        <tr key={course.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{course.name}</div>
                            <div className="text-sm text-gray-500">{course.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{course.faculty}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{presentClasses}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{totalClasses}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{course.attendance}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              course.attendance >= 85 ? 'bg-green-100 text-green-800' : 
                              course.attendance >= 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {course.attendance >= 85 ? 'Good' : course.attendance >= 75 ? 'Warning' : 'Critical'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Marks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks Obtained</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Marks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {marks.map((mark, index) => {
                      const percentage = (mark.marks / mark.total) * 100;
                      const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : 'C';
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{mark.course}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.marks}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{mark.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{percentage.toFixed(1)}%</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              grade === 'A+' || grade === 'A' ? 'bg-green-100 text-green-800' : 
                              grade === 'B+' || grade === 'B' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mark.date}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'schedule' && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monday</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuesday</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wednesday</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thursday</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Friday</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((slot, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{slot.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slot.monday}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slot.tuesday}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slot.wednesday}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slot.thursday}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{slot.friday}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">Course Code: {course.id}</p>
                    <p className="text-sm text-gray-600 mb-1">Credits: {course.credits}</p>
                    <p className="text-sm text-gray-600 mb-4">Faculty: {course.faculty}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">Attendance</span>
                      <span className={`font-bold ${
                        course.attendance >= 85 ? 'text-green-600' : 
                        course.attendance >= 75 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {course.attendance}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Materials
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        Assignments
                      </Button>
                    </div>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-600 ml-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}