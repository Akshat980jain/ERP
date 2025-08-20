import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  BookOpen, 
  CreditCard, 
  Trophy, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Clock as ClockIcon,
  GraduationCap,
  Bell,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '../ui/Card';
import { QuickActionButton } from '../ui/Button';
import { DataTable } from '../ui/DataTable';
import { ChartCard } from '../ui/ChartCard';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/api';
import { Marks, BookIssue } from '../../types';
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
  const [libraryBooks, setLibraryBooks] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState<{ title: string; date: string; type: string }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    async function fetchData() {
      setLoading(true);
      try {
        // Attendance (weighted: present = 100%, late = 50%, absent = 0%)
        const attendanceRes = await apiClient.getAttendance();
        let presentWeighted = 0, totalWeighted = 0;
        if (attendanceRes && typeof attendanceRes === 'object' && 'attendance' in attendanceRes && Array.isArray(attendanceRes.attendance)) {
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
        if (marksRes && typeof marksRes === 'object' && 'marks' in marksRes && Array.isArray(marksRes.marks)) {
          const grouped: { [subject: string]: number[] } = {};
          marksRes.marks.forEach((m: Marks) => {
            if (!grouped[m.title]) grouped[m.title] = [];
            grouped[m.title].push(m.marksObtained);
          });
          const marksArr = Object.entries(grouped).map(([subject, arr]) => ({ subject, marks: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }));
          setMarksData(marksArr);
          if (marksArr.length > 0) {
            const avg = marksArr.reduce((a, b) => a + b.marks, 0) / marksArr.length;
            setCgpa((avg / 10).toFixed(2));
          } else {
            setCgpa('N/A');
          }
        }

        // Library books
        const issuesRes = await apiClient.getBookIssues();
        if (issuesRes && typeof issuesRes === 'object' && 'issues' in issuesRes && Array.isArray(issuesRes.issues)) {
          setLibraryBooks(issuesRes.issues.filter((b: BookIssue) => b.status === 'issued').length);
        }

        // Upcoming events
        setUpcomingEvents([]);

        // Fetch enrolled courses
        try {
          const coursesRes = await apiClient.getMyCourses();
          if (coursesRes && typeof coursesRes === 'object' && 'courses' in coursesRes && Array.isArray(coursesRes.courses)) {
            setCourses(coursesRes.courses);
          } else {
            setCourses([]);
          }
        } catch {
          setCourses([]);
        }

        // Fetch assignments
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
          setAssignments([]);
        }
              } catch {
          // handle error
        }
      setLoading(false);
    }
    fetchData();
  }, [user, token]);

  const quickStats = [
    { 
      title: 'Overall Attendance', 
      value: loading ? '...' : (attendanceStats.percentage > 0 ? attendanceStats.percentage + '%' : 'N/A'), 
      icon: Clock, 
      trend: (attendanceStats.percentage > 75 ? 'up' : 'neutral') as const,
      trendValue: attendanceStats.percentage > 75 ? 'Good' : 'Needs improvement'
    },
    { 
      title: 'CGPA', 
      value: loading ? '...' : cgpa, 
      icon: Trophy, 
      trend: (cgpa !== 'N/A' && parseFloat(cgpa) > 7.5 ? 'up' : 'neutral') as const,
      trendValue: cgpa !== 'N/A' && parseFloat(cgpa) > 7.5 ? 'Excellent' : 'Keep going'
    },
    { 
      title: 'Active Assignments', 
      value: loading ? '...' : assignments.filter(a => {
        const now = new Date();
        const startDate = new Date(a.startDate);
        const dueDate = new Date(a.dueDate);
        return now >= startDate && now <= dueDate;
      }).length.toString(), 
      icon: FileText, 
      trend: 'neutral' as const,
      trendValue: 'Current'
    },
    { 
      title: 'Library Books', 
      value: loading ? '...' : libraryBooks.toString(), 
      icon: BookOpen, 
      trend: 'neutral' as const,
      trendValue: 'Issued'
    },
  ];

  const attendanceData = [
    { name: 'Present', value: attendanceStats.present, color: '#10B981' },
    { name: 'Absent', value: attendanceStats.absent, color: '#EF4444' },
  ];

  const getAssignmentStatus = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const startDate = new Date(assignment.startDate);
    
    const hasSubmitted = assignment.submissions?.some(sub => 
      sub.student._id === user?._id && sub.status === 'submitted'
    );
    
    if (hasSubmitted) {
      return { status: 'submitted', icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Submitted' };
    }
    
    if (now < startDate) {
      return { status: 'not-started', icon: ClockIcon, color: 'text-gray-600', bgColor: 'bg-gray-50', label: 'Not Started' };
    }
    
    if (now > dueDate) {
      return { status: 'overdue', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Overdue' };
    }
    
    return { status: 'active', icon: ClockIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Active' };
  };

  const courseColumns = [
    { key: 'name', header: 'Course Name', width: '40' },
    { key: 'code', header: 'Course Code', width: '20' },
    { key: 'credits', header: 'Credits', width: '15' },
    { key: 'faculty', header: 'Faculty', width: '25' },
  ];

  const assignmentColumns = [
    { 
      key: 'title', 
      header: 'Assignment', 
      render: (value: string, item: Assignment) => (
        <div className="flex items-center space-x-3">
          <FileText className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{value}</span>
        </div>
      )
    },
    { key: 'course.name', header: 'Course' },
    { 
      key: 'dueDate', 
      header: 'Due Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'maxMarks', 
      header: 'Max Marks',
      render: (value: number) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value: string, item: Assignment) => {
        const statusInfo = getAssignmentStatus(item);
        const StatusIcon = statusInfo.icon;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.bgColor}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, item: Assignment) => (
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // Implement navigation or modal opening
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50/30 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Student'}! 👋</h1>
            <p className="text-blue-100">Here's what's happening with your academic journey today.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Attendance Overview" 
          subtitle="Your attendance performance this semester"
          variant="elevated"
        >
          <div className="relative h-64 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {loading ? '...' : `${attendanceStats.percentage}%`}
                </div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </div>
        </ChartCard>

        <ChartCard 
          title="Academic Performance" 
          subtitle="Your marks across subjects"
          variant="elevated"
        >
          <div className="h-64 p-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="subject" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  stroke="#6b7280"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="marks" 
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionButton
          icon={FileText}
          title="Assignments"
          subtitle="View & Submit"
          variant="primary"
          onClick={() => handleQuickAction('assignments')}
        />
        <QuickActionButton
          icon={CreditCard}
          title="Pay Fees"
          subtitle="Online Payment"
          variant="success"
          onClick={() => handleQuickAction('fees')}
        />
        <QuickActionButton
          icon={BookOpen}
          title="Library"
          subtitle="Search & Issue"
          variant="secondary"
          onClick={() => handleQuickAction('library')}
        />
        <QuickActionButton
          icon={Trophy}
          title="Placements"
          subtitle="Job Opportunities"
          variant="warning"
          onClick={() => handleQuickAction('placements')}
        />
      </div>

      {/* Recent Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Assignments</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
            View All →
          </button>
        </div>
        <DataTable
          data={assignments.slice(0, 5)}
          columns={assignmentColumns}
          searchable={false}
          pagination={false}
          className="shadow-sm"
        />
      </div>

      {/* Enrolled Courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Enrolled Courses</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline">
            View All →
          </button>
        </div>
        <DataTable
          data={courses}
          columns={courseColumns}
          searchable={true}
          pagination={true}
          itemsPerPage={5}
          className="shadow-sm"
        />
      </div>

      {/* Upcoming Events */}
      <Card variant="gradient" className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-purple-900">Upcoming Events</CardTitle>
              <p className="text-sm text-purple-700">Stay updated with important dates</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-purple-600 font-medium">No upcoming events</p>
              <p className="text-purple-500 text-sm">Check back later for updates</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/60 rounded-lg border border-purple-200/60">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'exam' ? 'bg-red-500' : 
                      event.type === 'assignment' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-purple-900">{event.title}</p>
                      <p className="text-sm text-purple-700">{event.date}</p>
                    </div>
                  </div>
                  <Bell className="w-4 h-4 text-purple-400" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}