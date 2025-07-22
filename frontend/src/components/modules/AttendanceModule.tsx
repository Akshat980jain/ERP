// src/components/modules/AttendanceModule.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
}

interface AttendanceRecord {
  _id: string;
  student: Student;
  course: string;
  date: string;
  status: 'present' | 'absent';
  markedBy: string;
}

export function AttendanceModule() {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: 'present' | 'absent' }>({});
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchExistingAttendance();
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch {
      setError('Failed to fetch courses');
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch {
      setError('Failed to fetch students');
    }
    setLoading(false);
  };

  const fetchExistingAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance?course=${selectedCourse}&date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const attendanceMap: { [key: string]: 'present' | 'absent' } = {};
        data.attendance.forEach((record: AttendanceRecord) => {
          attendanceMap[record.student._id] = record.status;
        });
        setAttendance(attendanceMap);
      }
    } catch {
      console.log('No existing attendance found');
    }
  };

  const fetchAttendanceHistory = async () => {
    if (!selectedCourse) return;
    
    try {
      const res = await fetch(`/api/attendance/history?course=${selectedCourse}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceHistory(data.attendance);
      }
    } catch {
      setError('Failed to fetch attendance history');
    }
  };

  const markAttendance = (studentId: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedCourse || Object.keys(attendance).length === 0) {
      setError('Please select a course and mark attendance');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const attendanceData = Object.entries(attendance).map(([studentId, status]) => ({
        student: studentId,
        course: selectedCourse,
        date: selectedDate,
        status
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ attendance: attendanceData })
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Attendance marked successfully!');
      } else {
        setError(data.message || 'Failed to mark attendance');
      }
    } catch {
      setError('Failed to mark attendance');
    }
    setLoading(false);
  };

  const exportAttendance = async () => {
    if (!selectedCourse) return;

    try {
      const res = await fetch(`/api/attendance/export?course=${selectedCourse}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `attendance_${selectedCourse}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to export attendance');
    }
  };

  const getAttendanceStats = () => {
    const totalMarked = Object.keys(attendance).length;
    const presentCount = Object.values(attendance).filter(status => status === 'present').length;
    const absentCount = totalMarked - presentCount;
    const percentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

    return { totalMarked, presentCount, absentCount, percentage };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Attendance Marker</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {error && <div className="text-red-700 bg-red-50 p-3 rounded">{error}</div>}
      {success && <div className="text-green-700 bg-green-50 p-3 rounded">{success}</div>}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Choose a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportAttendance}
              disabled={!selectedCourse}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {selectedCourse && Object.keys(attendance).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalMarked}</div>
              <div className="text-sm text-blue-600">Total Marked</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{stats.presentCount}</div>
              <div className="text-sm text-green-600">Present</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{stats.absentCount}</div>
              <div className="text-sm text-red-600">Absent</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.percentage}%</div>
              <div className="text-sm text-purple-600">Attendance</div>
            </div>
          </div>
        )}

        {selectedCourse && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Students ({students.length})
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const newAttendance: { [key: string]: 'present' | 'absent' } = {};
                    students.forEach(student => {
                      newAttendance[student._id] = 'present';
                    });
                    setAttendance(newAttendance);
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => {
                    const newAttendance: { [key: string]: 'present' | 'absent' } = {};
                    students.forEach(student => {
                      newAttendance[student._id] = 'absent';
                    });
                    setAttendance(newAttendance);
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Mark All Absent
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div key={student._id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.studentId} • {student.email}</div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markAttendance(student._id, 'present')}
                      className={`flex items-center px-3 py-1 rounded ${
                        attendance[student._id] === 'present' 
                          ? 'bg-green-600 text-white' 
                          : 'border border-green-600 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Present
                    </button>
                    <button
                      onClick={() => markAttendance(student._id, 'absent')}
                      className={`flex items-center px-3 py-1 rounded ${
                        attendance[student._id] === 'absent' 
                          ? 'bg-red-600 text-white' 
                          : 'border border-red-600 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {students.length > 0 && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={submitAttendance}
                  disabled={loading || Object.keys(attendance).length === 0}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            )}
          </>
        )}

        {!selectedCourse && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Select a course to mark attendance</p>
          </div>
        )}
      </div>
    </div>
  );
}
