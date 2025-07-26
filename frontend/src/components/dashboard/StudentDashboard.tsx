import React, { useEffect, useState } from 'react';
import { Calendar, BookOpen, CreditCard, Trophy, FileText, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/api';
import { Attendance, Marks, BookIssue } from '../../types';
import { Course } from '../../types';

export function StudentDashboard() {
  const { user } = useAuth();
  const [attendanceStats, setAttendanceStats] = useState<{ present: number; absent: number; percentage: number }>({ present: 0, absent: 0, percentage: 0 });
  const [marksData, setMarksData] = useState<{ subject: string; marks: number }[]>([]);
  const [cgpa, setCgpa] = useState<string>('N/A');
  const [pendingFees, setPendingFees] = useState<string>('N/A');
  const [libraryBooks, setLibraryBooks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<{ title: string; date: string; type: string }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Attendance
        const attendanceRes = await apiClient.getAttendance();
        let present = 0, absent = 0, total = 0;
        if (attendanceRes && attendanceRes.attendance) {
          attendanceRes.attendance.forEach((rec: Attendance) => {
            if (rec.status === 'present') present++;
            if (rec.status === 'absent') absent++;
            total++;
          });
        }
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
        setAttendanceStats({ present, absent, percentage });

        // Marks
        const marksRes = await apiClient.getMarks();
        if (marksRes && marksRes.marks) {
          // Group by subject and average if needed
          const grouped: { [subject: string]: number[] } = {};
          marksRes.marks.forEach((m: Marks) => {
            if (!grouped[m.title]) grouped[m.title] = [];
            grouped[m.title].push(m.marksObtained);
          });
          const marksArr = Object.entries(grouped).map(([subject, arr]) => ({ subject, marks: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }));
          setMarksData(marksArr);
          // CGPA (simple average for demo)
          if (marksArr.length > 0) {
            const avg = marksArr.reduce((a, b) => a + b.marks, 0) / marksArr.length;
            setCgpa((avg / 10).toFixed(2));
          }
        }

        // Fees
        const feesRes = await apiClient.getFees();
        if (feesRes && Array.isArray(feesRes.fees)) {
          const pending = feesRes.fees.filter((f: any) => f.status !== 'paid').reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
          setPendingFees(`₹${pending}`);
        }

        // Library books
        const issuesRes = await apiClient.getBookIssues();
        if (issuesRes && Array.isArray(issuesRes.issues)) {
          setLibraryBooks(issuesRes.issues.filter((b: BookIssue) => b.status === 'issued').length);
        }

        // Upcoming events (fallback: use notifications or leave empty)
        setUpcomingEvents([]); // You can fetch notifications and filter for events if needed

        // Fetch enrolled courses
        setCoursesLoading(true);
        setCoursesError('');
        try {
          const coursesRes = await apiClient.getMyCourses();
          setCourses(Array.isArray(coursesRes.courses) ? coursesRes.courses : []);
        } catch {
          setCoursesError('Failed to load courses.');
          setCourses([]);
        }
        setCoursesLoading(false);
      } catch (e) {
        // handle error
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const quickStats = [
    { title: 'Overall Attendance', value: loading ? '...' : attendanceStats.percentage + '%', icon: Clock, color: 'text-green-600' },
    { title: 'CGPA', value: loading ? '...' : cgpa, icon: Trophy, color: 'text-blue-600' },
    { title: 'Pending Fees', value: loading ? '...' : pendingFees, icon: CreditCard, color: 'text-green-600' },
    { title: 'Library Books', value: loading ? '...' : libraryBooks.toString(), icon: BookOpen, color: 'text-purple-600' },
  ];

  const attendanceData = [
    { name: 'Present', value: attendanceStats.present, color: '#10B981' },
    { name: 'Absent', value: attendanceStats.absent, color: '#EF4444' },
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
                  <span className="text-sm text-gray-600">{entry.name}: {loading ? '...' : entry.value}</span>
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
              {upcomingEvents.length === 0 && <div className="text-gray-500">No upcoming events.</div>}
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

      {/* Enrolled Courses Section */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="text-gray-500">Loading courses...</div>
          ) : coursesError ? (
            <div className="text-red-500">{coursesError}</div>
          ) : courses.length === 0 ? (
            <div className="text-gray-500">No enrolled courses found.</div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {courses.map((course) => (
                <li key={course.id || course.code} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="font-medium text-gray-900">{course.name}</span>
                  <span className="text-sm text-gray-600">{course.code}</span>
                  <span className="text-sm text-gray-600">Credits: {course.credits}</span>
                  <span className="text-sm text-gray-600">Faculty: {typeof course.faculty === 'string' ? course.faculty : (course.faculty?.name || '')}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}