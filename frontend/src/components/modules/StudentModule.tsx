// src/components/modules/StudentModule.tsx
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Mail, Book, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../ui/Toast';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  year: number;
  courses: string[];
  attendance?: {
    present: number;
    total: number;
    percentage: number;
  };
  averageGrade?: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
}

export function StudentModule() {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    year: 1,
    password: ''
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    const safeStudents = Array.isArray(students) ? students : [];
    const filtered = safeStudents.filter(student =>
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  // Auto-dismiss toast after 2 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        setStudents([]);
      }
    } catch {
      setStudents([]);
    }
    setLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.courses)) {
        setCourses(data.courses);
      }
    } catch {
      // ignore
    }
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/auth/create-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStudent)
      });
      const data = await res.json();
      if (data.success) {
        setStudents([...students, data.student]);
        setNewStudent({ name: '', email: '', studentId: '', department: '', year: 1, password: '' });
        setShowAddForm(false);
      } else {
        setToastType('error');
        setToastMessage(data.message || 'Failed to add student');
        setShowToast(true);
      }
    } catch {
      setToastType('error');
      setToastMessage('Failed to add student');
      setShowToast(true);
    }
    setLoading(false);
  };

  const deleteStudent = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(students.filter(s => s._id !== studentId));
        setToastType('success');
        setToastMessage('Student deleted successfully!');
        setShowToast(true);
      } else {
        setToastType('error');
        setToastMessage(data.message || 'Failed to delete student');
        setShowToast(true);
      }
    } catch {
      setToastType('error');
      setToastMessage('Failed to delete student');
      setShowToast(true);
    }
  };

  const enrollStudent = async (studentId: string) => {
    if (!selectedCourse) {
      setToastType('error');
      setToastMessage('Please select a course first.');
      setShowToast(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${selectedCourse}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      });
      const data = await res.json();
      if (data.success) {
        setToastType('success');
        setToastMessage('Student added to course successfully!');
        setShowToast(true);
        // Update the student's courses array in local state
        setStudents(prev => prev.map(s =>
          s._id === studentId && !s.courses.includes(selectedCourse)
            ? { ...s, courses: [...s.courses, selectedCourse] }
            : s
        ));
      } else {
        setToastType('error');
        setToastMessage(data.message || 'Failed to add student to course');
        setShowToast(true);
      }
    } catch {
      setToastType('error');
      setToastMessage('Failed to add student to course');
      setShowToast(true);
    }
    setLoading(false);
  };

  // Helper to check if student is enrolled in selected course
  const isStudentEnrolled = (student: Student) => {
    if (!selectedCourse) return false;
    // Find the selected course in the courses array
    const course = courses.find(c => c._id === selectedCourse);
    if (!course) return false;
    // If student.courses is an array of course IDs, check for selectedCourse
    return Array.isArray(student.courses) && student.courses.includes(selectedCourse);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Students</h2>
        {user?.role !== 'student' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Student
          </button>
        )}
      </div>
      {(user?.role === 'faculty' || user?.role === 'admin') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Course to Add Students</label>
          <select
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
            className="w-full md:w-1/2 border rounded px-3 py-2"
          >
            <option value="">Choose a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.name} ({course.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Add New Student</h3>
          <form onSubmit={addStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Student ID"
                value={newStudent.studentId}
                onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Department"
                value={newStudent.department}
                onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="number"
                placeholder="Year"
                min="1"
                max="4"
                value={newStudent.year || ''}
                onChange={(e) => setNewStudent({ ...newStudent, year: parseInt(e.target.value) || 1 })}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>
                {loading ? 'Adding...' : 'Add Student'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name, email, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">Loading students...</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <div key={student._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {student.email}
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-1" />
                          {student.studentId}
                        </div>
                        <div className="flex items-center">
                          <Book className="w-4 h-4 mr-1" />
                          {student.department} - Year {student.year}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {student.attendance && (
                      <div className="text-right">
                        <div className="text-sm font-medium">Attendance</div>
                        <div className={`text-lg font-bold ${student.attendance.percentage >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                          {student.attendance.percentage}%
                        </div>
                      </div>
                    )}
                    {student.averageGrade && (
                      <div className="text-right">
                        <div className="text-sm font-medium">Grade</div>
                        <div className="text-lg font-bold text-blue-600">{student.averageGrade}</div>
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium">Courses</div>
                      <div className="text-lg font-bold text-purple-600">{student.courses?.length || 0}</div>
                    </div>
                   {(user?.role === 'faculty' || user?.role === 'admin') && (
                     isStudentEnrolled(student) ? (
                       <span className="ml-2 px-3 py-1 rounded bg-green-100 text-green-700 border border-green-300 text-xs font-semibold">Already Enrolled</span>
                     ) : (
                       <button
                         onClick={() => enrollStudent(student._id)}
                         className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 ml-2"
                         disabled={loading || !selectedCourse}
                       >
                         Add
                       </button>
                     )
                    )}
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => deleteStudent(student._id)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 border border-red-600 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredStudents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No students found matching your search' : 'No students available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
