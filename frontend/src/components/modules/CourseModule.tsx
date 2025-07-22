// src/components/modules/CourseModule.tsx
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Course {
  _id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  faculty: string;
  students: string[];
  schedule: {
    day: string;
    time: string;
  }[];
}

export function CourseModule() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    department: '',
    credits: 0,
    schedule: [{ day: '', time: '' }]
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      } else {
        setError(data.message || 'Failed to fetch courses');
      }
    } catch {
      setError('Failed to fetch courses');
    }
    setLoading(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if (data.success) {
        setCourses([...courses, data.course]);
        setNewCourse({ name: '', code: '', department: '', credits: 0, schedule: [{ day: '', time: '' }] });
        setShowAddForm(false);
        setSuccess('Course added successfully!');
      } else {
        setError(data.message || 'Failed to add course');
      }
    } catch {
      setError('Failed to add course');
    }
    setLoading(false);
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/courses/${editingCourse._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCourse)
      });
      const data = await res.json();
      if (data.success) {
        setCourses(courses.map(course => 
          course._id === editingCourse._id ? data.course : course
        ));
        setEditingCourse(null);
        setNewCourse({ name: '', code: '', department: '', credits: 0, schedule: [{ day: '', time: '' }] });
        setShowAddForm(false);
        setSuccess('Course updated successfully!');
      } else {
        setError(data.message || 'Failed to update course');
      }
    } catch {
      setError('Failed to update course');
    }
    setLoading(false);
  };

  const deleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(courses.filter(course => course._id !== courseId));
        setSuccess('Course deleted successfully!');
      } else {
        setError(data.message || 'Failed to delete course');
      }
    } catch {
      setError('Failed to delete course');
    }
  };

  const startEditing = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      name: course.name,
      code: course.code,
      department: course.department,
      credits: course.credits,
      schedule: course.schedule
    });
    setShowAddForm(true);
  };

  if (loading && courses.length === 0) return <div className="p-4">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
        {user?.role !== 'student' && (
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingCourse(null);
              setNewCourse({ name: '', code: '', department: '', credits: 0, schedule: [{ day: '', time: '' }] });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {editingCourse ? 'Cancel Edit' : 'Add Course'}
          </button>
        )}
      </div>

      {error && <div className="text-red-700 bg-red-50 p-3 rounded">{error}</div>}
      {success && <div className="text-green-700 bg-green-50 p-3 rounded">{success}</div>}

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </h3>
          <form onSubmit={editingCourse ? handleEditCourse : handleAddCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Course Name"
                value={newCourse.name}
                onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Course Code"
                value={newCourse.code}
                onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Department"
                value={newCourse.department}
                onChange={(e) => setNewCourse({ ...newCourse, department: e.target.value })}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="number"
                placeholder="Credits"
                value={newCourse.credits || ''}
                onChange={(e) => setNewCourse({ ...newCourse, credits: parseInt(e.target.value) || 0 })}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled={loading}>
                {loading ? (editingCourse ? 'Updating...' : 'Adding...') : (editingCourse ? 'Update Course' : 'Add Course')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCourse(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.code}</p>
                </div>
              </div>
              {user?.role !== 'student' && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEditing(course)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCourse(course._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="font-medium">Department:</span>
                <span className="ml-2">{course.department}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Credits:</span>
                <span className="ml-2">{course.credits}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{course.students?.length || 0} Students</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses available</p>
        </div>
      )}
    </div>
  );
}
