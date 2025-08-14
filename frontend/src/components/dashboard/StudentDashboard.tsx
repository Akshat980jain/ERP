import React, { useEffect, useState } from 'react';
import { Calendar, BookOpen, CreditCard, Trophy, FileText, Clock, CheckCircle, AlertCircle, Clock as ClockIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/api';
import { Attendance, Marks, BookIssue } from '../../types';
import { Course } from '../../types';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    name: string;
    code: string;
  };
  startDate: string;
  dueDate: string;
  maxMarks: number;
  status: string;
  submissions?: Array<{
    student: {
      _id: string;
      name: string;
      studentId: string;
    };
    marks?: number;
    feedback?: string;
    status: string;
    submittedAt: string;
  }>;
}

export function StudentDashboard() {
  const { user, token } = useAuth();
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
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') return; // Only fetch for students
    async function fetchData() {
      setLoading(true);
      try {
        // Attendance (weighted: present = 100%, late = 50%, absent = 0%)
        const attendanceRes = await apiClient.getAttendance();
        let presentWeighted = 0, totalWeighted = 0;
        if (attendanceRes && attendanceRes.attendance) {
          attendanceRes.attendance.forEach((rec: any) => {
            const weight = typeof rec.lectureCount === 'number' && rec.lectureCount > 0 ? rec.lectureCount : 1;
            totalWeighted += weight;
            if (rec.status === 'present') presentWeighted += weight;
            else if (rec.status === 'late') presentWeighted += 0.5 * weight;
          });
        }
        const percentage = totalWeighted > 0 ? Math.round((presentWeighted / totalWeighted) * 100) : 0;
        const absentWeighted = Math.max(0, totalWeighted - presentWeighted);
        setAttendanceStats({ present: Number(presentWeighted.toFixed(1)), absent: Number(absentWeighted.toFixed(1)), percentage });

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
          // CGPA calculation based on marks
          if (marksArr.length > 0) {
            const avg = marksArr.reduce((a, b) => a + b.marks, 0) / marksArr.length;
            setCgpa((avg / 10).toFixed(2));
          } else {
            setCgpa('N/A');
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

        // Fetch assignments
        setAssignmentsLoading(true);
        setAssignmentsError('');
        try {
          const assignmentsRes = await fetch('/api/assignments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const assignmentsData = await assignmentsRes.json();
          if (assignmentsData.assignments) {
            setAssignments(assignmentsData.assignments);
          } else {
            setAssignments([]);
          }
        } catch {
          setAssignmentsError('Failed to load assignments.');
          setAssignments([]);
        }
        setAssignmentsLoading(false);
      } catch (e) {
        // handle error
      }
      setLoading(false);
    }
    fetchData();
  }, [user, token]);

  const quickStats = [
    { title: 'Overall Attendance', value: loading ? '...' : (attendanceStats.percentage > 0 ? attendanceStats.percentage + '%' : 'N/A'), icon: Clock, color: 'text-green-600' },
    { title: 'CGPA', value: loading ? '...' : cgpa, icon: Trophy, color: 'text-blue-600' },
    { title: 'Active Assignments', value: loading ? '...' : assignments.filter(a => {
      const now = new Date();
      const startDate = new Date(a.startDate);
      const dueDate = new Date(a.dueDate);
      return now >= startDate && now <= dueDate;
    }).length.toString(), icon: FileText, color: 'text-orange-600' },
    { title: 'Library Books', value: loading ? '...' : libraryBooks.toString(), icon: BookOpen, color: 'text-purple-600' },
  ];

  const attendanceData = [
    { name: 'Present', value: attendanceStats.present, color: '#10B981' },
    { name: 'Absent', value: attendanceStats.absent, color: '#EF4444' },
  ];

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const startDate = new Date(assignment.startDate);
    
    // Check if student has submitted
    const hasSubmitted = assignment.submissions?.some(sub => 
      sub.student._id === user?._id && sub.status === 'submitted'
    );
    
    if (hasSubmitted) {
      return { status: 'submitted', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
    }
    
    if (now < startDate) {
      return { status: 'not-started', icon: ClockIcon, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
    
    if (now > dueDate) {
      return { status: 'overdue', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' };
    }
    
    return { status: 'active', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  };

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
            <div className="relative h-64">
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
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-3xl font-bold text-green-600">
                  {loading ? '...' : `${attendanceStats.percentage}%`}
                </div>
              </div>
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
                <p className="font-medium text-gray-900">View Assignments</p>
                <p className="text-sm text-gray-500">Submit & Track</p>
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

      {/* Assignments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignmentsLoading ? (
            <div className="text-gray-500">Loading assignments...</div>
          ) : assignmentsError ? (
            <div className="text-red-500">{assignmentsError}</div>
          ) : assignments.length === 0 ? (
            <div className="text-gray-500">No assignments found.</div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment) => {
                const statusInfo = getAssignmentStatus(assignment);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={assignment._id} className={`p-4 rounded-lg border ${statusInfo.bgColor}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} bg-white`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.status === 'submitted' ? 'Submitted' :
                             statusInfo.status === 'overdue' ? 'Overdue' :
                             statusInfo.status === 'active' ? 'Active' : 'Not Started'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Course: {assignment.course.name}</span>
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          <span>Max Marks: {assignment.maxMarks}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {assignments.length > 5 && (
                <div className="text-center pt-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All Assignments →
                  </button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}